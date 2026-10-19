/**
 * Shop Service — discovery, search, details, reviews, banners.
 */

import { axiosInstance } from './axiosInstance';
import type { Shop, Review, Banner } from '@/types';

export interface NearbyShopsParams {
  lat: number;
  lng: number;
  serviceType?: string;
  radius?: number;
}

export interface PaginatedReviews {
  reviews: Review[];
  total: number;
  page: number;
  hasMore: boolean;
}

// Fetch nearby shops
export async function getNearbyShops(
  params: NearbyShopsParams
): Promise<Shop[]> {
  const response = await axiosInstance.get('/v1/shops/nearby', {
    params: {
      lat: params.lat,
      lng: params.lng,
      radiusKm: params.radius ?? 50,
      category: params.serviceType,
    },
  });

  return response.data.data;
}

// Search shops
export async function searchShops(query: string): Promise<Shop[]> {
  const response = await axiosInstance.get('/v1/shops/search', {
    params: { q: query },
  });

  return response.data.data;
}

// Get shop details
export async function getShopById(id: string): Promise<Shop> {
  const response = await axiosInstance.get(`/v1/shops/${id}`);

  return response.data.data;
}

// Get reviews
export async function getShopReviews(
  id: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedReviews> {
  const response = await axiosInstance.get(`/v1/shops/${id}/reviews`, {
    params: { page, limit },
  });

  return response.data.data;
}

// Get banners
export async function getBanners(): Promise<Banner[]> {
  const response = await axiosInstance.get('/v1/shops/banners');

  return response.data.data;
}

// Get home page data (shops + banners)
export async function getHomeData(params: NearbyShopsParams) {
  const response = await axiosInstance.get('/v1/home', {
    params: {
      lat: params.lat,
      lng: params.lng,
      radiusKm: params.radius ?? 50,
    },
  });

  return response.data.data;
}

// Claim an OSM shop
export async function claimShop(id: string): Promise<Shop> {
  const response = await axiosInstance.post(`/v1/shops/${id}/claim`);
  return response.data.data;
}