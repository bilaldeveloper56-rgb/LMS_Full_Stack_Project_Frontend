import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Award, User, BookOpen } from 'lucide-react';
import { Modal, Input, Textarea, Button, Checkbox } from '@/components/ui';
import { gradeQuizAttemptSchema } from '../schemas/quiz.schema';

/**
 * GradeAttemptModal component.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.attempt]
 * @param {object} [props.quiz]
 * @param {boolean} [props.isLoading=false]
 */
export function GradeAttemptModal({
  isOpen,
  onClose,
  onSubmit,
  attempt = null,
  quiz = null,
  isLoading = false,
}) {
  const [grades, setGrades] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (attempt && attempt.answers) {
      setGrades(
        attempt.answers.map((ans) => ({
          questionId: ans.questionId,
          marksAwarded: ans.marksAwarded || 0,
          isCorrect: ans.isCorrect ?? false,
        }))
      );
      setFeedback(attempt.feedback || '');
    }
  }, [attempt, isOpen]);

  const handleMarksChange = (qId, val) => {
    setGrades((prev) =>
      prev.map((g) => (g.questionId === qId ? { ...g, marksAwarded: Number(val) } : g))
    );
  };

  const handleCorrectnessChange = (qId, val) => {
    setGrades((prev) =>
      prev.map((g) => (g.questionId === qId ? { ...g, isCorrect: val } : g))
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (attempt) {
      await onSubmit({
        attemptId: attempt._id || attempt.id,
        answers: grades,
        feedback: feedback || undefined,
      });
      onClose();
    }
  };

  const studentName = attempt?.studentId
    ? `${attempt.studentId.firstName || ''} ${attempt.studentId.lastName || ''}`.trim()
    : 'Student';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluate Student Quiz Attempt"
      className="max-w-2xl"
    >
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Attempt Details Header */}
        <div className="bg-surface-muted/60 p-3.5 rounded-md text-xs space-y-1 text-text-secondary border border-border">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary">
              Student: {studentName} ({attempt?.studentId?.admissionNumber || '—'})
            </span>
            <span className="font-bold text-primary-700">
              Attempt #{attempt?.attemptNumber || 1}
            </span>
          </div>
          <div>Quiz: {quiz?.title || 'Quiz'}</div>
        </div>

        {/* Question Grade List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {attempt?.answers?.map((ans, idx) => {
            const question = quiz?.questions?.find(
              (q) => (q._id || q.id) === ans.questionId
            );
            const currentGrade = grades.find((g) => g.questionId === ans.questionId) || {
              marksAwarded: 0,
              isCorrect: false,
            };

            return (
              <div key={idx} className="p-3.5 bg-surface rounded-lg border border-border space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-border pb-1.5">
                  <span className="font-semibold text-text-primary">
                    Question {idx + 1} ({question?.questionType || 'MCQ'})
                  </span>
                  <span className="text-text-muted">
                    Max Marks: {question?.marks || 1}
                  </span>
                </div>

                <p className="text-xs text-text-primary font-medium">
                  {question?.questionText || 'Question prompt'}
                </p>

                {/* Student's Answer */}
                <div className="bg-surface-muted p-2 rounded text-xs text-text-secondary space-y-1">
                  <span className="font-semibold text-text-primary">Student Answer:</span>
                  {ans.textAnswer ? (
                    <p className="italic">{ans.textAnswer}</p>
                  ) : ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined ? (
                    <p>Option Selected: Index {ans.selectedOptionIndex}</p>
                  ) : (
                    <p className="text-text-muted">No response submitted</p>
                  )}
                </div>

                {/* Score & Correctness Controls */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-32">
                    <Input
                      label="Awarded Marks"
                      type="number"
                      min={0}
                      max={question?.marks || 100}
                      step="0.5"
                      value={currentGrade.marksAwarded}
                      onChange={(e) => handleMarksChange(ans.questionId, e.target.value)}
                    />
                  </div>

                  <div className="pt-5">
                    <Checkbox
                      label="Mark as correct"
                      checked={currentGrade.isCorrect}
                      onChange={(e) => handleCorrectnessChange(ans.questionId, e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback */}
        <Textarea
          label="Overall Instructor Feedback (Optional)"
          placeholder="Enter feedback or performance observations..."
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            Save Grades & Evaluation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default GradeAttemptModal;
