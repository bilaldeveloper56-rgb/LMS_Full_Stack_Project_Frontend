import React from 'react';
import { Plus } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { TimetableEntryCard } from './TimetableEntryCard';
import { DAY_OF_WEEK_OPTIONS } from '../schemas/timetable.schema';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

const WORKING_DAYS = DAY_OF_WEEK_OPTIONS.filter((d) => d.value !== 'SUNDAY');
const DEFAULT_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * TimetableGrid component for displaying the weekly schedule matrix.
 *
 * @param {object} props
 * @param {Array} props.slots
 * @param {Function} [props.onAddSlot]
 * @param {Function} [props.onEditSlot]
 * @param {Function} [props.onDeleteSlot]
 * @param {'section'|'teacher'} [props.viewMode='section']
 */
export function TimetableGrid({
  slots = [],
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  viewMode = 'section',
}) {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.TIMETABLE_CREATE);

  // Map slots by key: `${dayOfWeek}_${periodNumber}`
  const slotsMap = React.useMemo(() => {
    const map = {};
    slots.forEach((slot) => {
      const key = `${slot.dayOfWeek}_${slot.periodNumber}`;
      map[key] = slot;
    });
    return map;
  }, [slots]);

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="min-w-[760px]">
        {/* Header Days Row */}
        <div className="grid grid-cols-7 gap-2 pb-3 border-b border-border text-center">
          <div className="font-semibold text-xs text-text-muted uppercase tracking-wider py-1">
            Period
          </div>
          {WORKING_DAYS.map((day) => (
            <div
              key={day.value}
              className="font-bold text-xs text-text-primary uppercase tracking-wider bg-surface-muted/60 py-1.5 rounded-md"
            >
              {day.label}
            </div>
          ))}
        </div>

        {/* Period Rows */}
        <div className="space-y-2 mt-2">
          {DEFAULT_PERIODS.map((period) => (
            <div key={period} className="grid grid-cols-7 gap-2 items-stretch min-h-[96px]">
              {/* Period Number Label */}
              <div className="flex flex-col items-center justify-center bg-surface-muted/30 border border-border/60 rounded-md p-1 font-mono text-center">
                <span className="text-xs font-bold text-text-primary">
                  P{period}
                </span>
                <span className="text-[10px] text-text-muted">
                  Period {period}
                </span>
              </div>

              {/* Day Cells */}
              {WORKING_DAYS.map((day) => {
                const key = `${day.value}_${period}`;
                const slot = slotsMap[key];

                return (
                  <div
                    key={key}
                    className="relative rounded-md border border-dashed border-border/70 p-1 flex flex-col justify-center transition-colors hover:border-primary-300 hover:bg-surface-muted/20"
                  >
                    {slot ? (
                      <TimetableEntryCard
                        slot={slot}
                        onEdit={onEditSlot}
                        onDelete={onDeleteSlot}
                        viewMode={viewMode}
                      />
                    ) : canCreate && onAddSlot ? (
                      <button
                        type="button"
                        onClick={() => onAddSlot({ dayOfWeek: day.value, periodNumber: period })}
                        className="w-full h-full flex flex-col items-center justify-center text-text-muted hover:text-primary-600 group transition-colors rounded py-2 cursor-pointer"
                        aria-label={`Add period ${period} for ${day.label}`}
                      >
                        <Plus className="w-4 h-4 text-text-muted group-hover:text-primary-600 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Add
                        </span>
                      </button>
                    ) : (
                      <div className="text-center text-[11px] text-text-muted/40 font-mono select-none">
                        —
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default TimetableGrid;
