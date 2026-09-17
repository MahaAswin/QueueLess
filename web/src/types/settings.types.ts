export interface TrustSettings {
  userSuspensionThreshold: number;
  shopSuspensionThreshold: number;
  minThreshold: number;
  maxThreshold: number;
}

export interface PickupSettings {
  qrExpirationMinutes: number;
  minExpirationMinutes: number;
  maxExpirationMinutes: number;
}

export interface PlatformSpecs {
  defaultAdminEmail: string;
  accessTokenExpirationMinutes: number;
  refreshTokenExpirationDays: number;
  corsAllowedOrigins: string;
  databaseEngine: string;
  environment: string;
}

export interface AdminSystemSettingsResponse {
  trustSettings: TrustSettings;
  pickupSettings: PickupSettings;
  platformSpecs: PlatformSpecs;
  lastUpdatedAt: string | null;
  lastUpdatedBy: string | null;
}

export interface UpdateSystemSettingsRequest {
  userSuspensionThreshold: number;
  shopSuspensionThreshold: number;
  qrExpirationMinutes: number;
}
