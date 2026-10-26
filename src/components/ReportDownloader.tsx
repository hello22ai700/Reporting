import React, { useState } from 'react';
import { GeneratedReport, ExportFormat, THEME_CONFIGS } from '../types/report';
import {
  exportToPDF,
  exportToWord,
  exportToPowerPoint,
  exportToExcel,
  exportToHTML,
  getSafeFilename,
} from '../utils/exportUtils';
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Printer,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface Props {
  report: GeneratedReport;
}

export const ReportDownloader: React.FC<Props> = ({ report }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const themeConfig = THEME_CONFIGS[report.theme] || THEME_CONFIGS['executive-blue'];
  const hex = `#${themeConfig.primaryHex}`;

  const formatOptions: Array<{
    id: ExportFormat;
    name: string;
    extension: string;
    badge: string;
    description: string;
    apps: string;
    icon: React.ReactNode;
    color: string;
    bgHover: string;
  }> = [
    {
      id: 'pdf',
      name: 'PDF Document',
      extension: '.pdf',
      badge: 'Executive Ready',
      description: 'Clean, print-ready document with crisp typography, KPI blocks, and styled tables.',
      apps: 'Adobe Acrobat, Preview, Any Browser',
      icon: <FileText className="w-6 h-6 text-red-500" />,
      color: 'border-red-500 ring-red-500',
      bgHover: 'hover:border-red-300',
    },
    {
      id: 'docx',
      name: 'Microsoft Word (DOCX)',
      extension: '.docx',
      badge: 'Full Text Edit',
      description: 'Fully editable native Word document with formal headings, KPI callout cells, and tables.',
      apps: 'Microsoft Word, Google Docs, Pages',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-600 ring-blue-600',
      bgHover: 'hover:border-blue-300',
    },
    {
      id: 'pptx',
      name: 'PowerPoint Presentation',
      extension: '.pptx',
      badge: 'Slide Deck',
      description: 'Formatted multi-slide deck with title banner, executive takeaways, KPI cards, and charts.',
      apps: 'PowerPoint, Google Slides, Keynote',
      icon: <Presentation className="w-6 h-6 text-amber-500" />,
      color: 'border-amber-500 ring-amber-500',
      bgHover: 'hover:border-amber-300',
    },
    {
      id: 'xlsx',
      name: 'Excel Spreadsheet',
      extension: '.xlsx',
      badge: 'Data & Numbers',
      description: 'Multi-sheet workbook containing Summary, Metrics, granular Data Tables, and Chart Datasets.',
      apps: 'Microsoft Excel, Google Sheets, Numbers',
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-600 ring-emerald-600',
      bgHover: 'hover:border-emerald-300',
    },
    {
      id: 'html',
      name: 'Interactive HTML Web Report',
      extension: '.html',
      badge: 'Universal Web',
      description: 'Self-contained standalone webpage report viewable in any modern web browser.',
      apps: 'Chrome, Safari, Edge, Firefox',
      icon: <Code2 className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-600 ring-purple-600',
      bgHover: 'hover:border-purple-300',
    },
  ];

  const handleDownload = async () => {
    setIsExporting(true);
    setDownloadSuccess(null);

    try {
      if (selectedFormat === 'pdf') {
        await exportToPDF(report);
      } else if (selectedFormat === 'docx') {
        await exportToWord(report);
      } else if (selectedFormat === 'pptx') {
        await exportToPowerPoint(report);
      } else if (selectedFormat === 'xlsx') {
        exportToExcel(report);
      } else if (selectedFormat === 'html') {
        exportToHTML(report);
      }

      setDownloadSuccess(selectedFormat.toUpperCase());
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Failed to generate export file. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Multi-Format Export Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Export & Download Report
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select your desired file format below to download your prepared report.
            </p>
          </div>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print / System PDF
          </button>
        </div>

        {/* Format Selector Grid */}
        <div className="mt-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Choose Output Format:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {formatOptions.map(option => {
              const isSelected = selectedFormat === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => setSelectedFormat(option.id)}
                  className={`relative p-4.5 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? `border-blue-600 bg-blue-50/30 shadow-xs ring-1 ring-blue-600`
                      : `border-slate-200 bg-white ${option.bgHover}`
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      {option.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {option.name}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {option.extension}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {option.description}
                      </p>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Compatible:</span>
                        <span className="font-medium text-slate-600 truncate">{option.apps}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Download Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span>Target filename: </span>
            <code className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
              {getSafeFilename(report.title, selectedFormat)}
            </code>
          </div>

          <div className="flex items-center gap-3">
            {downloadSuccess && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{downloadSuccess} File Downloaded!</span>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={isExporting}
              style={{ backgroundColor: hex }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating File...' : `Download ${selectedFormat.toUpperCase()} Now`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
