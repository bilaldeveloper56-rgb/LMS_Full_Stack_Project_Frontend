import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Textarea, Button } from '@/components/ui';
import { createFeeCategorySchema } from '../schemas/fee.schema';
import { useFeeCategories, useCreateFeeCategory } from '../hooks/useFees';

/**
 * FeeCategoryModal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function FeeCategoryModal({ isOpen, onClose }) {
  const { data: categories = [], isLoading: isLoadingCategories } = useFeeCategories();
  const createCategoryMutation = useCreateFeeCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createFeeCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleFormSubmit = async (data) => {
    await createCategoryMutation.mutateAsync(data);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fee Categories"
      className="max-w-xl"
    >
      <div className="space-y-5">
        {/* Create Category Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 p-4 bg-surface-muted/30 rounded-xl border border-border">
          <h4 className="text-xs font-bold text-text-primary">Add New Category</h4>
          <Input
            label="Category Name *"
            placeholder="e.g. Tuition Fee, Admission Fee, Laboratory Fee"
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Brief explanation of category..."
            rows={2}
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createCategoryMutation.isPending}
            >
              Add Category
            </Button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-primary">
            Configured Categories ({categories.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {isLoadingCategories ? (
              <div className="p-3 bg-surface-muted rounded-md animate-pulse text-xs text-text-muted">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted">
                No fee categories added yet.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat._id || cat.id}
                  className="p-2.5 bg-surface border border-border rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-text-primary block">{cat.name}</span>
                    {cat.description && (
                      <span className="text-[11px] text-text-muted">{cat.description}</span>
                    )}
                  </div>
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

export default FeeCategoryModal;
