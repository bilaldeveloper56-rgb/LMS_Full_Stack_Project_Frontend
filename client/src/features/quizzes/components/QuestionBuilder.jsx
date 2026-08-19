import React from 'react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, HelpCircle } from 'lucide-react';
import { Button, Input, Textarea, Select, Card } from '@/components/ui';
import { QUESTION_TYPE_OPTIONS } from '../schemas/quiz.schema';

/**
 * QuestionBuilder component.
 *
 * @param {object} props
 * @param {Array} props.questions
 * @param {Function} props.onChange
 * @param {object} [props.errors]
 */
export function QuestionBuilder({ questions = [], onChange, errors = {} }) {
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Math.random().toString(36).substring(2, 9),
      questionText: '',
      questionType: 'MCQ',
      marks: 1,
      options: [
        { optionText: 'Option 1', isCorrect: true },
        { optionText: 'Option 2', isCorrect: false },
        { optionText: 'Option 3', isCorrect: false },
        { optionText: 'Option 4', isCorrect: false },
      ],
      explanation: '',
    };
    onChange([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (qIndex) => {
    const updated = questions.filter((_, idx) => idx !== qIndex);
    onChange(updated);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    const currentQ = { ...updated[qIndex], [field]: value };

    // Auto-adjust default options on questionType change
    if (field === 'questionType') {
      if (value === 'TRUE_FALSE') {
        currentQ.options = [
          { optionText: 'True', isCorrect: true },
          { optionText: 'False', isCorrect: false },
        ];
      } else if (value === 'MCQ') {
        if (!currentQ.options || currentQ.options.length < 2) {
          currentQ.options = [
            { optionText: 'Option 1', isCorrect: true },
            { optionText: 'Option 2', isCorrect: false },
          ];
        }
      } else if (value === 'SHORT_ANSWER') {
        currentQ.options = [];
      }
    }

    updated[qIndex] = currentQ;
    onChange(updated);
  };

  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    const opts = updated[qIndex].options || [];
    updated[qIndex].options = [
      ...opts,
      { optionText: `Option ${opts.length + 1}`, isCorrect: false },
    ];
    onChange(updated);
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    const updated = [...questions];
    const opts = updated[qIndex].options.filter((_, idx) => idx !== optIndex);
    // Ensure at least one option is marked correct if possible
    if (opts.length > 0 && !opts.some((o) => o.isCorrect)) {
      opts[0].isCorrect = true;
    }
    updated[qIndex].options = opts;
    onChange(updated);
  };

  const handleOptionTextChange = (qIndex, optIndex, text) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].optionText = text;
    onChange(updated);
  };

  const handleSetCorrectOption = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optIndex,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Question Bank ({questions.length})
          </h2>
          <p className="text-xs text-text-muted">
            Configure questions, answer keys, marks, and explanations
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={Plus}
          onClick={handleAddQuestion}
        >
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="p-8 text-center bg-surface-muted/30 border border-dashed border-border rounded-lg space-y-3">
          <HelpCircle className="w-8 h-8 text-text-muted mx-auto" />
          <p className="text-sm font-medium text-text-secondary">
            No questions added to this quiz yet.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={handleAddQuestion}
          >
            Create Question 1
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((q, qIndex) => {
            const hasOptions = q.questionType === 'MCQ' || q.questionType === 'TRUE_FALSE';
            const isTF = q.questionType === 'TRUE_FALSE';

            return (
              <Card key={q.id || qIndex} className="p-5 space-y-4 border-l-4 border-l-primary-500">
                {/* Header: Number, Type, Marks, Remove */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                      {qIndex + 1}
                    </span>
                    <span className="font-semibold text-text-primary text-sm">
                      Question {qIndex + 1}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-44">
                      <Select
                        value={q.questionType}
                        onChange={(e) => handleQuestionChange(qIndex, 'questionType', e.target.value)}
                        options={QUESTION_TYPE_OPTIONS}
                      />
                    </div>

                    <div className="w-24">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Marks"
                        value={q.marks}
                        onChange={(e) => handleQuestionChange(qIndex, 'marks', Number(e.target.value))}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-danger-600 hover:bg-danger-50"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      aria-label={`Remove Question ${qIndex + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Question Text */}
                <Textarea
                  label="Question Prompt / Text *"
                  placeholder="Enter the question prompt..."
                  rows={2}
                  value={q.questionText}
                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                />

                {/* Options / Answer Choice Section */}
                {hasOptions && (
                  <div className="space-y-2.5 bg-surface-muted/40 p-4 rounded-md border border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-text-primary">
                        Answer Options (Select the correct answer below)
                      </label>
                      {!isTF && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          leftIcon={Plus}
                          className="h-7 text-xs text-primary-600"
                          onClick={() => handleAddOption(qIndex)}
                        >
                          Add Option
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {q.options?.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2.5 p-2 rounded-md transition-colors border ${
                            opt.isCorrect
                              ? 'bg-success-50/70 border-success-300'
                              : 'bg-surface border-border'
                          }`}
                        >
                          {/* Correct Radio Toggle */}
                          <button
                            type="button"
                            onClick={() => handleSetCorrectOption(qIndex, optIndex)}
                            className="text-text-muted hover:text-success-600 shrink-0"
                            title={opt.isCorrect ? 'Correct Option' : 'Mark as correct'}
                          >
                            {opt.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-success-600" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          {/* Option Text Input */}
                          <input
                            type="text"
                            value={opt.optionText}
                            disabled={isTF}
                            onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 bg-transparent border-none text-xs text-text-primary focus:outline-none"
                          />

                          {/* Remove Option Button (MCQ only if > 2 options) */}
                          {!isTF && q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIndex, optIndex)}
                              className="text-text-muted hover:text-danger-600 p-1 shrink-0"
                              aria-label="Remove option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Short Answer Info Note */}
                {q.questionType === 'SHORT_ANSWER' && (
                  <div className="flex items-start gap-2 p-3 bg-info-50 text-info-800 rounded-md text-xs border border-info-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Short answer responses require manual instructor review and grading upon student submission.
                    </span>
                  </div>
                )}

                {/* Explanation */}
                <Input
                  label="Explanation / Answer Key Notes (Optional)"
                  placeholder="Explain why the answer is correct (for instructor reference)..."
                  value={q.explanation || ''}
                  onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuestionBuilder;
