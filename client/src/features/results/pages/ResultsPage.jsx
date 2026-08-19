import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BarChart3, Award, Settings, CheckCircle } from 'lucide-react';
import { Breadcrumb, Button, Card, Select } from '@/components/ui';
import { ErrorState, EmptyState } from '@/components/feedback';
import { MarksEntryTable } from '../components/MarksEntryTable';
import { SectionResultsTable } from '../components/SectionResultsTable';
import { GradingScaleModal } from '../components/GradingScaleModal';
import { useExams, useExam } from '@/features/exams';
import { useClasses, useSections } from '@/features/academics';
import { useSectionResults } from '../hooks/useResults';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';

  const { hasPermission } = useAuthorization();
  const canCreateMarks = hasPermission(PERMISSIONS.RESULTS_CREATE);
  const canReadResults = hasPermission(PERMISSIONS.RESULTS_READ);

  const [activeTab, setActiveTab] = useState('entry'); // 'entry' | 'roster'
  const [isGradingScaleModalOpen, setIsGradingScaleModalOpen] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');

  // Queries
  const { data: examsData, isLoading: isLoadingExams } = useExams({ limit: 100 });
  const { data: examDetails, isLoading: isLoadingExamDetails } = useExam(selectedExamId);
  const { data: classesData, isLoading: isLoadingClasses } = useClasses();
  const { data: sectionsData, isLoading: isLoadingSections } = useSections(selectedClassId);

  const exams = examsData?.exams || [];
  const classes = classesData?.classes || classesData || [];
  const sections = sectionsData?.sections || sectionsData || [];
  const papers = examDetails?.papers || [];

  // Filter papers for selected class if selected
  const availablePapers = selectedClassId
    ? papers.filter((p) => (p.classId?._id || p.classId?.id || p.classId)?.toString() === selectedClassId.toString())
    : papers;

  const activePaper = papers.find((p) => (p._id || p.id) === selectedPaperId);

  // Section results query
  const {
    data: sectionResults = [],
    isLoading: isLoadingResults,
    refetch: refetchSectionResults,
  } = useSectionResults(selectedExamId, selectedSectionId);

  // Auto select first exam if none selected
  useEffect(() => {
    if (!selectedExamId && exams.length > 0) {
      setSelectedExamId(exams[0]._id || exams[0].id);
    }
  }, [exams, selectedExamId]);

  // Options
  const examOptions = [
    { value: '', label: isLoadingExams ? 'Loading exams...' : 'Select Examination Term *' },
    ...exams.map((e) => ({ value: e._id || e.id, label: e.name })),
  ];

  const classOptions = [
    { value: '', label: isLoadingClasses ? 'Loading classes...' : 'Select Class *' },
    ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
  ];

  const sectionOptions = [
    { value: '', label: !selectedClassId ? 'Select a class first' : isLoadingSections ? 'Loading sections...' : 'Select Section *' },
    ...sections.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const paperOptions = [
    { value: '', label: availablePapers.length === 0 ? 'No papers scheduled for this class' : 'Select Scheduled Subject Paper *' },
    ...availablePapers.map((p) => {
      const subName = p.subjectId?.name || 'Subject';
      return { value: p._id || p.id, label: `${subName} (Max: ${p.totalMarks})` };
    }),
  ];

  const isSectionLocked = sectionResults.some((r) => r.isLocked);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Results & Marks Entry' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Academic Results & Marks Entry
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Enter marks, view class performance rosters, lock evaluations, and generate report cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Settings}
            onClick={() => setIsGradingScaleModalOpen(true)}
            className="text-xs"
          >
            Grading Scales
          </Button>
        </div>
      </div>

      {/* Controls Bar: Exam, Class, Section Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface p-4 rounded-xl border border-border">
        <Select
          label="Examination Term *"
          value={selectedExamId}
          onChange={(e) => {
            setSelectedExamId(e.target.value);
            setSelectedPaperId('');
          }}
          options={examOptions}
        />

        <Select
          label="Class *"
          value={selectedClassId}
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            setSelectedSectionId('');
            setSelectedPaperId('');
          }}
          options={classOptions}
        />

        <Select
          label="Section *"
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          disabled={!selectedClassId}
          options={sectionOptions}
        />
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('entry')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'entry'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Marks Entry (By Paper)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'roster'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Section Results Roster
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'entry' ? (
        <div className="space-y-4">
          {/* Paper Selector */}
          <div className="bg-surface p-3.5 rounded-xl border border-border max-w-md">
            <Select
              label="Subject Paper to Evaluate *"
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              disabled={!selectedExamId || !selectedClassId}
              options={paperOptions}
            />
          </div>

          {/* Marks Entry Grid */}
          {!selectedExamId || !selectedClassId || !selectedSectionId || !selectedPaperId ? (
            <div className="p-8 text-center bg-surface rounded-xl border border-border text-xs text-text-muted">
              Please select an Examination Term, Class, Section, and Subject Paper above to enter marks.
            </div>
          ) : (
            <MarksEntryTable
              examId={selectedExamId}
              examPaper={activePaper}
              classId={selectedClassId}
              sectionId={selectedSectionId}
              existingResults={sectionResults.filter(
                (r) =>
                  (r.examPaperId?._id || r.examPaperId?.id || r.examPaperId)?.toString() ===
                  selectedPaperId.toString()
              )}
              isLocked={isSectionLocked}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!selectedExamId || !selectedSectionId ? (
            <div className="p-8 text-center bg-surface rounded-xl border border-border text-xs text-text-muted">
              Please select an Examination Term, Class, and Section above to view section results.
            </div>
          ) : (
            <SectionResultsTable
              examId={selectedExamId}
              sectionId={selectedSectionId}
              results={sectionResults}
              isLoading={isLoadingResults}
            />
          )}
        </div>
      )}

      {/* Grading Scale Modal */}
      <GradingScaleModal
        isOpen={isGradingScaleModalOpen}
        onClose={() => setIsGradingScaleModalOpen(false)}
      />
    </div>
  );
}

export default ResultsPage;
