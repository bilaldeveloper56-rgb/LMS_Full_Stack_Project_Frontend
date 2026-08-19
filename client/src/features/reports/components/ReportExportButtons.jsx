import React from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * Utility to download formatted tabular array data as CSV file.
 * @param {Array<object>} data
 * @param {string} filename
 */
export function exportToCsv(data = [], filename = 'report.csv') {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.map((h) => `"${h}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * ReportExportButtons component.
 * @param {object} props
 * @param {Array<object>} [props.data=[]]
 * @param {string} [props.filename='report.csv']
 * @param {boolean} [props.disableCsv=false]
 */
export function ReportExportButtons({ data = [], filename = 'report.csv', disableCsv = false }) {
  const handleExportCsv = () => {
    exportToCsv(data, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 no-print">
      {!disableCsv && (
        <Button
          variant="outline"
          size="sm"
          leftIcon={Download}
          onClick={handleExportCsv}
          disabled={!data || data.length === 0}
          className="text-xs"
        >
          Export CSV
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        leftIcon={Printer}
        onClick={handlePrint}
        className="text-xs"
      >
        Print / PDF
      </Button>
    </div>
  );
}

export default ReportExportButtons;
