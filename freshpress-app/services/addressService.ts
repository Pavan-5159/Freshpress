/**
 * Address Service — CRUD operations for saved delivery addresses.
 *
 * @requirements Req 6.1–6.9
 */

import { axiosInstance } from './axiosInstance';
import type { Address } from '@/types';

export interface CreateAddressPayload {
  label: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  id: string;
  label?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** Fetch all saved addresses for the current user. */
export async function getAddresses(): Promise<Address[]> {
  const response = await axiosInstance.get<Address[]>('/v1/addresses');
  return response.data;
}

/** Create a new address. */
export async function createAddress(
  payload: CreateAddressPayload
): Promise<Address> {
  const response = await axiosInstance.post<Address>('/v1/addresses', payload);
  return response.data;
}

/** Update an existing address. */
export async function updateAddress(
  payload: UpdateAddressPayload
): Promise<Address> {
  const { id, ...body } = payload;
  const response = await axiosInstance.put<Address>(`/v1/addresses/${id}`, body);
  return response.data;
}

/** Delete an address by ID. */
export async function deleteAddress(id: string): Promise<void> {
  await axiosInstance.delete(`/v1/addresses/${id}`);
}

/** Set the default address, clearing the previous default. */
export async function setDefaultAddress(id: string): Promise<Address> {
  const response = await axiosInstance.patch<Address>(`/v1/addresses/${id}/default`);
  return response.data;
}
