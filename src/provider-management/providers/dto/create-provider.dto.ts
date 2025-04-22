import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  Matches,
} from 'class-validator';
export class CreateProviderDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  @Matches(
    /^https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)?(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?$/,
    {
      message:
        'API base URL must be a valid URL with http/https protocol (e.g., https://api.example.com)',
    },
  )
  apiBaseUrl?: string;
}
