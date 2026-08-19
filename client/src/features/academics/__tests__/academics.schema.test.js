import { describe, it, expect } from 'vitest';
import {
  sessionFormSchema,
  classFormSchema,
  sectionFormSchema,
  subjectFormSchema,
  teacherAssignmentSchema,
} from '../schemas/academics.schema';

describe('Academics Schemas Validation', () => {
  it('should validate academic session schema and enforce startDate < endDate', () => {
    const validSession = {
      name: '2026-2027',
      startDate: '2026-09-01',
      endDate: '2027-06-30',
      status: 'UPCOMING',
      isCurrent: false,
    };
    expect(sessionFormSchema.safeParse(validSession).success).toBe(true);

    const invalidSession = {
      ...validSession,
      startDate: '2027-01-01',
      endDate: '2026-01-01',
    };
    expect(sessionFormSchema.safeParse(invalidSession).success).toBe(false);
  });

  it('should validate class and section schemas', () => {
    const validClass = {
      name: 'Grade 10',
      code: 'G10',
      academicSessionId: '507f1f77bcf86cd799439011',
      displayOrder: 1,
      isActive: true,
    };
    expect(classFormSchema.safeParse(validClass).success).toBe(true);

    const validSection = {
      name: 'Section A',
      code: 'SEC-A',
      classId: '507f1f77bcf86cd799439012',
      capacity: 35,
      isActive: true,
    };
    expect(sectionFormSchema.safeParse(validSection).success).toBe(true);
  });

  it('should validate subject and teacher assignment schemas', () => {
    const validSubject = {
      name: 'Biology',
      code: 'BIO-101',
      subjectType: 'CORE',
      isOptional: false,
      isActive: true,
    };
    expect(subjectFormSchema.safeParse(validSubject).success).toBe(true);

    const validAssignment = {
      academicSessionId: '507f1f77bcf86cd799439011',
      teacherId: '507f1f77bcf86cd799439014',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439015',
    };
    expect(teacherAssignmentSchema.safeParse(validAssignment).success).toBe(true);
  });
});
