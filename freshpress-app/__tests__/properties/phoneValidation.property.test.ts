// Feature: freshpress-customer-app, Property 1: phone number validation boundary
// Validates: Requirements 1.2, 1.11

import { describe, it } from '@jest/globals';
import * as fc from 'fast-check';
import { validatePhone } from '@/utils/validation';

/**
 * Property 1: Phone number validation boundary
 *
 * For any arbitrary string `s`, `validatePhone(s).isValid` must equal
 * whether `s` matches the regex /^\d{10}$/ (exactly 10 numeric digits).
 *
 * **Validates: Requirements 1.2, 1.11**
 */
describe('validatePhone - Property 1: phone number validation boundary', () => {
  it('isValid matches /^\\d{10}$/ for arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (s: string) => {
        const expected = /^\d{10}$/.test(s);
        const result = validatePhone(s);
        return result.isValid === expected;
      }),
      { numRuns: 200 }
    );
  });
});
