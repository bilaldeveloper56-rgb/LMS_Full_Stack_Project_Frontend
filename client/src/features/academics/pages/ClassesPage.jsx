import React, { useState } from 'react';
import { Plus, School, Users, RefreshCw } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  Pagination,
  Skeleton,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { ClassTable } from '../components/ClassTable';
import { ClassFormModal } from '../components/ClassFormModal';
import { SectionTable } from '../components/SectionTable';
import { SectionFormModal } from '../components/SectionFormModal';
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
} from '../hooks/useAcademics';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function ClassesPage() {
  const { hasPermission } = useAuthorization();
  const canCreateClass = hasPermission(PERMISSIONS.CLASSES_CREATE);
  const canCreateSection = hasPermission(PERMISSIONS.SECTIONS_CREATE);

  const [activeTab, setActiveTab] = useState('classes');

  /* Class state */
  const [classPage, setClassPage] = useState(1);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);

  /* Section state */
  const [sectionPage, setSectionPage] = useState(1);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);

  /* Queries and mutations */
  const {
    data: classesData,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: classError,
    refetch: refetchClasses,
    isFetching: isFetchingClasses,
  } = useClasses({ page: classPage, limit: 10 });

  const {
    data: sectionsData,
    isLoading: isLoadingSections,
    isError: isErrorSections,
    error: sectionError,
    refetch: refetchSections,
    isFetching: isFetchingSections,
  } = useSections({ page: sectionPage, limit: 10 });

  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass(classToEdit?._id || classToEdit?.id);
  const deleteClassMutation = useDeleteClass();

  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection(sectionToEdit?._id || sectionToEdit?.id);
  const deleteSectionMutation = useDeleteSection();

  /* Class handlers */
  const handleOpenCreateClass = () => {
    setClassToEdit(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls) => {
    setClassToEdit(cls);
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = async (formData) => {
    if (classToEdit) {
      await updateClassMutation.mutateAsync(formData);
    } else {
      await createClassMutation.mutateAsync(formData);
    }
    setIsClassModalOpen(false);
    setClassToEdit(null);
  };

  const handleDeleteClass = async (id) => {
    await deleteClassMutation.mutateAsync(id);
  };

  /* Section handlers */
  const handleOpenCreateSection = () => {
    setSectionToEdit(null);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec) => {
    setSectionToEdit(sec);
    setIsSectionModalOpen(true);
  };

  const handleSectionSubmit = async (formData) => {
    if (sectionToEdit) {
      await updateSectionMutation.mutateAsync(formData);
    } else {
      await createSectionMutation.mutateAsync(formData);
    }
    setIsSectionModalOpen(false);
    setSectionToEdit(null);
  };

  const handleDeleteSection = async (id) => {
    await deleteSectionMutation.mutateAsync(id);
  };

  const classes = classesData?.classes || [];
  const classPagination = classesData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const sections = sectionsData?.sections || [];
  const sectionPagination = sectionsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Classes & Sections' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Classes & Sections Management
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage school grade levels, classroom sections, capacities, and assigned homeroom teachers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchClasses();
              refetchSections();
            }}
            isLoading={isFetchingClasses || isFetchingSections}
            leftIcon={RefreshCw}
            aria-label="Refresh classes"
          >
            Refresh
          </Button>

          {activeTab === 'classes' && canCreateClass && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={handleOpenCreateClass}
            >
              New Class
            </Button>
          )}

          {activeTab === 'sections' && canCreateSection && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={handleOpenCreateSection}
            >
              New Section
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="classes">
            <School className="w-4 h-4 mr-2" /> Classes ({classPagination.total})
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Users className="w-4 h-4 mr-2" /> Sections ({sectionPagination.total})
          </TabsTrigger>
        </TabsList>

        {/* Classes Tab Panel */}
        <TabsContent value="classes">
          {isLoadingClasses ? (
            <Card className="p-6 space-y-4">
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-10 bg-surface-muted rounded" />
                ))}
              </div>
            </Card>
          ) : isErrorClasses ? (
            <ErrorState
              title="Failed to load classes"
              message={classError?.message || 'Could not retrieve class records.'}
              onRetry={refetchClasses}
            />
          ) : classes.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={School}
                title="No Classes Configured"
                description="Create grade levels and classes for your school curriculum."
                action={
                  canCreateClass ? (
                    <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleOpenCreateClass}>
                      Create First Class
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <ClassTable
                  classes={classes}
                  onEdit={handleOpenEditClass}
                  onDelete={handleDeleteClass}
                  isDeleting={deleteClassMutation.isPending}
                />
              </Card>

              {classPagination.totalPages > 1 && (
                <div className="flex justify-center sm:justify-end pt-2">
                  <Pagination
                    currentPage={classPagination.page}
                    totalPages={classPagination.totalPages}
                    totalItems={classPagination.total}
                    pageSize={classPagination.limit}
                    onPageChange={setClassPage}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Sections Tab Panel */}
        <TabsContent value="sections">
          {isLoadingSections ? (
            <Card className="p-6 space-y-4">
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-10 bg-surface-muted rounded" />
                ))}
              </div>
            </Card>
          ) : isErrorSections ? (
            <ErrorState
              title="Failed to load sections"
              message={sectionError?.message || 'Could not retrieve section records.'}
              onRetry={refetchSections}
            />
          ) : sections.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={Users}
                title="No Sections Configured"
                description="Assign classroom sections and homeroom in-charges under your classes."
                action={
                  canCreateSection ? (
                    <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleOpenCreateSection}>
                      Create First Section
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <SectionTable
                  sections={sections}
                  onEdit={handleOpenEditSection}
                  onDelete={handleDeleteSection}
                  isDeleting={deleteSectionMutation.isPending}
                />
              </Card>

              {sectionPagination.totalPages > 1 && (
                <div className="flex justify-center sm:justify-end pt-2">
                  <Pagination
                    currentPage={sectionPagination.page}
                    totalPages={sectionPagination.totalPages}
                    totalItems={sectionPagination.total}
                    pageSize={sectionPagination.limit}
                    onPageChange={setSectionPage}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Class Modal */}
      <ClassFormModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSubmit={handleClassSubmit}
        initialValues={classToEdit}
        isLoading={createClassMutation.isPending || updateClassMutation.isPending}
      />

      {/* Section Modal */}
      <SectionFormModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSubmit={handleSectionSubmit}
        initialValues={sectionToEdit}
        isLoading={createSectionMutation.isPending || updateSectionMutation.isPending}
      />
    </div>
  );
}

export default ClassesPage;
