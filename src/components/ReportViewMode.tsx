import React from 'react';
import { GeneratedReport, THEME_CONFIGS } from '../types/report';
import { MetricCardsView } from './MetricCardsView';
import { ReportChartViewer } from './ReportChartViewer';
import { ReportTableView } from './ReportTableView';
import {
  Calendar,
  User,
  Building,
  CheckCircle,
  FileCheck2,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  report: GeneratedReport;
  onSwitchToEdit: () => void;
  onSwitchToDownload: () => void;
}

export const ReportViewMode: React.FC<Props> = ({
  report,
  onSwitchToEdit,
  onSwitchToDownload,
}) => {
  const theme = THEME_CONFIGS[report.theme] || THEME_CONFIGS['executive-blue'];
  const hex = `#${theme.primaryHex}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Executive Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Top colored accent strip */}
        <div
          className="h-3 w-full"
          style={{
            background: `linear-gradient(90deg, #${theme.primaryHex} 0%, #${theme.secondaryHex} 100%)`,
          }}
        />

        {/* Report Header */}
        <div className="p-6 sm:p-10 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
              style={{ backgroundColor: `${hex}15`, color: hex }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Executive Data Report
            </span>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {report.date}
              </span>
              {report.preparedBy && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {report.preparedBy}
                </span>
              )}
              {report.preparedFor && (
                <span className="inline-flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {report.preparedFor}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {report.title}
          </h1>

          {report.subtitle && (
            <p className="text-base sm:text-lg text-slate-600 mt-2 font-normal leading-relaxed">
              {report.subtitle}
            </p>
          )}

          {/* Executive Summary Card */}
          {report.executiveSummary && (
            <div className="mt-8 rounded-xl bg-slate-50/80 border border-slate-200 p-5 sm:p-6 relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: hex }}
              />
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4" style={{ color: hex }} />
                <h3
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: hex }}
                >
                  Executive Summary
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                {report.executiveSummary}
              </p>
            </div>
          )}
        </div>

        {/* Sections Content */}
        <div className="p-6 sm:p-10 space-y-10">
          {report.sections.map((section, sIdx) => (
            <div key={section.id || sIdx} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div
                  className="w-2 h-6 rounded-full"
                  style={{ backgroundColor: hex }}
                />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {section.title}
                </h2>
              </div>

              {/* Optional Section Narrative / Context */}
              {section.content && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {section.content}
                </p>
              )}

              {/* 1. Metrics Grid */}
              {section.type === 'metrics' && section.metrics && (
                <MetricCardsView
                  metrics={section.metrics}
                  theme={report.theme}
                  isEditable={false}
                />
              )}

              {/* 2. Visual Charts */}
              {section.type === 'chart' && section.chart && (
                <ReportChartViewer
                  chart={section.chart}
                  theme={report.theme}
                />
              )}

              {/* 3. Structured Data Table */}
              {section.type === 'table' && section.table && (
                <ReportTableView
                  table={section.table}
                  theme={report.theme}
                  isEditable={false}
                />
              )}

              {/* 4. Bullets / Findings / Recommendations */}
              {section.bullets && section.bullets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {section.bullets.map((bullet, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80"
                    >
                      <CheckCircle
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: hex }}
                      />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Report Footer */}
        <div className="px-6 sm:px-10 py-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Report verified from provided metrics & data.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToEdit}
              className="font-semibold text-slate-700 hover:text-slate-900 underline"
            >
              Edit this Report
            </button>
            <span>•</span>
            <button
              onClick={onSwitchToDownload}
              className="font-bold underline"
              style={{ color: hex }}
            >
              Export & Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
