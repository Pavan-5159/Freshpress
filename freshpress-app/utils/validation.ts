import { z } from 'zod';

/**
 * Validates a phone number: exactly 10 numeric digits.
 * @requirements Req 1.2, 1.11
 */
export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits');

/**
 * Validates a saved address label: max 50 characters.
 * @requirements Req 6.1
 */
export const addressLabelSchema = z
  .string()
  .max(50, 'Address label must be 50 characters or less');

/**
 * Validates pickup instructions: max 200 characters.
 * @requirements Req 5.7
 */
export const pickupInstructionsSchema = z
  .string()
  .max(200, 'Pickup instructions must be 200 characters or less');

/**
 * Validates a review text body: max 500 characters.
 * @requirements Req 10.2
 */
export const reviewTextSchema = z
  .string()
  .max(500, 'Review text must be 500 characters or less');

/**
 * Validates a profile display name: max 50 characters.
 * @requirements Req 11.2
 */
export const profileNameSchema = z
  .string()
  .max(50, 'Profile name must be 50 characters or less');

/**
 * Validates a phone number string and returns a plain result object.
 *
 * @param input - The raw phone string to validate.
 * @returns `{ isValid: true }` when the input matches the phone schema,
 *          `{ isValid: false, error: string }` otherwise.
 * @requirements Req 1.2, 1.11
 */
export function validatePhone(input: string): { isValid: boolean; error?: string } {
  const result = phoneSchema.safeParse(input);
  if (result.success) {
    return { isValid: true };
  }
  return {
    isValid: false,
    error: result.error.errors[0]?.message ?? 'Invalid phone number',
  };
}
