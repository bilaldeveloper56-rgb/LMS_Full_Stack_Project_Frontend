import { describe, it, expect } from 'vitest';
import { teacherFormSchema } from '../schemas/teacher.schema';

describe('Teacher Form Schema Validation', () => {
  const validPayload = {
    employeeId: 'EMP-2026-001',
    firstName: 'Albert',
    lastName: 'Einstein',
    email: 'einstein@school.edu',
    phone: '555-123-4567',
    gender: 'MALE',
    dateOfBirth: '1879-03-14',
    designation: 'Senior Professor',
    qualification: 'Ph.D. Theoretical Physics',
    specialization: 'Physics & Relativity',
    joiningDate: '2026-01-01',
    employmentStatus: 'ACTIVE',
  };

  it('should validate a complete and valid teacher payload', () => {
    const result = teacherFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject when required fields (employeeId, firstName, lastName, email) are missing', () => {
    const invalid = { ...validPayload, employeeId: '', firstName: '', email: 'not-an-email' };
    const result = teacherFormSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.includes('employeeId'))).toBe(true);
    expect(result.error.issues.some((i) => i.path.includes('firstName'))).toBe(true);
    expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
  });
});
