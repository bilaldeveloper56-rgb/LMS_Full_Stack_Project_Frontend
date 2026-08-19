import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Award, Check } from 'lucide-react';
import { Modal, Input, Button, Badge } from '@/components/ui';
import { createGradingScaleSchema } from '../schemas/result.schema';
import { useGradingScales, useCreateGradingScale } from '../hooks/useResults';

/**
 * GradingScaleModal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function GradingScaleModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'

  const { data: scales = [], isLoading: isLoadingScales } = useGradingScales();
  const createScaleMutation = useCreateGradingScale();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGradingScaleSchema),
    defaultValues: {
      name: '',
      isDefault: false,
      grades: [
        { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 4.0, description: 'Outstanding' },
        { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.7, description: 'Excellent' },
        { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.0, description: 'Good' },
        { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gradePoint: 2.0, description: 'Satisfactory' },
        { grade: 'D', minPercentage: 40, maxPercentage: 59.99, gradePoint: 1.0, description: 'Pass' },
        { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gradePoint: 0.0, description: 'Fail' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'grades',
  });

  const handleFormSubmit = async (data) => {
    await createScaleMutation.mutateAsync(data);
    reset();
    setActiveTab('list');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grading Scales & GPA Settings"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'list'
                ? 'bg-primary-50 text-primary-700'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Active Scales ({scales.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'create'
                ? 'bg-primary-50 text-primary-700'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            + Create New Scale
          </button>
        </div>

        {activeTab === 'list' ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {isLoadingScales ? (
              <div className="p-4 space-y-2 animate-pulse" aria-busy="true">
                <div className="h-16 bg-surface-muted rounded-lg" />
                <div className="h-16 bg-surface-muted rounded-lg" />
              </div>
            ) : scales.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">
                No custom grading scales found. The default 4.0 GPA scale is active.
              </div>
            ) : (
              scales.map((scale) => {
                const id = scale._id || scale.id;
                return (
                  <div key={id} className="p-3.5 bg-surface border border-border rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary-600" />
                        <h4 className="text-xs font-bold text-text-primary">{scale.name}</h4>
                        {scale.isDefault && (
                          <Badge variant="primary" size="sm">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                      {scale.grades?.map((g, idx) => (
                        <div key={idx} className="bg-surface-muted/60 p-2 rounded-md border border-border/60">
                          <span className="font-bold text-text-primary block text-sm">{g.grade}</span>
                          <span className="text-[10px] text-text-muted block">
                            {g.minPercentage}% - {g.maxPercentage}%
                          </span>
                          <span className="text-[10px] font-semibold text-primary-700 block">
                            {g.gradePoint} GP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Scale Name *"
                  placeholder="e.g. Standard High School Scale"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary-600 focus:ring-primary-500 h-4 w-4"
                    {...register('isDefault')}
                  />
                  <span>Set as Default Scale</span>
                </label>
              </div>
            </div>

            {/* Grades Table Builder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-primary">
                  Grade Boundaries ({fields.length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={Plus}
                  className="h-7 text-xs px-2"
                  onClick={() =>
                    append({
                      grade: '',
                      minPercentage: 0,
                      maxPercentage: 100,
                      gradePoint: 0,
                      description: '',
                    })
                  }
                >
                  Add Grade
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-border p-2 rounded-lg bg-surface-muted/20">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 items-center bg-surface p-2 rounded-md border border-border text-xs"
                  >
                    <div className="col-span-2">
                      <Input
                        placeholder="Grade (A+)"
                        error={errors.grades?.[idx]?.grade?.message}
                        {...register(`grades.${idx}.grade`)}
                        className="text-xs py-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Min %"
                        type="number"
                        step="any"
                        error={errors.grades?.[idx]?.minPercentage?.message}
                        {...register(`grades.${idx}.minPercentage`)}
                        className="text-xs py-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Max %"
                        type="number"
                        step="any"
                        error={errors.grades?.[idx]?.maxPercentage?.message}
                        {...register(`grades.${idx}.maxPercentage`)}
                        className="text-xs py-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Points"
                        type="number"
                        step="any"
                        error={errors.grades?.[idx]?.gradePoint?.message}
                        {...register(`grades.${idx}.gradePoint`)}
                        className="text-xs py-1"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Note"
                        {...register(`grades.${idx}.description`)}
                        className="text-xs py-1"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="text-text-muted hover:text-danger-600 p-1"
                          aria-label="Remove grade boundary"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('list')}
              >
                Back to Scales
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={createScaleMutation.isPending}
              >
                Save Scale
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default GradingScaleModal;
