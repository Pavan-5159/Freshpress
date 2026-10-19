/**
 * Rating Service — submit ratings and upload review photos.
 *
 * @requirements Req 10.1–10.8
 */

import { axiosInstance } from './axiosInstance';
import type { Review } from '@/types';

export interface SubmitRatingPayload {
  orderId: string;
  stars: number;
  text?: string;
  photoUrls?: string[];
}

/** Submit a rating review for a completed order. */
export async function submitRating(
  payload: SubmitRatingPayload
): Promise<Review> {
  const response = await axiosInstance.post<Review>('/v1/ratings', payload);
  return response.data;
}

/** Upload review photos to a pre-signed S3 bucket. */
export async function uploadReviewPhotos(
  files: { uri: string; type: string; name: string }[]
): Promise<string[]> {
  // Step 1: Request pre-signed URLs from the backend
  const response = await axiosInstance.post<{ urls: string[] }>(
    '/v1/ratings/photos/upload-urls',
    { count: files.length }
  );
  const presignedUrls = response.data.urls;

  // Step 2: Upload each file to its pre-signed URL
  const uploadedUrls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = presignedUrls[i];
    if (!url) continue;

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as unknown as Blob);

    // Note: This is a direct S3 PUT, not through our Axios instance
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload photo ${i + 1}`);
    }
    uploadedUrls.push(url.split('?')[0]); // Remove query params to get clean URL
  }

  return uploadedUrls;
}
