import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Result from '../../src/modules/results/result.model.js';
import GradingScale from '../../src/modules/results/gradingScale.model.js';
import Exam from '../../src/modules/exams/exam.model.js';
import ExamPaper from '../../src/modules/exams/examPaper.model.js';
import Student from '../../src/modules/students/student.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as resultService from '../../src/modules/results/result.service.js';
import { ROLES } from '../../src/constants/index.js';

describe('Result Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const examId = '507f1f77bcf86cd799439033';
  const examPaperId = '507f1f77bcf86cd799439044';
  const studentId = '507f1f77bcf86cd799439055';
  const classId = '507f1f77bcf86cd799439066';
  const sectionId = '507f1f77bcf86cd799439077';
  const subjectId = '507f1f77bcf86cd799439088';
  const adminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };

  it('should create grading scale and set as default', async () => {
    const origSchoolFindById = School.findById;
    const origScaleUpdateMany = GradingScale.updateMany;
    const origScaleSave = GradingScale.prototype.save;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    GradingScale.updateMany = () => Promise.resolve({ modifiedCount: 1 });
    GradingScale.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439099';
      return Promise.resolve(this);
    };

    const scale = await resultService.createGradingScale(
      {
        name: 'Custom Honors Grading Scale',
        isDefault: true,
        grades: [
          { grade: 'A', minPercentage: 90, maxPercentage: 100, gradePoint: 4.0 },
          { grade: 'B', minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.0 },
          { grade: 'F', minPercentage: 0, maxPercentage: 79.99, gradePoint: 0.0 },
        ],
      },
      adminUser
    );

    School.findById = origSchoolFindById;
    GradingScale.updateMany = origScaleUpdateMany;
    GradingScale.prototype.save = origScaleSave;

    assert.equal(scale.name, 'Custom Honors Grading Scale');
    assert.equal(scale.isDefault, true);
  });

  it('should retrieve grading scales list', async () => {
    const origScaleFind = GradingScale.find;

    const mockQuery = {
      sort: () =>
        Promise.resolve([
          {
            _id: 'scale-1',
            name: 'Standard CBSE',
            isDefault: true,
            toJSON: () => ({ id: 'scale-1', name: 'Standard CBSE', isDefault: true }),
          },
        ]),
    };

    GradingScale.find = () => mockQuery;

    const scales = await resultService.getGradingScales(adminUser);

    GradingScale.find = origScaleFind;

    assert.equal(scales.length, 1);
    assert.equal(scales[0].name, 'Standard CBSE');
  });

  it('should record student marks and automatically compute percentage, grade, and grade points', async () => {
    const origExamFindOne = Exam.findOne;
    const origPaperFindOne = ExamPaper.findOne;
    const origStudentFindOne = Student.findOne;
    const origResultFindOne = Result.findOne;
    const origScaleFindOne = GradingScale.findOne;
    const origResultSave = Result.prototype.save;

    Exam.findOne = () => Promise.resolve({ _id: examId, academicSessionId: sessionId, schoolId });
    ExamPaper.findOne = () => Promise.resolve({ _id: examPaperId, examId, subjectId, totalMarks: 100, schoolId });
    Student.findOne = () => Promise.resolve({ _id: studentId, classId, sectionId, schoolId });
    Result.findOne = () => Promise.resolve(null); // No previous record
    GradingScale.findOne = () => Promise.resolve(null); // Use default fallback
    Result.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439099';
      return Promise.resolve(this);
    };

    // 85 marks out of 100 -> 85% -> Grade 'A', gradePoint 3.7
    const result = await resultService.recordStudentMarks(
      {
        examId,
        examPaperId,
        studentId,
        marksObtained: 85,
        remarks: 'Great work',
      },
      adminUser
    );

    Exam.findOne = origExamFindOne;
    ExamPaper.findOne = origPaperFindOne;
    Student.findOne = origStudentFindOne;
    Result.findOne = origResultFindOne;
    GradingScale.findOne = origScaleFindOne;
    Result.prototype.save = origResultSave;

    assert.equal(result.marksObtained, 85);
    assert.equal(result.percentage, 85);
    assert.equal(result.grade, 'A');
    assert.equal(result.gradePoint, 3.7);
  });

  it('should reject mark modification when result record is locked', async () => {
    const origExamFindOne = Exam.findOne;
    const origPaperFindOne = ExamPaper.findOne;
    const origStudentFindOne = Student.findOne;
    const origResultFindOne = Result.findOne;

    Exam.findOne = () => Promise.resolve({ _id: examId, academicSessionId: sessionId, schoolId });
    ExamPaper.findOne = () => Promise.resolve({ _id: examPaperId, examId, subjectId, totalMarks: 100, schoolId });
    Student.findOne = () => Promise.resolve({ _id: studentId, classId, sectionId, schoolId });
    Result.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        isLocked: true, // LOCKED!
      });

    await assert.rejects(
      () =>
        resultService.recordStudentMarks(
          {
            examId,
            examPaperId,
            studentId,
            marksObtained: 95,
          },
          adminUser
        ),
      (err) => err.statusCode === 400 && err.message.includes('locked')
    );

    Exam.findOne = origExamFindOne;
    ExamPaper.findOne = origPaperFindOne;
    Student.findOne = origStudentFindOne;
    Result.findOne = origResultFindOne;
  });

  it('should lock and publish section results', async () => {
    const origResultUpdateMany = Result.updateMany;

    Result.updateMany = () => Promise.resolve({ modifiedCount: 25 });

    const lockRes = await resultService.lockSectionResults(examId, sectionId, adminUser);
    assert.equal(lockRes.success, true);

    const pubRes = await resultService.publishSectionResults(examId, sectionId, adminUser);
    assert.equal(pubRes.success, true);

    const unlockRes = await resultService.unlockSectionResults(examId, sectionId, adminUser);
    assert.equal(unlockRes.success, true);

    Result.updateMany = origResultUpdateMany;
  });

  it('should calculate student report card GPA and summary', async () => {
    const origStudentFindOne = Student.findOne;
    const origResultFind = Result.find;
    const origScaleFindOne = GradingScale.findOne;

    GradingScale.findOne = () => Promise.resolve(null);

    Student.findOne = () => {
      const q = {
        populate: () => q,
        then: (resolve) =>
          Promise.resolve({
            _id: studentId,
            userId: 'student-user-1',
            schoolId,
            toJSON: () => ({ id: studentId, firstName: 'Alice' }),
          }).then(resolve),
      };
      return q;
    };

    const mockQuery = {
      populate: () => mockQuery,
      sort: () =>
        Promise.resolve([
          {
            _id: 'mark-1',
            marksObtained: 90,
            maxMarks: 100,
            percentage: 90,
            grade: 'A+',
            gradePoint: 4.0,
            toJSON: () => ({ marksObtained: 90, maxMarks: 100, grade: 'A+' }),
          },
          {
            _id: 'mark-2',
            marksObtained: 80,
            maxMarks: 100,
            percentage: 80,
            grade: 'A',
            gradePoint: 3.7,
            toJSON: () => ({ marksObtained: 80, maxMarks: 100, grade: 'A' }),
          },
        ]),
    };

    Result.find = () => mockQuery;

    const reportCard = await resultService.getStudentReportCard(studentId, examId, adminUser);

    Student.findOne = origStudentFindOne;
    Result.find = origResultFind;
    GradingScale.findOne = origScaleFindOne;

    assert.equal(reportCard.summary.totalSubjects, 2);
    assert.equal(reportCard.summary.totalMarksObtained, 170);
    assert.equal(reportCard.summary.totalMaxMarks, 200);
    assert.equal(reportCard.summary.overallPercentage, 85);
    assert.equal(reportCard.summary.gpa, 3.85);
  });
});
