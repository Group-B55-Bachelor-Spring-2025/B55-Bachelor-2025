document.addEventListener('DOMContentLoaded', function () {
  const importForm = document.getElementById('importDevicesForm');
  const deviceSelectionSection = document.getElementById(
    'deviceSelectionSection',
  );
  const providerAuthSection = document.getElementById('providerAuthSection');
  const deviceList = document.getElementById('deviceList');
  const devicesLoading = document.getElementById('devicesLoading');
  const noDevicesMessage = document.getElementById('noDevicesMessage');
  const importSelectedButton = document.getElementById('importSelectedDevices');
  const providerAuthForm = document.getElementById('providerAuthForm');
  const authErrorMessage = document.getElementById('authErrorMessage');

  importForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const providerId = document.getElementById('provider').value;

    deviceSelectionSection.classList.remove('hidden');
    devicesLoading.classList.remove('hidden');
    deviceList.innerHTML = '';
    noDevicesMessage.classList.add('hidden');
    importSelectedButton.classList.add('hidden');
    providerAuthSection.classList.add('hidden');

    try {
      const response = await fetch(
        `/providers/${providerId}/provider-devices`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'same-origin',
        },
      );

      if (response.status === 401) {
        // Handle 401 Unauthorized response
        const errorData = await response.json();

        deviceSelectionSection.classList.add('hidden');

        providerAuthSection.classList.remove('hidden');
        document.getElementById('authProviderId').value = providerId;

        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      const devices = await response.json();

      // hide importForm and loading indicator
      devicesLoading.classList.add('hidden');
      importForm.classList.add('hidden');

      if (devices.length === 0) {
        noDevicesMessage.classList.remove('hidden');
        return;
      }

      //device list with checkboxes
      devices.forEach((device) => {
        const deviceItem = document.createElement('div');
        deviceItem.className =
          'flex items-center py-2 border-b border-gray-100';

        const deviceId = `device-${device.id}`;
        deviceItem.innerHTML = `
          <input type="checkbox" id="${deviceId}" name="devices[]" value="${device.id}" class="mr-3">
          <label for="${deviceId}" class="flex-grow">
            <div class="font-medium">${device.name}</div>
            <div class="text-sm text-gray-500">${device.type || 'Climate device'}</div>
          </label>
        `;

        // Store the full device object as a data attribute
        deviceItem.dataset.deviceData = JSON.stringify(device);

        deviceList.appendChild(deviceItem);
      });

      // import button
      importSelectedButton.classList.remove('hidden');
    } catch (error) {
      console.error('Error fetching provider devices:', error);
      devicesLoading.classList.add('hidden');
      importForm.classList.add('hidden');
      deviceList.innerHTML = `
        <div class="text-red-500 py-2 text-center">
          Failed to load devices
        </div>
      `;
    }
  });

  // Handle provider authentication
  providerAuthForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const providerId = document.getElementById('authProviderId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`/provider-credentials/${providerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to provider');
      }

      // Success! Hide auth form and retry device fetch
      providerAuthSection.classList.add('hidden');
      const deviceFetchEvent = new Event('submit');
      importForm.dispatchEvent(deviceFetchEvent);
    } catch (error) {
      console.error('Error connecting to provider:', error);
      authErrorMessage.textContent = error.message;
    }
  });

  // Handle the import of selected devices
  importSelectedButton.addEventListener('click', async function () {
    const deviceGroupId = document.querySelector(
      'input[name="deviceGroupId"]',
    ).value;
    const providerId = document.getElementById('provider').value;

    const selectedDeviceElements = Array.from(
      document.querySelectorAll('#deviceList input[type="checkbox"]:checked'),
    );

    const selectedDevices = selectedDeviceElements
      .map((checkbox) => {
        // Get the parent element that contains the data attribute
        const deviceItem = checkbox.closest('div');
        try {
          return JSON.parse(deviceItem.dataset.deviceData);
        } catch (e) {
          console.error('Error parsing device data:', e);
          return null;
        }
      })
      .filter((device) => device !== null);

    if (selectedDevices.length > 0) {
      importSelectedButton.disabled = true;
      importSelectedButton.innerHTML =
        '<span class="mr-2">Importing...</span><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></div>';

      let successCount = 0;
      let errorCount = 0;

      try {
        let providerCredentialsId;

        try {
          // Fetch provider credentials
          const credentialsResponse = await fetch(
            `/provider-credentials/provider/${providerId}/user`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
              },
              credentials: 'same-origin',
            },
          );

          if (!credentialsResponse.ok) {
            throw new Error('Failed to get provider credentials');
          }

          const credentials = await credentialsResponse.json();
          providerCredentialsId = credentials.id;

          if (!providerCredentialsId) {
            throw new Error('No valid credentials found for this provider');
          }
        } catch (credError) {
          console.error('Error retrieving provider credentials:', credError);
          showNotification(
            'error',
            'Failed to get provider credentials. Please try authenticating with the provider first.',
          );
          importSelectedButton.disabled = false;
          importSelectedButton.innerHTML = 'Import Selected Devices';
          return;
        }

        // Process devices in sequence to avoid race conditions
        for (const device of selectedDevices) {
          const deviceData = {
            name: device.name,
            type: device.subDomainId,
            deviceGroupId: parseInt(deviceGroupId),
            providerCredentialsId: providerCredentialsId,
            externalRef: device.id.toString(),
            status: device.offline ? 'offline' : 'online',
            settings: JSON.stringify(device),
            targetTemperature: device.targetTemperature,
          };

          try {
            const response = await fetch('/devices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              credentials: 'same-origin',
              body: JSON.stringify(deviceData),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              console.error('Failed to import device:', await response.json());
            }
          } catch (error) {
            errorCount++;
            console.error('Error importing device:', error);
          }
        }

        // Show results
        if (successCount > 0 && errorCount === 0) {
          showNotification(
            'success',
            `Successfully imported ${successCount} devices`,
          );
          setTimeout(() => {
            window.location.href = `/device-groups/${deviceGroupId}`; // Redirect to device group page
          }, 1000);
        } else if (successCount > 0 && errorCount > 0) {
          showNotification(
            'warning',
            `Imported ${successCount} devices, ${errorCount} failed`,
          );
        } else {
          showNotification('error', 'Failed to import devices');
        }
      } catch (error) {
        console.error('Error during device import:', error);
        showNotification('error', 'An error occurred during import');
      } finally {
        importSelectedButton.disabled = false;
        importSelectedButton.innerHTML = 'Import Selected Devices';
      }
    } else {
      showNotification(
        'warning',
        'Please select at least one device to import',
      );
    }
  });
});
