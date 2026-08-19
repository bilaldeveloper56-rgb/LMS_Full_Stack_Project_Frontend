import { describe, it, expect } from 'vitest';
import { studentFormSchema } from '../schemas/student.schema';

describe('Student Form Schema Validation', () => {
  const validPayload = {
    admissionNumber: 'ADM-2026-001',
    firstName: 'Emily',
    lastName: 'Watson',
    dateOfBirth: '2010-05-15',
    gender: 'FEMALE',
    academicSessionId: '507f1f77bcf86cd799439011',
    classId: '507f1f77bcf86cd799439012',
    sectionId: '507f1f77bcf86cd799439013',
    rollNumber: '12',
    admissionDate: '2026-01-10',
    enrollmentStatus: 'ACTIVE',
    bloodGroup: 'O+',
    email: 'emily@school.edu',
    phone: '1234567890',
    address: '123 Maple St',
    city: 'Springfield',
    profileImage: 'https://example.com/avatar.jpg',
    emergencyContactName: 'John Watson',
    emergencyContactPhone: '9876543210',
  };

  it('should validate a valid student payload successfully', () => {
    const result = studentFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject when required fields are missing', () => {
    const invalid = { ...validPayload, firstName: '', admissionNumber: '' };
    const result = studentFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.includes('firstName'))).toBe(true);
    expect(result.error.issues.some((i) => i.path.includes('admissionNumber'))).toBe(true);
  });

  it('should reject invalid objectId formats for session, class, or section', () => {
    const invalid = { ...validPayload, classId: 'invalid-id' };
    const result = studentFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.includes('classId'))).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalid = { ...validPayload, email: 'not-an-email' };
    const result = studentFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
  });
});
