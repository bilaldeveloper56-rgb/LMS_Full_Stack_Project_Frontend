import React, { useState, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, Button, Textarea, Modal } from '@/components/ui';
import { QuizTimer } from './QuizTimer';

/**
 * TakeQuizRunner component.
 *
 * @param {object} props
 * @param {object} props.quiz
 * @param {object} props.attempt
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isSubmitting=false]
 */
export function TakeQuizRunner({
  quiz,
  attempt,
  onSubmit,
  isSubmitting = false,
}) {
  const questions = quiz.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const currentQ = questions[currentIdx] || null;
  const currentQId = currentQ?._id || currentQ?.id;

  const handleSelectOption = (qId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        selectedOptionIndex: optionIndex,
        textAnswer: null,
      },
    }));
  };

  const handleTextAnswerChange = (qId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        selectedOptionIndex: null,
        textAnswer: text,
      },
    }));
  };

  const isQuestionAnswered = (q) => {
    const qId = q._id || q.id;
    const ans = answers[qId];
    if (!ans) return false;
    if (q.questionType === 'SHORT_ANSWER') {
      return Boolean(ans.textAnswer && ans.textAnswer.trim().length > 0);
    }
    return ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;

  const handleSubmit = useCallback(async () => {
    const payload = {
      answers: questions.map((q) => {
        const qId = q._id || q.id;
        const ans = answers[qId] || {};
        return {
          questionId: qId,
          selectedOptionIndex:
            ans.selectedOptionIndex !== undefined && ans.selectedOptionIndex !== null
              ? ans.selectedOptionIndex
              : null,
          textAnswer: ans.textAnswer || null,
        };
      }),
    };
    await onSubmit(payload);
  }, [questions, answers, onSubmit]);

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">
        No questions available for this quiz.
      </div>
    );
  }

  const currentAns = answers[currentQId] || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner: Quiz Info & Timer */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            {quiz.title}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Answered {answeredCount} of {questions.length} questions • Max Marks: {quiz.totalMarks}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <QuizTimer
            startedAt={attempt.startedAt}
            durationMinutes={quiz.durationMinutes}
            onExpire={handleSubmit}
          />
          <Button
            variant="primary"
            size="sm"
            leftIcon={Send}
            onClick={() => setIsConfirmModalOpen(true)}
            isLoading={isSubmitting}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Question Number Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {questions.map((q, idx) => {
          const answered = isQuestionAnswered(q);
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`w-9 h-9 rounded-lg font-mono text-xs font-bold transition-all shrink-0 flex items-center justify-center border ${
                isCurrent
                  ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                  : answered
                  ? 'bg-success-50 text-success-700 border-success-300'
                  : 'bg-surface text-text-secondary border-border hover:bg-surface-muted'
              }`}
              aria-label={`Go to Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current Question Body */}
      <Card className="p-6 space-y-6">
        {/* Header: Question Number & Marks */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-bold">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-xs text-text-muted font-medium">
              ({currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'})
            </span>
          </div>
          <span className="text-xs text-text-muted capitalize">
            {currentQ.questionType.replace('_', ' ')}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="text-base font-medium text-text-primary leading-relaxed">
          {currentQ.questionText}
        </div>

        {/* Options / Short Answer Area */}
        {currentQ.questionType === 'SHORT_ANSWER' ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-primary">
              Your Written Response
            </label>
            <Textarea
              placeholder="Type your explanation or response here..."
              rows={6}
              value={currentAns.textAnswer || ''}
              onChange={(e) => handleTextAnswerChange(currentQId, e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-text-primary">
              Choose the correct option:
            </label>
            <div className="space-y-2.5">
              {currentQ.options?.map((opt, optIdx) => {
                const isSelected = currentAns.selectedOptionIndex === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQId, optIdx)}
                    className={`w-full text-left p-3.5 rounded-lg border text-xs flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-primary-50/80 border-primary-500 shadow-2xs font-semibold text-primary-900'
                        : 'bg-surface border-border hover:bg-surface-muted/60 text-text-primary'
                    }`}
                  >
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                    <span className="flex-1">{opt.optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={ChevronLeft}
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => prev - 1)}
          >
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              rightIcon={ChevronRight}
              onClick={() => setCurrentIdx((prev) => prev + 1)}
            >
              Next Question
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={Send}
              onClick={() => setIsConfirmModalOpen(true)}
            >
              Finish & Review
            </Button>
          )}
        </div>
      </Card>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Final Quiz Submission"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Are you ready to submit your answers?
              </p>
              <p className="text-xs text-text-muted mt-1">
                You have answered <span className="font-bold text-text-primary">{answeredCount}</span> of{' '}
                <span className="font-bold text-text-primary">{questions.length}</span> questions.
                {answeredCount < questions.length && (
                  <span className="text-warning-700 block mt-1">
                    Warning: You have {questions.length - answeredCount} unanswered question(s).
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isSubmitting}
            >
              Continue Test
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                setIsConfirmModalOpen(false);
                await handleSubmit();
              }}
              isLoading={isSubmitting}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TakeQuizRunner;
