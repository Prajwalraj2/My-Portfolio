/**
 * TOTP (Time-based One-Time Password) Utilities
 * 
 * This file contains utilities for two-factor authentication using TOTP.
 * Currently COMMENTED OUT - will be enabled when 2FA is needed.
 * 
 * Usage with Google Authenticator, Authy, etc.
 */

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

// ============================================
// TOTP IMPLEMENTATION (COMMENTED FOR LATER USE)
// ============================================

/*
// Configuration
const TOTP_CONFIG = {
  issuer: 'PrajwalRaj Portfolio',
  algorithm: 'SHA1',
  digits: 6,
  period: 30, // seconds
};

// Generate a new TOTP secret for a user
export function generateTOTPSecret(email: string): {
  secret: string;
  otpauthUrl: string;
} {
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_CONFIG.issuer,
    label: email,
    algorithm: TOTP_CONFIG.algorithm,
    digits: TOTP_CONFIG.digits,
    period: TOTP_CONFIG.period,
    secret: new OTPAuth.Secret(), // Generates random secret
  });

  return {
    secret: totp.secret.base32,
    otpauthUrl: totp.toString(),
  };
}

// Generate QR code for authenticator app
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

// Verify a TOTP code
export function verifyTOTP(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_CONFIG.issuer,
    label: 'admin',
    algorithm: TOTP_CONFIG.algorithm,
    digits: TOTP_CONFIG.digits,
    period: TOTP_CONFIG.period,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // delta allows for 1 period before/after (handles clock skew)
  const delta = totp.validate({ token: code, window: 1 });
  
  return delta !== null;
}

// Generate current TOTP code (for testing)
export function generateCurrentTOTP(secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_CONFIG.issuer,
    label: 'admin',
    algorithm: TOTP_CONFIG.algorithm,
    digits: TOTP_CONFIG.digits,
    period: TOTP_CONFIG.period,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.generate();
}
*/

// ============================================
// PLACEHOLDER EXPORTS (ACTIVE)
// ============================================

// These are placeholder functions that do nothing
// Replace with commented implementations above when enabling TOTP

export function generateTOTPSecret(email: string): {
  secret: string;
  otpauthUrl: string;
} {
  // TODO: Uncomment TOTP implementation above and use it here
  return {
    secret: 'TOTP_NOT_ENABLED',
    otpauthUrl: '',
  };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  // TODO: Uncomment TOTP implementation above and use it here
  return '';
}

export function verifyTOTP(secret: string, code: string): boolean {
  // TODO: Uncomment TOTP implementation above and use it here
  // For now, always return true (TOTP disabled)
  return true;
}

export function generateCurrentTOTP(secret: string): string {
  // TODO: Uncomment TOTP implementation above and use it here
  return '000000';
}

// Export types for future use
export type TOTPSecret = {
  secret: string;
  otpauthUrl: string;
};
