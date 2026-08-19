import { describe, it, expect } from 'vitest';
import { parentFormSchema, linkChildSchema } from '../schemas/parent.schema';

describe('Parent Schemas Validation', () => {
  it('should validate a complete parent form payload', () => {
    const validParent = {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sconnor@resistance.org',
      phone: '555-1984',
      relationship: 'MOTHER',
      occupation: 'Field Commander',
    };
    const result = parentFormSchema.safeParse(validParent);
    expect(result.success).toBe(true);
  });

  it('should reject parent when required fields are missing', () => {
    const invalid = { firstName: '', phone: '' };
    const result = parentFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate a child link payload with valid objectIds', () => {
    const validLink = {
      studentId: '507f1f77bcf86cd799439011',
      relationshipType: 'MOTHER',
      isPrimary: true,
      canPickup: true,
      emergencyContact: true,
    };
    const result = linkChildSchema.safeParse(validLink);
    expect(result.success).toBe(true);
  });
});
