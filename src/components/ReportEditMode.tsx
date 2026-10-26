import React, { useState } from 'react';
import {
  GeneratedReport,
  ReportSection,
  ReportTheme,
  THEME_CONFIGS,
} from '../types/report';
import { MetricCardsView } from './MetricCardsView';
import { ReportChartEditor } from './ReportChartEditor';
import { ReportTableView } from './ReportTableView';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Palette,
  Check,
  BarChart2,
  Table as TableIcon,
  Activity,
  FileText,
  ListOrdered,
  Eye,
  Download,
} from 'lucide-react';

interface Props {
  report: GeneratedReport;
  onUpdateReport: (updated: GeneratedReport) => void;
  onSwitchToView: () => void;
  onSwitchToDownload: () => void;
}

export const ReportEditMode: React.FC<Props> = ({
  report,
  onUpdateReport,
  onSwitchToView,
  onSwitchToDownload,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const themeConfig = THEME_CONFIGS[report.theme] || THEME_CONFIGS['executive-blue'];
  const hex = `#${themeConfig.primaryHex}`;

  // Theme change
  const handleThemeChange = (theme: ReportTheme) => {
    onUpdateReport({ ...report, theme });
  };

  // Section updates
  const updateSection = (index: number, updated: ReportSection) => {
    const newSections = [...report.sections];
    newSections[index] = updated;
    onUpdateReport({ ...report, sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = report.sections.filter((_, i) => i !== index);
    onUpdateReport({ ...report, sections: newSections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= report.sections.length) return;
    const newSections = [...report.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIdx, 0, moved);
    onUpdateReport({ ...report, sections: newSections });
  };

  // Add new section
  const addNewSection = (
    type: 'metrics' | 'chart' | 'table' | 'narrative' | 'recommendations'
  ) => {
    setShowAddMenu(false);
    let newSec: ReportSection;

    if (type === 'metrics') {
      newSec = {
        id: `sec_${Date.now()}`,
        title: 'Key Metrics & Highlights',
        type: 'metrics',
        content: 'Quantitative tracking metrics.',
        metrics: [
          { id: `m_${Date.now()}_1`, label: 'Total Volume', value: '1,450', change: '+12%', trend: 'up' },
          { id: `m_${Date.now()}_2`, label: 'Success Rate', value: '98.4%', change: '+3.1%', trend: 'up' },
          { id: `m_${Date.now()}_3`, label: 'Avg Turnaround', value: '2.4 hrs', change: '-15%', trend: 'up' },
        ],
      };
    } else if (type === 'chart') {
      newSec = {
        id: `sec_${Date.now()}`,
        title: 'Performance Distribution Chart',
        type: 'chart',
        content: 'Visual data distribution.',
        chart: {
          id: `chart_${Date.now()}`,
          title: 'Period Performance Breakdown',
          type: 'bar',
          data: [
            { label: 'Category A', value: 120 },
            { label: 'Category B', value: 240 },
            { label: 'Category C', value: 180 },
            { label: 'Category D', value: 310 },
          ],
        },
      };
    } else if (type === 'table') {
      newSec = {
        id: `sec_${Date.now()}`,
        title: 'Detailed Tabular Records',
        type: 'table',
        table: {
          id: `tbl_${Date.now()}`,
          title: 'Segment Analysis',
          headers: ['Segment', 'Target', 'Achieved', 'Status'],
          rows: [
            ['North Operations', '500', '560', 'Exceeded'],
            ['South Operations', '400', '412', 'On Track'],
            ['Central Delivery', '350', '330', 'Attention'],
          ],
        },
      };
    } else if (type === 'narrative') {
      newSec = {
        id: `sec_${Date.now()}`,
        title: 'Key Strategic Findings',
        type: 'narrative',
        content: 'Detailed summary of findings and strategic observations based on gathered metrics.',
        bullets: [
          'Observed significant efficiency improvement across primary channels.',
          'Identified positive correlation between automated workflows and output quality.',
        ],
      };
    } else {
      newSec = {
        id: `sec_${Date.now()}`,
        title: 'Targeted Action Plan & Recommendations',
        type: 'recommendations',
        content: 'Immediate strategic priorities for the upcoming cycle.',
        bullets: [
          'Implement automated daily milestone notifications for core contributors.',
          'Consolidate reporting schedules to streamline stakeholder reviews.',
          'Reallocate resources towards high-converting operational segments.',
        ],
      };
    }

    onUpdateReport({ ...report, sections: [...report.sections, newSec] });
  };

  // Bullet manipulation
  const handleBulletChange = (secIdx: number, bulletIdx: number, val: string) => {
    const sec = report.sections[secIdx];
    const newBullets = [...(sec.bullets || [])];
    newBullets[bulletIdx] = val;
    updateSection(secIdx, { ...sec, bullets: newBullets });
  };

  const addBullet = (secIdx: number) => {
    const sec = report.sections[secIdx];
    const newBullets = [...(sec.bullets || []), 'New observation or action item.'];
    updateSection(secIdx, { ...sec, bullets: newBullets });
  };

  const removeBullet = (secIdx: number, bulletIdx: number) => {
    const sec = report.sections[secIdx];
    const newBullets = (sec.bullets || []).filter((_, idx) => idx !== bulletIdx);
    updateSection(secIdx, { ...sec, bullets: newBullets });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Editor Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Interactive Report Editor
            </h2>
            <p className="text-xs text-slate-500">
              Edit text like Word, edit tables like Excel, and customize visual charts.
            </p>
          </div>
        </div>

        {/* Theme Picker & Fast Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme selection dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <Palette className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={report.theme}
              onChange={e => handleThemeChange(e.target.value as ReportTheme)}
              className="text-xs font-semibold bg-transparent text-slate-700 py-1 pr-2 focus:outline-hidden"
            >
              {Object.entries(THEME_CONFIGS).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onSwitchToView}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            View Report
          </button>

          <button
            onClick={onSwitchToDownload}
            type="button"
            style={{ backgroundColor: hex }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download Options
          </button>
        </div>
      </div>

      {/* Document Settings & Metadata Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Document Header
          </span>
          <div className="mt-2 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={report.title}
                onChange={e => onUpdateReport({ ...report, title: e.target.value })}
                className="w-full text-xl sm:text-2xl font-black text-slate-900 bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                placeholder="Enter Report Title"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={report.subtitle}
                onChange={e => onUpdateReport({ ...report, subtitle: e.target.value })}
                className="w-full text-sm text-slate-700 bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-1.5 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                placeholder="Subtitle"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Report Date
                </label>
                <input
                  type="text"
                  value={report.date}
                  onChange={e => onUpdateReport({ ...report, date: e.target.value })}
                  className="w-full text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-md px-2.5 py-1.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Prepared By
                </label>
                <input
                  type="text"
                  value={report.preparedBy || ''}
                  onChange={e => onUpdateReport({ ...report, preparedBy: e.target.value })}
                  className="w-full text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-md px-2.5 py-1.5 focus:bg-white focus:outline-hidden"
                  placeholder="Author / Department"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Prepared For
                </label>
                <input
                  type="text"
                  value={report.preparedFor || ''}
                  onChange={e => onUpdateReport({ ...report, preparedFor: e.target.value })}
                  className="w-full text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-md px-2.5 py-1.5 focus:bg-white focus:outline-hidden"
                  placeholder="Target Audience / Client"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Editor */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Executive Summary
          </label>
          <textarea
            rows={3}
            value={report.executiveSummary}
            onChange={e => onUpdateReport({ ...report, executiveSummary: e.target.value })}
            className="w-full text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:outline-hidden leading-relaxed transition-colors"
            placeholder="Write executive summary here..."
          />
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {report.sections.map((section, sIdx) => (
          <div
            key={section.id || sIdx}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs relative group"
          >
            {/* Section Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  #{sIdx + 1}
                </span>
                <input
                  type="text"
                  value={section.title}
                  onChange={e => updateSection(sIdx, { ...section, title: e.target.value })}
                  className="font-bold text-base text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-blue-600 focus:outline-hidden px-1 py-0.5 w-full"
                />
              </div>

              {/* Action buttons: Move up/down, delete */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(sIdx, 'up')}
                  disabled={sIdx === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                  title="Move section up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveSection(sIdx, 'down')}
                  disabled={sIdx === report.sections.length - 1}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                  title="Move section down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeSection(sIdx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors ml-1"
                  title="Remove this entire section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Optional Context/Intro input */}
            <div className="mb-4">
              <input
                type="text"
                value={section.content || ''}
                onChange={e => updateSection(sIdx, { ...section, content: e.target.value })}
                placeholder="Section note / introductory context (optional)"
                className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* In-place content editor per section type */}
            {section.type === 'metrics' && section.metrics && (
              <MetricCardsView
                metrics={section.metrics}
                theme={report.theme}
                isEditable={true}
                onUpdate={newMetrics => updateSection(sIdx, { ...section, metrics: newMetrics })}
              />
            )}

            {section.type === 'chart' && section.chart && (
              <ReportChartEditor
                chart={section.chart}
                theme={report.theme}
                onUpdate={newChart => updateSection(sIdx, { ...section, chart: newChart })}
              />
            )}

            {section.type === 'table' && section.table && (
              <ReportTableView
                table={section.table}
                theme={report.theme}
                isEditable={true}
                onUpdate={newTable => updateSection(sIdx, { ...section, table: newTable })}
              />
            )}

            {/* Bullets / Narrative editor */}
            {section.bullets && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    Bulleted Points & Findings
                  </span>
                  <button
                    onClick={() => addBullet(sIdx)}
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                  </button>
                </div>

                <div className="space-y-2">
                  {section.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-2 font-bold">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={e => handleBulletChange(sIdx, bIdx, e.target.value)}
                        className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-hidden leading-relaxed"
                      />
                      {section.bullets && section.bullets.length > 1 && (
                        <button
                          onClick={() => removeBullet(sIdx, bIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Section Bar */}
      <div className="relative text-center py-4">
        {!showAddMenu ? (
          <button
            onClick={() => setShowAddMenu(true)}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-xs font-bold text-slate-700 hover:text-blue-700 shadow-2xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Report Section
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg max-w-xl mx-auto space-y-3 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                Choose Section Type to Add:
              </span>
              <button
                onClick={() => setShowAddMenu(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left">
              <button
                onClick={() => addNewSection('metrics')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors flex flex-col gap-1.5"
              >
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Key Metrics</span>
                <span className="text-[11px] text-slate-500">KPI cards & trends</span>
              </button>

              <button
                onClick={() => addNewSection('chart')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors flex flex-col gap-1.5"
              >
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Data Visual</span>
                <span className="text-[11px] text-slate-500">Bar, Line, Area, Pie</span>
              </button>

              <button
                onClick={() => addNewSection('table')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors flex flex-col gap-1.5"
              >
                <TableIcon className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Data Table</span>
                <span className="text-[11px] text-slate-500">Excel-style editable</span>
              </button>

              <button
                onClick={() => addNewSection('narrative')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors flex flex-col gap-1.5"
              >
                <FileText className="w-5 h-5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Findings</span>
                <span className="text-[11px] text-slate-500">Text analysis & points</span>
              </button>

              <button
                onClick={() => addNewSection('recommendations')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors flex flex-col gap-1.5"
              >
                <ListOrdered className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold text-slate-800">Action Plan</span>
                <span className="text-[11px] text-slate-500">Recommendations</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
