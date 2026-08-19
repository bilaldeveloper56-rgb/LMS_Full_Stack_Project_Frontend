import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Select, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { generateInvoiceSchema } from '../schemas/fee.schema';
import {
  useGenerateInvoices,
  useFeeStructures,
  useFeeConcessions,
} from '../hooks/useFees';
import { useAcademicSessions, useClasses, useSections } from '@/features/academics';
import { useStudents } from '@/features/students';

/**
 * GenerateInvoiceModal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function GenerateInvoiceModal({ isOpen, onClose }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const { data: sessionsData, isLoading: isLoadingSessions } = useAcademicSessions();
  const { data: classesData, isLoading: isLoadingClasses } = useClasses();
  const { data: sectionsData, isLoading: isLoadingSections } = useSections(selectedClassId);
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    classId: selectedClassId,
    sectionId: selectedSectionId,
    limit: 100,
  });

  const { data: structures = [], isLoading: isLoadingStructures } = useFeeStructures({
    classId: selectedClassId,
    academicSessionId: selectedSessionId,
  });
  const { data: concessions = [] } = useFeeConcessions();

  const generateInvoicesMutation = useGenerateInvoices();

  const sessions = sessionsData?.academicSessions || sessionsData?.sessions || sessionsData || [];
  const classes = classesData?.classes || classesData || [];
  const sections = sectionsData?.sections || sectionsData || [];
  const students = studentsData?.students || studentsData || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: {
      academicSessionId: '',
      classId: '',
      sectionId: '',
      studentId: '',
      feeStructureIds: [],
      concessionId: '',
      title: '',
      dueDate: '',
    },
  });

  const selectedStructureIds = watch('feeStructureIds') || [];

  const handleStructureToggle = (structId) => {
    const current = [...selectedStructureIds];
    const index = current.indexOf(structId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(structId);
    }
    setValue('feeStructureIds', current, { shouldValidate: true });
  };

  const handleFormSubmit = async (data) => {
    const payload = {
      ...data,
      sectionId: data.sectionId || undefined,
      studentId: data.studentId || undefined,
      concessionId: data.concessionId || undefined,
    };
    await generateInvoicesMutation.mutateAsync(payload);
    reset();
    onClose();
  };

  const sessionOptions = [
    { value: '', label: isLoadingSessions ? 'Loading sessions...' : 'Select Academic Session *' },
    ...sessions.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const classOptions = [
    { value: '', label: isLoadingClasses ? 'Loading classes...' : 'Select Class *' },
    ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
  ];

  const sectionOptions = [
    { value: '', label: 'All Sections (Whole Class)' },
    ...sections.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const studentOptions = [
    { value: '', label: 'All Students in Scope (Batch Generation)' },
    ...students.map((st) => {
      const name = `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
      const roll = st.rollNumber ? `[Roll: ${st.rollNumber}]` : '';
      return { value: st._id || st.id, label: `${name} ${roll}` };
    }),
  ];

  const concessionOptions = [
    { value: '', label: 'No Concession / Standard Rate' },
    ...concessions.map((c) => ({
      value: c._id || c.id,
      label: `${c.name} (${c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `${formatCurrency(c.discountValue)}`})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Fee Invoices / Challans"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Title */}
        <Input
          label="Invoice / Challan Title *"
          placeholder="e.g. October 2026 Tuition Fee Challan"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Academic Session */}
        <Select
          label="Academic Session *"
          options={sessionOptions}
          error={errors.academicSessionId?.message}
          {...register('academicSessionId', {
            onChange: (e) => setSelectedSessionId(e.target.value),
          })}
        />

        {/* Class and Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Class *"
            options={classOptions}
            error={errors.classId?.message}
            {...register('classId', {
              onChange: (e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('');
              },
            })}
          />

          <Select
            label="Section (Optional)"
            options={sectionOptions}
            disabled={!selectedClassId}
            {...register('sectionId', {
              onChange: (e) => setSelectedSectionId(e.target.value),
            })}
          />
        </div>

        {/* Single Student Selector (Optional) */}
        <Select
          label="Target Student (Optional)"
          options={studentOptions}
          disabled={!selectedClassId}
          {...register('studentId')}
        />

        {/* Fee Structures Checkboxes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-primary block">
            Select Fee Structure Items *
          </label>
          {errors.feeStructureIds && (
            <p className="text-[11px] text-danger-600">{errors.feeStructureIds.message}</p>
          )}

          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-surface-muted/30 border border-border rounded-lg">
            {!selectedClassId ? (
              <div className="p-2 text-center text-xs text-text-muted">
                Select a class above to see configured fee structures.
              </div>
            ) : isLoadingStructures ? (
              <div className="p-2 text-xs text-text-muted animate-pulse">
                Loading class structures...
              </div>
            ) : structures.length === 0 ? (
              <div className="p-2 text-center text-xs text-text-muted">
                No fee structures configured for this class. Create a structure first.
              </div>
            ) : (
              structures.map((struct) => {
                const sId = struct._id || struct.id;
                const isSelected = selectedStructureIds.includes(sId);
                return (
                  <label
                    key={sId}
                    className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-50 border-primary-300 text-primary-900 font-semibold'
                        : 'bg-surface border-border text-text-secondary hover:bg-surface-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStructureToggle(sId)}
                        className="rounded border-border text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <span>{struct.name}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(struct.amount)}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Concession & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Apply Concession (Optional)"
            options={concessionOptions}
            {...register('concessionId')}
          />

          <Input
            label="Payment Due Date *"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={generateInvoicesMutation.isPending}
          >
            Generate Invoices
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default GenerateInvoiceModal;
