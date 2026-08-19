import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Select, Textarea, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { createFeeConcessionSchema, DISCOUNT_TYPES } from '../schemas/fee.schema';
import { useCreateFeeConcession, useFeeConcessions } from '../hooks/useFees';

/**
 * FeeConcessionModal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function FeeConcessionModal({ isOpen, onClose }) {
  const { data: concessions = [], isLoading: isLoadingConcessions } = useFeeConcessions();
  const createConcessionMutation = useCreateFeeConcession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createFeeConcessionSchema),
    defaultValues: {
      name: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      reason: '',
    },
  });

  const handleFormSubmit = async (data) => {
    await createConcessionMutation.mutateAsync({
      ...data,
      discountValue: Number(data.discountValue),
    });
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fee Concessions & Scholarships"
      className="max-w-xl"
    >
      <div className="space-y-5">
        {/* Create Concession Policy */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-3.5 p-4 bg-surface-muted/30 rounded-xl border border-border"
        >
          <h4 className="text-xs font-bold text-text-primary">Add New Concession Policy</h4>

          <Input
            label="Concession Name *"
            placeholder="e.g. Sibling Discount, Merit Scholarship, Staff Child"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Discount Type *"
              options={DISCOUNT_TYPES}
              error={errors.discountType?.message}
              {...register('discountType')}
            />

            <Input
              label="Discount Value *"
              type="number"
              min={0}
              step="any"
              placeholder="e.g. 10 (%) or 500 (₨)"
              error={errors.discountValue?.message}
              {...register('discountValue')}
            />
          </div>

          <Textarea
            label="Policy Reason / Criteria"
            placeholder="Eligibility notes or criteria..."
            rows={2}
            error={errors.reason?.message}
            {...register('reason')}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createConcessionMutation.isPending}
            >
              Add Concession Policy
            </Button>
          </div>
        </form>

        {/* Existing Concessions List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-primary">
            Active Concession Policies ({concessions.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {isLoadingConcessions ? (
              <div className="p-3 bg-surface-muted rounded-md animate-pulse text-xs text-text-muted">
                Loading concessions...
              </div>
            ) : concessions.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted">
                No concession policies defined yet.
              </div>
            ) : (
              concessions.map((conc) => (
                <div
                  key={conc._id || conc.id}
                  className="p-2.5 bg-surface border border-border rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-text-primary block">{conc.name}</span>
                    {conc.reason && (
                      <span className="text-[11px] text-text-muted">{conc.reason}</span>
                    )}
                  </div>
                  <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-success-50 text-success-700">
                    {conc.discountType === 'PERCENTAGE'
                      ? `${conc.discountValue}% OFF`
                      : `${formatCurrency(conc.discountValue)} OFF`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default FeeConcessionModal;
