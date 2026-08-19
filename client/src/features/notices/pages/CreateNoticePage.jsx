import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Breadcrumb, Button, Card, Input, Textarea, Select } from '@/components/ui';
import { createNoticeSchema, NOTICE_PRIORITIES, TARGET_AUDIENCES } from '../schemas/notice.schema';
import { useCreateNotice } from '../hooks/useNotices';
import { useClasses } from '@/features/academics';

export function CreateNoticePage() {
  const navigate = useNavigate();
  const createNoticeMutation = useCreateNotice();
  const { data: classesData } = useClasses();
  const classes = classesData?.classes || classesData || [];

  const [attachments, setAttachments] = useState([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createNoticeSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: 'NORMAL',
      targetAudience: 'ALL',
      targetClassIds: [],
      isPinned: false,
      expiresAt: '',
    },
  });

  const selectedAudience = watch('targetAudience');

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) return;
    setAttachments((prev) => [
      ...prev,
      { name: newAttachmentName.trim(), url: newAttachmentUrl.trim() },
    ]);
    setNewAttachmentName('');
    setNewAttachmentUrl('');
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data) => {
    const payload = {
      ...data,
      attachments,
      expiresAt: data.expiresAt || undefined,
    };
    await createNoticeMutation.mutateAsync(payload);
    navigate('/notices');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notice Board', href: '/notices' },
          { label: 'Create Announcement' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Create Notice / Announcement
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Draft a new announcement for the school bulletin board
          </p>
        </div>
        <Link to="/notices">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card className="p-6 space-y-5 border border-border bg-surface shadow-2xs">
          {/* Title */}
          <Input
            label="Notice Title *"
            placeholder="e.g. Annual Sports Day Schedule & Instructions"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Priority & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority Level *"
              options={NOTICE_PRIORITIES}
              error={errors.priority?.message}
              {...register('priority')}
            />

            <Select
              label="Target Audience *"
              options={TARGET_AUDIENCES}
              error={errors.targetAudience?.message}
              {...register('targetAudience')}
            />
          </div>

          {/* Class-Specific Selector */}
          {selectedAudience === 'CLASS_SPECIFIC' && (
            <div className="space-y-2 p-3.5 bg-surface-muted/50 rounded-xl border border-border">
              <label className="text-xs font-bold text-text-primary block">
                Select Target Classes *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {classes.map((cls) => {
                  const cId = cls._id || cls.id;
                  return (
                    <label key={cId} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        value={cId}
                        {...register('targetClassIds')}
                        className="rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      <span>{cls.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <Textarea
            label="Announcement Details & Body *"
            placeholder="Write full notice details here..."
            rows={6}
            error={errors.content?.message}
            {...register('content')}
          />

          {/* Pin & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border cursor-pointer hover:bg-surface-muted/40 transition-colors">
              <input
                type="checkbox"
                {...register('isPinned')}
                className="rounded border-border text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <div>
                <span className="text-xs font-bold text-text-primary block">Pin to Top</span>
                <span className="text-[11px] text-text-muted">Keep this announcement highlighted at the top of the feed</span>
              </div>
            </label>

            <Input
              label="Expiration Date (Optional)"
              type="date"
              error={errors.expiresAt?.message}
              {...register('expiresAt')}
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attachments / Circular Documents ({attachments.length})</span>
              </label>
            </div>

            {/* Add Attachment Row */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Document Name (e.g. Schedule PDF)"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  placeholder="Document URL (https://...)"
                  value={newAttachmentUrl}
                  onChange={(e) => setNewAttachmentUrl(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10"
                onClick={handleAddAttachment}
                leftIcon={Plus}
              >
                Add
              </Button>
            </div>

            {/* Attachments list */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-muted border border-border text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <span className="font-semibold text-text-primary truncate">{att.name}</span>
                      <span className="text-[11px] text-text-muted truncate">({att.url})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-danger-600 hover:text-danger-700"
                      onClick={() => handleRemoveAttachment(idx)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link to="/notices">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createNoticeMutation.isPending}
          >
            Save Draft Notice
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateNoticePage;
