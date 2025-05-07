function hideModal(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('hidden');
  }
}

function showNotification(type, message) {
  switch (type) {
    case 'success':
      displayNotification('success', message);
      break;
    case 'error':
      displayNotification('error', message);
      break;
    case 'info':
      displayNotification('info', message);
      break;
    default:
      displayNotification('default', message);
  }

  function displayNotification(type, message) {
    // TODO: add classes for different types of notifications
    const notification = document.getElementById('notification');
    notification.classList.add(type);
    notification.classList.remove('hidden');
    notification.textContent = message;

    setTimeout(() => {
      notification.classList.remove(type);
      notification.classList.add('hidden');
      notification.textContent = '';
    }, 3000);
  }
}
