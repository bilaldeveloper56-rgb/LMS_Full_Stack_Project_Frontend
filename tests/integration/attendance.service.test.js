import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Attendance from '../../src/modules/attendance/attendance.model.js';
import Student from '../../src/modules/students/student.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as attendanceService from '../../src/modules/attendance/attendance.service.js';
import { ROLES, ATTENDANCE_STATUS, ATTENDANCE_SOURCE } from '../../src/constants/index.js';

describe('Attendance Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const sectionId = '507f1f77bcf86cd799439044';
  const studentId = '507f1f77bcf86cd799439055';
  const teacherUserId = '507f1f77bcf86cd799439066';
  const teacherId = '507f1f77bcf86cd799439077';

  const schoolAdminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };
  const teacherUser = { id: teacherUserId, role: ROLES.TEACHER, schoolId };

  describe('createAttendance', () => {
    it('should create attendance record successfully for valid student and date', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;
      const origStudentFindOne = Student.findOne;
      const origAttendanceFindOne = Attendance.findOne;
      const origAttendanceSave = Attendance.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
      Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
      Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
      Student.findOne = () => Promise.resolve({ _id: studentId, classId, sectionId, schoolId });
      Attendance.findOne = () => Promise.resolve(null); // No duplicate
      Attendance.prototype.save = function () {
        this._id = '507f1f77bcf86cd799439099';
        return Promise.resolve(this);
      };

      const result = await attendanceService.createAttendance(
        {
          academicSessionId: sessionId,
          classId,
          sectionId,
          studentId,
          date: '2026-09-01',
          status: ATTENDANCE_STATUS.PRESENT,
          source: ATTENDANCE_SOURCE.MANUAL,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
      Student.findOne = origStudentFindOne;
      Attendance.findOne = origAttendanceFindOne;
      Attendance.prototype.save = origAttendanceSave;

      assert.equal(result.status, ATTENDANCE_STATUS.PRESENT);
      assert.equal(result.studentId.toString(), studentId);
    });

    it('should reject duplicate daily attendance for the same student on the same date', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;
      const origStudentFindOne = Student.findOne;
      const origAttendanceFindOne = Attendance.findOne;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
      Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
      Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
      Student.findOne = () => Promise.resolve({ _id: studentId, schoolId });
      Attendance.findOne = () => Promise.resolve({ _id: 'existing-record', status: 'PRESENT' }); // Duplicate exists

      await assert.rejects(
        () =>
          attendanceService.createAttendance(
            {
              academicSessionId: sessionId,
              classId,
              sectionId,
              studentId,
              date: '2026-09-01',
              status: ATTENDANCE_STATUS.PRESENT,
            },
            schoolAdminUser
          ),
        (err) => err.statusCode === 409 && err.message.includes('already exists')
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
      Student.findOne = origStudentFindOne;
      Attendance.findOne = origAttendanceFindOne;
    });
  });

  describe('bulkMarkAttendance', () => {
    it('should bulk mark attendance for multiple students', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;
      const origStudentFind = Student.find;
      const origAttendanceFind = Attendance.find;
      const origAttendanceInsertMany = Attendance.insertMany;

      const student2Id = '507f1f77bcf86cd799439056';

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
      Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
      Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
      Student.find = () => Promise.resolve([{ _id: studentId }, { _id: student2Id }]);
      Attendance.find = () => Promise.resolve([]); // No existing records
      Attendance.insertMany = (docs) =>
        Promise.resolve(
          docs.map((d, idx) => ({
            ...d,
            _id: `507f1f77bcf86cd79943909${idx}`,
            toJSON() {
              return { ...this, id: this._id };
            },
          }))
        );

      const result = await attendanceService.bulkMarkAttendance(
        {
          academicSessionId: sessionId,
          classId,
          sectionId,
          date: '2026-09-01',
          records: [
            { studentId, status: ATTENDANCE_STATUS.PRESENT },
            { studentId: student2Id, status: ATTENDANCE_STATUS.ABSENT },
          ],
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
      Student.find = origStudentFind;
      Attendance.find = origAttendanceFind;
      Attendance.insertMany = origAttendanceInsertMany;

      assert.equal(result.length, 2);
      assert.equal(result[0].status, ATTENDANCE_STATUS.PRESENT);
      assert.equal(result[1].status, ATTENDANCE_STATUS.ABSENT);
    });

    it('should reject duplicate student IDs in bulk payload', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
      Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
      Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });

      await assert.rejects(
        () =>
          attendanceService.bulkMarkAttendance(
            {
              academicSessionId: sessionId,
              classId,
              sectionId,
              date: '2026-09-01',
              records: [
                { studentId, status: ATTENDANCE_STATUS.PRESENT },
                { studentId, status: ATTENDANCE_STATUS.ABSENT },
              ],
            },
            schoolAdminUser
          ),
        (err) => err.statusCode === 400 && err.message.includes('Duplicate student IDs')
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
    });
  });

  describe('correctAttendance', () => {
    it('should update attendance status and store correction reason and metadata', async () => {
      const origAttendanceFindOne = Attendance.findOne;
      const mockRecord = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        classId,
        sectionId,
        status: ATTENDANCE_STATUS.ABSENT,
        save: () => Promise.resolve(mockRecord),
        toJSON: () => ({
          id: '507f1f77bcf86cd799439099',
          status: mockRecord.status,
          correctionReason: mockRecord.correctionReason,
          correctedBy: mockRecord.correctedBy,
        }),
      };

      Attendance.findOne = () => Promise.resolve(mockRecord);

      const result = await attendanceService.correctAttendance(
        '507f1f77bcf86cd799439099',
        {
          status: ATTENDANCE_STATUS.EXCUSED,
          correctionReason: 'Medical slip submitted by doctor',
        },
        schoolAdminUser
      );

      Attendance.findOne = origAttendanceFindOne;

      assert.equal(result.status, ATTENDANCE_STATUS.EXCUSED);
      assert.equal(result.correctionReason, 'Medical slip submitted by doctor');
      assert.equal(result.correctedBy, 'admin-1');
    });
  });

  describe('updateAttendance & deleteAttendance', () => {
    it('should update existing attendance remarks and status', async () => {
      const origAttendanceFindOne = Attendance.findOne;
      const mockRecord = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        classId,
        sectionId,
        status: ATTENDANCE_STATUS.PRESENT,
        remarks: 'Initial',
        save: () => Promise.resolve(mockRecord),
        toJSON: () => ({
          id: '507f1f77bcf86cd799439099',
          status: mockRecord.status,
          remarks: mockRecord.remarks,
        }),
      };

      Attendance.findOne = () => Promise.resolve(mockRecord);

      const result = await attendanceService.updateAttendance(
        '507f1f77bcf86cd799439099',
        { status: ATTENDANCE_STATUS.LATE, remarks: 'Arrived 15 mins late' },
        schoolAdminUser
      );

      Attendance.findOne = origAttendanceFindOne;

      assert.equal(result.status, ATTENDANCE_STATUS.LATE);
      assert.equal(result.remarks, 'Arrived 15 mins late');
    });

    it('should soft delete attendance record', async () => {
      const origAttendanceFindOne = Attendance.findOne;
      const mockRecord = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        classId,
        sectionId,
        isDeleted: false,
        save: () => Promise.resolve(mockRecord),
      };

      Attendance.findOne = () => Promise.resolve(mockRecord);

      const result = await attendanceService.deleteAttendance('507f1f77bcf86cd799439099', schoolAdminUser);

      Attendance.findOne = origAttendanceFindOne;

      assert.equal(result.success, true);
      assert.equal(mockRecord.isDeleted, true);
    });
  });

  describe('calculateAttendanceSummary & Reports', () => {
    it('should correctly calculate attendance totals and percentage', () => {
      const records = [
        { status: ATTENDANCE_STATUS.PRESENT },
        { status: ATTENDANCE_STATUS.PRESENT },
        { status: ATTENDANCE_STATUS.LATE },
        { status: ATTENDANCE_STATUS.HALF_DAY },
        { status: ATTENDANCE_STATUS.EXCUSED },
        { status: ATTENDANCE_STATUS.ABSENT },
      ];

      const summary = attendanceService.calculateAttendanceSummary(records);

      assert.equal(summary.totalDays, 6);
      assert.equal(summary.present, 2);
      assert.equal(summary.late, 1);
      assert.equal(summary.halfDay, 1);
      assert.equal(summary.excused, 1);
      assert.equal(summary.absent, 1);
      // Effective present = 2 + 1 + 1 + (1 * 0.5) = 4.5
      // Percentage = (4.5 / 6) * 100 = 75.0%
      assert.equal(summary.effectivePresent, 4.5);
      assert.equal(summary.percentage, 75);
    });

    it('should generate attendance report summary across filters', async () => {
      const origAttendanceFind = Attendance.find;
      Attendance.find = () =>
        Promise.resolve([
          { status: ATTENDANCE_STATUS.PRESENT },
          { status: ATTENDANCE_STATUS.PRESENT },
          { status: ATTENDANCE_STATUS.ABSENT },
        ]);

      const result = await attendanceService.getAttendanceReportSummary(
        { classId, sectionId },
        schoolAdminUser
      );

      Attendance.find = origAttendanceFind;

      assert.equal(result.summary.totalDays, 3);
      assert.equal(result.summary.present, 2);
      assert.equal(result.summary.absent, 1);
      assert.equal(result.summary.percentage, 66.67);
    });

    it('should get attendance by ID', async () => {
      const origAttendanceFindOne = Attendance.findOne;
      const mockResult = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        studentId: { _id: studentId },
        status: ATTENDANCE_STATUS.PRESENT,
        toJSON: () => ({ id: '507f1f77bcf86cd799439099', status: ATTENDANCE_STATUS.PRESENT }),
      };

      const q = {
        populate: () => q,
        then: (resolve) => Promise.resolve(mockResult).then(resolve),
      };

      Attendance.findOne = () => q;

      const result = await attendanceService.getAttendanceById('507f1f77bcf86cd799439099', schoolAdminUser);

      Attendance.findOne = origAttendanceFindOne;

      assert.equal(result.id, '507f1f77bcf86cd799439099');
    });

    it('should get student attendance profile', async () => {
      const origStudentFindOne = Student.findOne;
      const origAttendanceFind = Attendance.find;

      Student.findOne = () =>
        Promise.resolve({
          _id: studentId,
          schoolId,
          firstName: 'John',
          lastName: 'Doe',
          toJSON: () => ({ id: studentId, firstName: 'John' }),
        });

      const q = {
        populate: () => q,
        sort: () => Promise.resolve([
          {
            _id: '507f1f77bcf86cd799439099',
            status: ATTENDANCE_STATUS.PRESENT,
            date: new Date('2026-09-01'),
            toJSON: () => ({ id: '507f1f77bcf86cd799439099', status: ATTENDANCE_STATUS.PRESENT }),
          },
        ]),
      };

      Attendance.find = () => q;

      const result = await attendanceService.getStudentAttendanceProfile(studentId, {}, schoolAdminUser);

      Student.findOne = origStudentFindOne;
      Attendance.find = origAttendanceFind;

      assert.equal(result.student.id, studentId);
      assert.equal(result.summary.totalDays, 1);
      assert.equal(result.summary.present, 1);
      assert.equal(result.summary.percentage, 100);
    });
  });
});
