import { apiClient } from './apiClient';

export interface SendOtpPayload {
  countryCode?: string;
  mobileNumber: string;
}

export interface VerifyOtpPayload {
  countryCode?: string;
  mobileNumber: string;
  otp: string;
  name?: string;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  name: string;
  countryCode?: string;
  mobileNumber?: string;
  status?: string;
  role: UserRole | null;
}

export interface AuthResponseData {
  user: UserProfile;
  token: string;
}

export interface BaseApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Service to consume the backend authentication API endpoints.
 */
export const authService = {
  /**
   * Triggers generation and sending of OTP.
   * Returns generated OTP in non-production environments to facilitate testing.
   */
  sendOtp: (payload: SendOtpPayload) =>
    apiClient.post<BaseApiResponse<{ otp?: string; isNewUser?: boolean }>>('/auth/otp/send', payload),

  /**
   * Verifies the OTP. If the user is new, registers them with the optional name.
   * Returns user profile details and the JWT authentication token.
   */
  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient.post<BaseApiResponse<AuthResponseData>>('/auth/otp/verify', payload),

  /**
   * Fetches the current authenticated user profile.
   */
  getProfile: () =>
    apiClient.get<BaseApiResponse<UserProfile>>('/auth/me'),

  /**
   * Updates customer profile fields (e.g. name).
   */
  updateProfile: (payload: { name: string }) =>
    apiClient.patch<BaseApiResponse<UserProfile>>('/auth/profile', payload),
};
