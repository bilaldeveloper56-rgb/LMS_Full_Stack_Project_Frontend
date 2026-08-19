import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  RefreshCw,
  History,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Card,
  Input,
  Select,
  Checkbox,
  Badge,
  Modal,
  Pagination,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import {
  useAcademicSessions,
  useClasses,
  useSections,
} from '../hooks/useAcademics';
import {
  usePromotionPreview,
  useExecuteBulkPromotion,
  usePromotionHistory,
} from '../hooks/usePromotions';
import { PROMOTION_STATUS, PROMOTION_STATUS_OPTIONS } from '../schemas/promotion.schema';
import { formatDate } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function StudentPromotionPage() {
  const { hasPermission } = useAuthorization();
  const canPromote = hasPermission(PERMISSIONS.PROMOTIONS_CREATE);

  const [activeTab, setActiveTab] = useState('promote');

  // ── Step 1: Promotion Context State ──
  const [sourceSessionId, setSourceSessionId] = useState('');
  const [destSessionId, setDestSessionId] = useState('');
  const [sourceClassId, setSourceClassId] = useState('');
  const [sourceSectionId, setSourceSectionId] = useState('');
  const [destClassId, setDestClassId] = useState('');
  const [destSectionId, setDestSectionId] = useState('');

  // ── Step 2: Student Decision & Selection State ──
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [studentDecisions, setStudentDecisions] = useState({}); // { [studentId]: { status, targetSectionId, newRollNumber, reason } }
  const [studentSearch, setStudentSearch] = useState('');
  const [allowCapacityOverride, setAllowCapacityOverride] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // ── Step 3: History Tab Filters State ──
  const [historyFilters, setHistoryFilters] = useState({
    page: 1,
    limit: 10,
    promotionStatus: '',
    search: '',
  });

  // ── Queries ──
  const { data: sessionsData } = useAcademicSessions({ limit: 50 });
  const { data: classesData } = useClasses({ limit: 50 });
  const { data: sourceSectionsData } = useSections(
    { classId: sourceClassId, limit: 50 },
    { enabled: Boolean(sourceClassId) }
  );
  const { data: destSectionsData } = useSections(
    { classId: destClassId, limit: 50 },
    { enabled: Boolean(destClassId) }
  );

  const sessions = sessionsData?.sessions || [];
  const classes = classesData?.classes || [];
  const sourceSections = sourceSectionsData?.sections || [];
  const destSections = destSectionsData?.sections || [];

  // Default active session selection
  useEffect(() => {
    if (sessions.length > 0 && !sourceSessionId) {
      const activeSession = sessions.find((s) => s.isCurrent || s.status === 'ACTIVE');
      if (activeSession) {
        setSourceSessionId(activeSession.id || activeSession._id);
      }
    }
  }, [sessions, sourceSessionId]);

  // Preview Query
  const previewPayload = useMemo(() => {
    if (!sourceSessionId || !destSessionId || !sourceClassId || !sourceSectionId) {
      return null;
    }
    return {
      sourceAcademicSessionId: sourceSessionId,
      destinationAcademicSessionId: destSessionId,
      sourceClassId,
      sourceSectionId,
      destinationClassId: destClassId || undefined,
      destinationSectionId: destSectionId || undefined,
    };
  }, [sourceSessionId, destSessionId, sourceClassId, sourceSectionId, destClassId, destSectionId]);

  const {
    data: previewData,
    isLoading: isLoadingPreview,
    isError: isErrorPreview,
    error: previewError,
    refetch: refetchPreview,
  } = usePromotionPreview(previewPayload);

  // Execute Bulk Promotion Mutation
  const promoteMutation = useExecuteBulkPromotion();

  // History Query
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    refetch: refetchHistory,
  } = usePromotionHistory(historyFilters, { enabled: activeTab === 'history' });

  // Initialize decisions and selections when preview candidates change
  useEffect(() => {
    if (previewData?.candidates) {
      const initialSelected = new Set();
      const initialDecisions = {};

      previewData.candidates.forEach((cand) => {
        const id = cand.studentId.toString();
        // If not already enrolled, default to selected
        if (!cand.alreadyEnrolledInDestination) {
          initialSelected.add(id);
        }

        initialDecisions[id] = {
          status: cand.resultsSummary?.suggestedStatus || PROMOTION_STATUS.PROMOTED,
          targetSectionId: destSectionId || '',
          newRollNumber: cand.currentRollNumber || '',
          reason: '',
        };
      });

      setSelectedStudentIds(initialSelected);
      setStudentDecisions(initialDecisions);
    }
  }, [previewData, destSectionId]);

  // Candidate filtering
  const candidates = previewData?.candidates || [];
  const filteredCandidates = useMemo(() => {
    if (!studentSearch.trim()) return candidates;
    const q = studentSearch.toLowerCase();
    return candidates.filter(
      (c) =>
        c.firstName?.toLowerCase().includes(q) ||
        c.lastName?.toLowerCase().includes(q) ||
        c.admissionNumber?.toLowerCase().includes(q) ||
        c.currentRollNumber?.toLowerCase().includes(q)
    );
  }, [candidates, studentSearch]);

  // Selection handlers
  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(filteredCandidates.map((c) => c.studentId.toString()));
      setSelectedStudentIds(allIds);
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleDecisionChange = (studentId, field, value) => {
    setStudentDecisions((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value,
      },
    }));
  };

  const handleBulkStatusChange = (status) => {
    setStudentDecisions((prev) => {
      const updated = { ...prev };
      selectedStudentIds.forEach((id) => {
        updated[id] = { ...(updated[id] || {}), status };
      });
      return updated;
    });
  };

  const handleBulkTargetSectionChange = (targetSectionId) => {
    setStudentDecisions((prev) => {
      const updated = { ...prev };
      selectedStudentIds.forEach((id) => {
        updated[id] = { ...(updated[id] || {}), targetSectionId };
      });
      return updated;
    });
  };

  // Capacity calculation
  const destCapacity = previewData?.destinationSection?.capacity || 40;
  const currentDestEnrolled = previewData?.destinationSection?.currentEnrolled || 0;
  const incomingToDestSectionCount = Array.from(selectedStudentIds).filter((id) => {
    const decision = studentDecisions[id];
    return (
      decision?.status === PROMOTION_STATUS.PROMOTED &&
      (!decision.targetSectionId || decision.targetSectionId === destSectionId)
    );
  }).length;

  const totalProjectedEnrolled = currentDestEnrolled + incomingToDestSectionCount;
  const isOverCapacity = totalProjectedEnrolled > destCapacity;

  // Promotion execution
  const handleConfirmPromotion = async () => {
    const promotionItems = Array.from(selectedStudentIds).map((id) => {
      const decision = studentDecisions[id] || {};
      return {
        studentId: id,
        promotionStatus: decision.status || PROMOTION_STATUS.PROMOTED,
        targetClassId:
          decision.status === PROMOTION_STATUS.PROMOTED
            ? destClassId || undefined
            : sourceClassId || undefined,
        targetSectionId: decision.targetSectionId || destSectionId || undefined,
        newRollNumber: decision.newRollNumber || undefined,
        reason: decision.reason || undefined,
      };
    });

    const payload = {
      sourceAcademicSessionId: sourceSessionId,
      destinationAcademicSessionId: destSessionId,
      sourceClassId,
      sourceSectionId,
      destinationClassId: destClassId || undefined,
      destinationSectionId: destSectionId || undefined,
      allowCapacityOverride,
      promotions: promotionItems,
    };

    try {
      await promoteMutation.mutateAsync(payload);
      setShowPreviewModal(false);
      refetchPreview();
    } catch (err) {
      // Handled by hook toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Academics', href: '/classes' },
          { label: 'Student Promotion' },
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Student Academic Promotion System
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Seamlessly promote, retain, or graduate student cohorts across academic sessions without overwriting historical records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="promote" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Promote Cohort
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Promotion Audit History
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: PROMOTION WORKFLOW ── */}
        <TabsContent value="promote" className="space-y-6">
          {/* Context Configuration Card */}
          <Card className="p-6 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-600" />
                1. Select Academic Session & Cohort
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Specify the current academic context and destination placement for the student cohort.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Context Column */}
              <div className="bg-surface-muted/40 p-4 rounded-lg border border-border space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border/80 pb-2">
                  <Calendar className="w-4 h-4 text-warning-600" />
                  Source (Current Session)
                </div>

                <Select
                  label="Current Academic Session *"
                  value={sourceSessionId}
                  onChange={(e) => setSourceSessionId(e.target.value)}
                  options={[
                    { label: 'Select Current Session', value: '' },
                    ...sessions.map((s) => ({
                      label: `${s.name} ${s.isCurrent ? '(Active Current)' : `(${s.status})`}`,
                      value: s.id || s._id,
                    })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Current Class *"
                    value={sourceClassId}
                    onChange={(e) => {
                      setSourceClassId(e.target.value);
                      setSourceSectionId('');
                    }}
                    options={[
                      { label: 'Select Class', value: '' },
                      ...classes.map((c) => ({ label: c.name, value: c.id || c._id })),
                    ]}
                  />

                  <Select
                    label="Current Section *"
                    value={sourceSectionId}
                    disabled={!sourceClassId}
                    onChange={(e) => setSourceSectionId(e.target.value)}
                    options={[
                      { label: sourceClassId ? 'Select Section' : 'Select Class First', value: '' },
                      ...sourceSections.map((sec) => ({
                        label: `${sec.name} (${sec.code})`,
                        value: sec.id || sec._id,
                      })),
                    ]}
                  />
                </div>
              </div>

              {/* Destination Context Column */}
              <div className="bg-surface-muted/40 p-4 rounded-lg border border-border space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border/80 pb-2">
                  <ArrowRight className="w-4 h-4 text-primary-600" />
                  Destination (Target Session)
                </div>

                <Select
                  label="Target Academic Session *"
                  value={destSessionId}
                  onChange={(e) => setDestSessionId(e.target.value)}
                  options={[
                    { label: 'Select Destination Session', value: '' },
                    ...sessions
                      .filter((s) => (s.id || s._id) !== sourceSessionId)
                      .map((s) => ({
                        label: `${s.name} (${s.status})`,
                        value: s.id || s._id,
                      })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Target Class (for Promoted) *"
                    value={destClassId}
                    onChange={(e) => {
                      setDestClassId(e.target.value);
                      setDestSectionId('');
                    }}
                    options={[
                      { label: 'Select Next Class', value: '' },
                      ...classes.map((c) => ({ label: c.name, value: c.id || c._id })),
                    ]}
                  />

                  <Select
                    label="Target Section *"
                    value={destSectionId}
                    disabled={!destClassId}
                    onChange={(e) => setDestSectionId(e.target.value)}
                    options={[
                      { label: destClassId ? 'Select Section' : 'Select Class First', value: '' },
                      ...destSections.map((sec) => ({
                        label: `${sec.name} (${sec.code})`,
                        value: sec.id || sec._id,
                      })),
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Capacity Status Indicator */}
            {destSectionId && previewData?.destinationSection && (
              <div
                className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm ${
                  isOverCapacity
                    ? 'bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-950/40 dark:border-danger-800 dark:text-danger-300'
                    : 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-950/40 dark:border-primary-800 dark:text-primary-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isOverCapacity ? (
                    <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold">
                      Target Section ({previewData.destinationSection.name}):
                    </span>{' '}
                    {currentDestEnrolled} current + {incomingToDestSectionCount} incoming ={' '}
                    <span className="font-bold">{totalProjectedEnrolled} / {destCapacity}</span> capacity
                    {isOverCapacity && (
                      <span className="ml-2 font-bold text-danger-700 dark:text-danger-400">
                        (Over capacity by {totalProjectedEnrolled - destCapacity} seats!)
                      </span>
                    )}
                  </div>
                </div>

                {isOverCapacity && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="allowCapacityOverride"
                      checked={allowCapacityOverride}
                      onCheckedChange={setAllowCapacityOverride}
                    />
                    <label
                      htmlFor="allowCapacityOverride"
                      className="text-xs font-semibold cursor-pointer text-danger-800 dark:text-danger-300"
                    >
                      Allow Administrative Capacity Override
                    </label>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Student Candidate Roster */}
          {isLoadingPreview && (
            <Card className="p-8 text-center space-y-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-48 w-full" />
            </Card>
          )}

          {!previewPayload && (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-semibold text-text-primary">
                Select Source and Destination Context Above
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                Choose the current session, class, and section along with the target session to load eligible student candidates.
              </p>
            </Card>
          )}

          {isErrorPreview && (
            <ErrorState
              title="Failed to Load Promotion Candidates"
              message={previewError?.message || 'Could not calculate promotion preview.'}
              onRetry={refetchPreview}
            />
          )}

          {previewPayload && previewData && (
            <Card className="overflow-hidden space-y-4 p-6">
              {/* Roster Header & Bulk Actions */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    2. Candidate Students ({filteredCandidates.length})
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {selectedStudentIds.size} of {candidates.length} student(s) selected for batch promotion.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search student or roll #..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  {/* Bulk Decision Quick Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange(PROMOTION_STATUS.PROMOTED)}
                    disabled={selectedStudentIds.size === 0}
                  >
                    Set Selected Promoted
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange(PROMOTION_STATUS.RETAINED)}
                    disabled={selectedStudentIds.size === 0}
                  >
                    Set Retained
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            filteredCandidates.length > 0 &&
                            filteredCandidates.every((c) => selectedStudentIds.has(c.studentId.toString()))
                          }
                          onCheckedChange={handleToggleSelectAll}
                          aria-label="Select all students"
                        />
                      </TableHead>
                      <TableHead>Admission / Name</TableHead>
                      <TableHead>Current Roll #</TableHead>
                      <TableHead>Exam Performance</TableHead>
                      <TableHead className="w-44">Promotion Decision</TableHead>
                      <TableHead className="w-44">Target Section</TableHead>
                      <TableHead className="w-28">New Roll #</TableHead>
                      <TableHead>Status & Warnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-text-muted">
                          No students found matching your criteria in this class & section.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCandidates.map((cand) => {
                        const id = cand.studentId.toString();
                        const isSelected = selectedStudentIds.has(id);
                        const decision = studentDecisions[id] || {};

                        return (
                          <TableRow
                            key={id}
                            className={cand.alreadyEnrolledInDestination ? 'opacity-60 bg-surface-muted/30' : ''}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleStudent(id)}
                                disabled={cand.alreadyEnrolledInDestination}
                                aria-label={`Select student ${cand.firstName} ${cand.lastName}`}
                              />
                            </TableCell>

                            <TableCell>
                              <div className="font-medium text-text-primary text-sm">
                                {cand.firstName} {cand.lastName}
                              </div>
                              <div className="text-xs text-text-muted font-mono">
                                {cand.admissionNumber}
                              </div>
                            </TableCell>

                            <TableCell className="text-text-secondary text-sm">
                              {cand.currentRollNumber || '—'}
                            </TableCell>

                            <TableCell>
                              {cand.resultsSummary?.hasResults ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                                    <span
                                      className={
                                        (cand.resultsSummary.averagePercentage || 0) >= 50
                                          ? 'text-success-600'
                                          : 'text-danger-600'
                                      }
                                    >
                                      {cand.resultsSummary.averagePercentage}% Avg
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-text-muted">
                                    {cand.resultsSummary.totalSubjectsTested} subjects assessed
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-text-muted italic">No exams recorded</span>
                              )}
                            </TableCell>

                            <TableCell>
                              <Select
                                value={decision.status || PROMOTION_STATUS.PROMOTED}
                                onChange={(e) => handleDecisionChange(id, 'status', e.target.value)}
                                disabled={!isSelected || cand.alreadyEnrolledInDestination}
                                options={PROMOTION_STATUS_OPTIONS}
                                className="text-xs h-8"
                              />
                            </TableCell>

                            <TableCell>
                              {decision.status === PROMOTION_STATUS.PROMOTED ? (
                                <Select
                                  value={decision.targetSectionId || destSectionId}
                                  onChange={(e) => handleDecisionChange(id, 'targetSectionId', e.target.value)}
                                  disabled={!isSelected || !destClassId || cand.alreadyEnrolledInDestination}
                                  options={[
                                    { label: 'Default Section', value: destSectionId || '' },
                                    ...destSections.map((sec) => ({
                                      label: `${sec.name} (${sec.code})`,
                                      value: sec.id || sec._id,
                                    })),
                                  ]}
                                  className="text-xs h-8"
                                />
                              ) : decision.status === PROMOTION_STATUS.RETAINED ? (
                                <Select
                                  value={decision.targetSectionId || sourceSectionId}
                                  onChange={(e) => handleDecisionChange(id, 'targetSectionId', e.target.value)}
                                  disabled={!isSelected || cand.alreadyEnrolledInDestination}
                                  options={[
                                    { label: 'Source Section', value: sourceSectionId || '' },
                                    ...sourceSections.map((sec) => ({
                                      label: `${sec.name} (${sec.code})`,
                                      value: sec.id || sec._id,
                                    })),
                                  ]}
                                  className="text-xs h-8"
                                />
                              ) : (
                                <span className="text-xs text-text-muted italic">N/A ({decision.status})</span>
                              )}
                            </TableCell>

                            <TableCell>
                              <Input
                                value={decision.newRollNumber || ''}
                                onChange={(e) => handleDecisionChange(id, 'newRollNumber', e.target.value)}
                                disabled={!isSelected || cand.alreadyEnrolledInDestination}
                                placeholder="Roll #"
                                className="text-xs h-8 w-20"
                              />
                            </TableCell>

                            <TableCell>
                              {cand.alreadyEnrolledInDestination ? (
                                <Badge variant="danger" size="sm">
                                  Already Enrolled
                                </Badge>
                              ) : cand.warnings?.length > 0 ? (
                                <div className="space-y-1">
                                  {cand.warnings.map((w, idx) => (
                                    <div
                                      key={idx}
                                      className="text-[11px] text-warning-700 dark:text-warning-300 flex items-center gap-1"
                                    >
                                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                      {w}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <Badge variant="success" size="sm">
                                  Ready
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bottom Action Submit Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                <div className="text-xs text-text-secondary">
                  Ready to execute promotion for <span className="font-bold">{selectedStudentIds.size}</span> student(s).
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={TrendingUp}
                    disabled={
                      selectedStudentIds.size === 0 ||
                      !canPromote ||
                      (isOverCapacity && !allowCapacityOverride)
                    }
                    onClick={() => setShowPreviewModal(true)}
                  >
                    Preview & Confirm Promotion
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 2: PROMOTION HISTORY ── */}
        <TabsContent value="history" className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-600" />
                  Historical Student Promotions Audit Trail
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Immutable records of all past session promotions, retentions, and graduations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={historyFilters.promotionStatus}
                  onChange={(e) =>
                    setHistoryFilters((prev) => ({ ...prev, promotionStatus: e.target.value, page: 1 }))
                  }
                  options={[
                    { label: 'All Promotion Outcomes', value: '' },
                    ...PROMOTION_STATUS_OPTIONS,
                  ]}
                  className="text-xs h-9 w-48"
                />
                <Button variant="outline" size="sm" onClick={() => refetchHistory()} leftIcon={RefreshCw}>
                  Refresh
                </Button>
              </div>
            </div>

            {isLoadingHistory && (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {isErrorHistory && (
              <ErrorState
                title="Failed to Load Promotion History"
                message="Could not retrieve historical promotion records."
                onRetry={refetchHistory}
              />
            )}

            {!isLoadingHistory && !isErrorHistory && (
              <div className="overflow-x-auto border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date / Time</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>From Academic Context</TableHead>
                      <TableHead>To Academic Context</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Performed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(historyData?.history || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-text-muted">
                          No promotion audit records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      historyData.history.map((record) => (
                        <TableRow key={record.id || record._id}>
                          <TableCell className="text-xs text-text-muted">
                            {formatDate(record.performedAt || record.createdAt)}
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-text-primary text-sm">
                              {record.studentId?.firstName} {record.studentId?.lastName}
                            </div>
                            <div className="text-xs text-text-muted font-mono">
                              {record.studentId?.admissionNumber}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-text-secondary">
                            <div>{record.fromAcademicSessionId?.name || '—'}</div>
                            <div className="text-text-muted">
                              {record.fromClassId?.name} - {record.fromSectionId?.name}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-text-secondary">
                            <div className="font-medium text-primary-600">
                              {record.toAcademicSessionId?.name || '—'}
                            </div>
                            <div className="text-text-muted">
                              {record.toClassId?.name} - {record.toSectionId?.name}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                record.promotionStatus === 'PROMOTED'
                                  ? 'success'
                                  : record.promotionStatus === 'RETAINED'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {record.promotionStatus}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs font-mono text-text-muted">
                            {record.batchId ? `${record.batchId.slice(0, 8)}...` : '—'}
                          </TableCell>

                          <TableCell className="text-xs text-text-secondary">
                            {record.performedBy
                              ? `${record.performedBy.firstName} ${record.performedBy.lastName}`
                              : 'System'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {historyData?.pagination && (
              <div className="pt-2">
                <Pagination
                  currentPage={historyFilters.page}
                  totalPages={historyData.pagination.totalPages}
                  onPageChange={(page) => setHistoryFilters((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── CONFIRMATION PREVIEW MODAL ── */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Confirm Student Promotion Execution"
        size="lg"
      >
        <div className="space-y-5">
          <div className="p-4 bg-surface-muted/50 rounded-lg border border-border space-y-2 text-sm">
            <div className="font-semibold text-text-primary">
              Session Transition Summary:
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="font-medium">{previewData?.sourceSession?.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
              <span className="font-bold text-primary-600">
                {previewData?.destinationSession?.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-success-50 dark:bg-success-950/40 p-3 rounded-lg border border-success-200 dark:border-success-800">
              <div className="text-2xl font-bold text-success-700 dark:text-success-300">
                {Array.from(selectedStudentIds).filter((id) => (studentDecisions[id]?.status || 'PROMOTED') === 'PROMOTED').length}
              </div>
              <div className="text-xs text-success-800 dark:text-success-400 font-medium mt-0.5">
                Promoted
              </div>
            </div>

            <div className="bg-warning-50 dark:bg-warning-950/40 p-3 rounded-lg border border-warning-200 dark:border-warning-800">
              <div className="text-2xl font-bold text-warning-700 dark:text-warning-300">
                {Array.from(selectedStudentIds).filter((id) => studentDecisions[id]?.status === 'RETAINED').length}
              </div>
              <div className="text-xs text-warning-800 dark:text-warning-400 font-medium mt-0.5">
                Retained
              </div>
            </div>

            <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg border border-border">
              <div className="text-2xl font-bold text-text-primary">
                {Array.from(selectedStudentIds).filter((id) => ['GRADUATED', 'TRANSFERRED', 'WITHDRAWN'].includes(studentDecisions[id]?.status)).length}
              </div>
              <div className="text-xs text-text-muted font-medium mt-0.5">
                Other (Graduated/Transferred)
              </div>
            </div>
          </div>

          {isOverCapacity && (
            <div className="p-3.5 bg-danger-50 border border-danger-200 rounded-lg text-xs text-danger-800 dark:bg-danger-950/40 dark:border-danger-800 dark:text-danger-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Capacity Override Active:</span> Target section capacity is exceeded.
                Executing will override the configured threshold.
              </div>
            </div>
          )}

          <div className="text-xs text-text-muted italic">
            Note: Promotion will create new session enrollment records while preserving historical attendance, marks, and invoices completely untouched.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowPreviewModal(false)}
              disabled={promoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={TrendingUp}
              isLoading={promoteMutation.isPending}
              onClick={handleConfirmPromotion}
            >
              Execute Promotion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default StudentPromotionPage;
