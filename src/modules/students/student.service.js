import mongoose from 'mongoose';
import Student from './student.model.js';
import Enrollment from './enrollment.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import StudentParent from '../parents/studentParent.model.js';
import TeacherAssignment from '../academics/teacherAssignment.model.js';
import User from '../users/user.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { ROLES, AUTH_EVENTS } from '../../constants/index.js';
import { logAuditEvent } from '../audit/audit.service.js';

function resolveSchoolId(user, explicitSchoolId) {
  if (user.role === ROLES.SUPER_ADMIN) {
    return explicitSchoolId || user.schoolId || null;
  }
  return user.schoolId;
}

export async function createStudent(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // 1. Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // 2. Check duplicate admissionNumber in same school
  const existingAdmission = await Student.findOne({
    schoolId,
    admissionNumber: data.admissionNumber.trim().toUpperCase(),
  });
  if (existingAdmission) {
    throw AppError.conflict(
      `Student with admission number '${data.admissionNumber.toUpperCase()}' already exists in this school`
    );
  }

  // 3. Verify academic session
  const session = await AcademicSession.findOne({ _id: data.academicSessionId, schoolId });
  if (!session) {
    throw AppError.notFound('Academic session not found in this school');
  }

  // 4. Verify class
  const cls = await Class.findOne({ _id: data.classId, schoolId });
  if (!cls) {
    throw AppError.notFound('Class not found in this school');
  }

  // 5. Verify section and verify it belongs to the class
  const section = await Section.findOne({ _id: data.sectionId, classId: data.classId, schoolId });
  if (!section) {
    throw AppError.notFound('Section not found or does not belong to the selected class');
  }

  // 6. Verify userId if provided
  if (data.userId) {
    const userDoc = await User.findOne({ _id: data.userId, schoolId });
    if (!userDoc) {
      throw AppError.notFound('Linked user account not found in this school');
    }
    if (userDoc.role !== ROLES.STUDENT) {
      throw AppError.badRequest(`Linked user must have '${ROLES.STUDENT}' role`);
    }
  }

  const student = new Student({
    ...data,
    admissionNumber: data.admissionNumber.trim().toUpperCase(),
    email: data.email ? data.email.toLowerCase().trim() : null,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await student.save();

  // Create initial enrollment record
  const enrollment = new Enrollment({
    schoolId,
    studentId: student._id,
    academicSessionId: student.academicSessionId,
    classId: student.classId,
    sectionId: student.sectionId,
    rollNumber: student.rollNumber,
    enrollmentStatus: student.enrollmentStatus,
    enrolledAt: student.admissionDate || new Date(),
    createdBy: user.id,
  });

  await enrollment.save();

  await logAuditEvent({
    event: AUTH_EVENTS.STUDENT_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Student',
    entityId: student._id,
    details: {
      admissionNumber: student.admissionNumber,
      name: `${student.firstName} ${student.lastName}`,
      classId: student.classId,
      sectionId: student.sectionId,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return student.toJSON();
}

export async function getStudents(params, user) {
  const {
    page = 1,
    limit = 10,
    classId,
    sectionId,
    academicSessionId,
    enrollmentStatus,
    gender,
    search,
    admissionNumber,
    schoolId: querySchoolId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;
  if (academicSessionId) query.academicSessionId = academicSessionId;
  if (enrollmentStatus) query.enrollmentStatus = enrollmentStatus;
  if (gender) query.gender = gender;
  if (admissionNumber) query.admissionNumber = admissionNumber.toUpperCase();

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { admissionNumber: searchRegex },
      { rollNumber: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('classId', 'name code')
      .populate('sectionId', 'name code')
      .populate('academicSessionId', 'name status')
      .populate('userId', 'email firstName lastName role status')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Student.countDocuments(query),
  ]);

  return {
    students: students.map((s) => s.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getStudentById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid student ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const student = await Student.findOne(query)
    .populate('classId', 'name code')
    .populate('sectionId', 'name code')
    .populate('academicSessionId', 'name status isCurrent')
    .populate('userId', 'email firstName lastName role status lastLoginAt');

  if (!student) {
    throw AppError.notFound('Student not found');
  }

  return student.toJSON();
}

export async function getStudentProfile(id, user) {
  const student = await getStudentById(id, user);

  // Fetch linked parents
  const parentLinks = await StudentParent.find({
    schoolId: student.schoolId,
    studentId: student.id,
  }).populate('parentId', 'firstName lastName email phone alternatePhone occupation relationship');

  return {
    ...student,
    parents: parentLinks.map((l) => ({
      relationshipType: l.relationshipType,
      isPrimary: l.isPrimary,
      canReceiveNotifications: l.canReceiveNotifications,
      canViewAcademicRecords: l.canViewAcademicRecords,
      parent: l.parentId ? l.parentId.toJSON() : null,
    })),
  };
}

export async function getStudentAcademic(id, user) {
  const student = await getStudentById(id, user);

  // Fetch historical enrollments
  const enrollments = await Enrollment.find({
    schoolId: student.schoolId,
    studentId: student.id,
  })
    .populate('academicSessionId', 'name status isCurrent')
    .populate('classId', 'name code')
    .populate('sectionId', 'name code')
    .sort({ enrolledAt: -1 });

  // Fetch current class subjects & teachers
  const currentTeachers = await TeacherAssignment.find({
    schoolId: student.schoolId,
    classId: student.classId,
    sectionId: student.sectionId,
  })
    .populate('teacherId', 'firstName lastName employeeId email')
    .populate('subjectId', 'name code subjectType');

  return {
    student,
    enrollments: enrollments.map((e) => e.toJSON()),
    currentSubjects: currentTeachers.map((t) => t.toJSON()),
  };
}

export async function updateStudent(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid student ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const student = await Student.findOne(query);
  if (!student) {
    throw AppError.notFound('Student not found');
  }

  // Check duplicate admissionNumber if changed
  if (updates.admissionNumber && updates.admissionNumber.trim().toUpperCase() !== student.admissionNumber) {
    const existing = await Student.findOne({
      schoolId: student.schoolId,
      admissionNumber: updates.admissionNumber.trim().toUpperCase(),
      _id: { $ne: student._id },
    });
    if (existing) {
      throw AppError.conflict(
        `Student with admission number '${updates.admissionNumber.toUpperCase()}' already exists`
      );
    }
    student.admissionNumber = updates.admissionNumber.trim().toUpperCase();
  }

  // Validate class/section if changed
  if (updates.classId || updates.sectionId) {
    const targetClassId = updates.classId || student.classId;
    const targetSectionId = updates.sectionId || student.sectionId;

    const section = await Section.findOne({
      _id: targetSectionId,
      classId: targetClassId,
      schoolId: student.schoolId,
    });
    if (!section) {
      throw AppError.notFound('Section not found or does not belong to the selected class');
    }
    student.classId = targetClassId;
    student.sectionId = targetSectionId;
  }

  if (updates.firstName) student.firstName = updates.firstName.trim();
  if (updates.lastName) student.lastName = updates.lastName.trim();
  if (updates.dateOfBirth) student.dateOfBirth = new Date(updates.dateOfBirth);
  if (updates.gender) student.gender = updates.gender;
  if (updates.profileImage !== undefined) student.profileImage = updates.profileImage;
  if (updates.email !== undefined) student.email = updates.email ? updates.email.toLowerCase().trim() : null;
  if (updates.phone !== undefined) student.phone = updates.phone;
  if (updates.address !== undefined) student.address = updates.address;
  if (updates.city !== undefined) student.city = updates.city;
  if (updates.rollNumber !== undefined) student.rollNumber = updates.rollNumber;
  if (updates.admissionDate) student.admissionDate = new Date(updates.admissionDate);
  if (updates.enrollmentStatus) student.enrollmentStatus = updates.enrollmentStatus;
  if (updates.bloodGroup !== undefined) student.bloodGroup = updates.bloodGroup;
  if (updates.emergencyContactName !== undefined) student.emergencyContactName = updates.emergencyContactName;
  if (updates.emergencyContactPhone !== undefined) student.emergencyContactPhone = updates.emergencyContactPhone;

  student.updatedBy = user.id;
  await student.save();

  await logAuditEvent({
    event: AUTH_EVENTS.STUDENT_UPDATED,
    userId: user.id,
    schoolId: student.schoolId,
    entityType: 'Student',
    entityId: student._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return student.toJSON();
}

export async function deleteStudent(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid student ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const student = await Student.findOne(query);
  if (!student) {
    throw AppError.notFound('Student not found');
  }

  student.isDeleted = true;
  student.deletedAt = new Date();
  student.deletedBy = user.id;
  await student.save();

  await logAuditEvent({
    event: AUTH_EVENTS.STUDENT_DELETED,
    userId: user.id,
    schoolId: student.schoolId,
    entityType: 'Student',
    entityId: student._id,
    details: { admissionNumber: student.admissionNumber, name: `${student.firstName} ${student.lastName}` },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Student deleted successfully' };
}
