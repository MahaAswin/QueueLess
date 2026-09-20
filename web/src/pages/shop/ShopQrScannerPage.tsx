import React from 'react';
import { ShopPickupVerificationPage } from './ShopPickupVerificationPage';

/**
 * Backward compatibility alias for ShopPickupVerificationPage.
 * QR functionality has been removed in favor of direct 6-digit Pickup OTP verification.
 */
export const ShopQrScannerPage: React.FC = () => {
  return <ShopPickupVerificationPage />;
};
