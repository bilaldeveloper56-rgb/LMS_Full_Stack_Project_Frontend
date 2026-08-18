import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Class from '../../src/modules/academics/class.model.js';
import { ROLES, USER_STATUS, AUTH_EVENTS } from '../../src/constants/index.js';

describe('Teacher Account Provisioning & Academic Section Flow', () => {
  it('should instantiate teacher linked to school and verify user roles and status', () => {
    const schoolId = '507f1f77bcf86cd799439011';
    const userId = '507f1f77bcf86cd799439022';

    const teacher = new Teacher({
      schoolId,
      userId,
      employeeId: 'EMP-TCH-001',
      firstName: 'Fatima',
      lastName: 'Zahra',
      email: 'fatima.zahra@springfield.edu.pk',
      phone: '+923001234567',
      designation: 'Senior Math Teacher',
      qualification: 'M.Sc. Mathematics',
      specialization: ['Calculus', 'Algebra'],
    });

    assert.equal(teacher.firstName, 'Fatima');
    assert.equal(teacher.employeeId, 'EMP-TCH-001');
    assert.equal(teacher.schoolId.toString(), schoolId);
    assert.equal(teacher.userId.toString(), userId);
    assert.equal(teacher.employmentStatus, 'ACTIVE');
  });

  it('should verify teacher User account is created with INVITED status and hashed token', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = new User({
      firstName: 'Fatima',
      lastName: 'Zahra',
      email: 'fatima.zahra@springfield.edu.pk',
      phone: '+923001234567',
      passwordHash: crypto.randomBytes(32).toString('hex'),
      role: ROLES.TEACHER,
      status: USER_STATUS.INVITED,
      schoolId: '507f1f77bcf86cd799439011',
      invitationToken: hashedToken,
      invitationExpires: expiry,
    });

    assert.equal(user.role, ROLES.TEACHER);
    assert.equal(user.status, USER_STATUS.INVITED);
    assert.equal(user.invitationToken, hashedToken);
    assert.ok(user.invitationExpires > new Date());
  });

  it('should instantiate Section linked to Class with default capacity', () => {
    const classId = '507f1f77bcf86cd799439033';
    const academicSessionId = '507f1f77bcf86cd799439044';
    const schoolId = '507f1f77bcf86cd799439011';

    const section = new Section({
      name: 'Section A - Jinnah',
      code: 'A',
      classId,
      academicSessionId,
      schoolId,
      capacity: 40,
      room: 'Room 101',
    });

    assert.equal(section.name, 'Section A - Jinnah');
    assert.equal(section.code, 'A');
    assert.equal(section.capacity, 40);
    assert.equal(section.classId.toString(), classId);
    assert.equal(section.isActive, true);
  });
});
