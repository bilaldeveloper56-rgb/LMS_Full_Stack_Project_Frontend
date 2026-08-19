import { describe, it, expect } from 'vitest';
import {
  createSchoolFormSchema,
  updateSchoolFormSchema,
  changeSchoolStatusFormSchema,
} from '../schemas/school.schema';

describe('School Zod Schemas', () => {
  it('should validate valid createSchoolFormSchema', () => {
    const valid = {
      name: 'Springfield Academy',
      schoolCode: 'SPH-01',
      email: 'contact@springfield.edu',
      country: 'US',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en',
      adminFirstName: 'Sarah',
      adminLastName: 'Connor',
      adminEmail: 'sarah@springfield.edu',
    };
    expect(createSchoolFormSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject invalid createSchoolFormSchema', () => {
    expect(createSchoolFormSchema.safeParse({ name: '', schoolCode: 'invalid' }).success).toBe(false);
    expect(
      createSchoolFormSchema.safeParse({
        name: 'School',
        schoolCode: 'SPH',
        email: 'invalid-email',
      }).success
    ).toBe(false);
  });

  it('should validate updateSchoolFormSchema and changeSchoolStatusFormSchema', () => {
    expect(updateSchoolFormSchema.safeParse({ name: 'New Name' }).success).toBe(true);
    expect(changeSchoolStatusFormSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(changeSchoolStatusFormSchema.safeParse({ status: 'INVALID' }).success).toBe(false);
  });
});
