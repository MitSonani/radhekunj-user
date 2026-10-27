import { apiClient } from './apiClient';

export interface PublicBannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  desktopImageUrl: string;
  tabletImageUrl?: string | null;
  mobileImageUrl?: string | null;
  altText: string;
  textAlignment: 'left' | 'center' | 'right';
  isActive: boolean;
  sortOrder: number;
}

export interface BannerListResponse {
  success: boolean;
  data: PublicBannerItem[];
  message?: string;
}

export const bannerService = {
  getActiveBanners: () => apiClient.get<BannerListResponse>('/banners'),
};
