import React, { useState } from 'react';
import { GeneratedReport, ReportTheme, THEME_CONFIGS } from './types/report';
import { generateLocalReport } from './utils/reportGenerator';
import { ReportViewMode } from './components/ReportViewMode';
import { ReportEditMode } from './components/ReportEditMode';
import { ReportDownloader } from './components/ReportDownloader';
import {
  FileText,
  Eye,
  Edit3,
  Download,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Table,
  Layers,
  FileCheck,
} from 'lucide-react';

const SAMPLE_PRESETS = [
  {
    name: 'Quarterly Financials',
    title: 'Q3 Financial & Operational Performance Report',
    prompt:
      'Prepare a Q3 performance report analyzing revenue, net margin, customer growth, and operating costs. Extract clear KPI metrics and visualize quarterly trends.',
    data: `Revenue: $3,450,000 (Target: $3,200,000, +18.5% YoY)
Gross Margin: 68.4% (+2.1% variance)
Net Operating Income: $740,000 (+14.2% YoY)
Customer Acquisition Cost (CAC): $142 (-12.0% efficiency improvement)
Active Enterprise Subscribers: 1,840 accounts (+220 new this quarter)

Quarterly Revenue Progression:
Q1: 2600000
Q2: 2950000
Q3: 3450000
Q4 (Projected): 3800000

Segment Breakdown Table:
Segment, Target Revenue, Actual Revenue, Variance, Status
Enterprise Cloud, 1800000, 2100000, +16.6%, Exceeded
Mid-Market, 900000, 890000, -1.1%, On Track
Professional Services, 500000, 460000, -8.0%, In Review

Observations:
- Strong Enterprise Cloud expansions drove 61% of total top-line growth.
- Margin expansion accelerated due to automated infrastructure optimizations.
- Professional services backlog needs reallocation for Q4 delivery deadlines.`,
  },
  {
    name: 'Marketing Campaign ROI',
    title: 'Multi-Channel Growth & Digital Marketing Audit',
    prompt:
      'Analyze digital marketing campaign returns across Paid Search, Social, Email, and Influencer partnerships.',
    data: `Total Spend: $185,000
Total Qualified Pipeline Generated: $1,420,000 (7.67x Pipeline Multiple)
Cost Per Acquisition (CPA): $48.50 (-18% from last month)
Blended Conversion Rate: 4.8% (+0.9% bump)
Total Leads Acquired: 3,815

Channel Performance:
Paid Search (Google): 1420
Paid Social (Meta/LinkedIn): 1150
Organic & Direct: 780
Email & Referral: 465

Campaign Efficiency Matrix:
Channel, Ad Spend, Conversions, CPA, Return Multiplier
Google Search, 82000, 1680, $48.80, 5.2x
LinkedIn Ads, 54000, 890, $60.67, 3.8x
Meta Ads, 31000, 785, $39.49, 4.1x
Email Nurture, 18000, 460, $39.13, 8.4x`,
  },
  {
    name: 'Product & Sprint Velocity',
    title: 'Product Engineering Velocity & Quality Report',
    prompt:
      'Generate a sprint performance report tracking velocity, bug resolution rates, and platform uptime.',
    data: `Sprint Velocity: 142 Story Points (+12.7% vs rolling avg)
Platform Uptime: 99.98% (SLA met)
Bugs Resolved: 38 tickets (Zero P0/P1 open)
Cycle Time to Production: 1.8 Days (-35% faster)
Test Coverage: 88.5% (+3.2%)

Sprint Velocity Trend:
Sprint 21: 110
Sprint 22: 124
Sprint 23: 135
Sprint 24: 142

Module Delivery Status:
Component, Epic Points, Completed, Progress, Readiness
Auth & SSO v2, 40, 40, 100%, Deployed
Billing & Invoicing, 55, 52, 94.5%, Staging
Audit Logs API, 35, 32, 91.4%, Testing
Notification Engine, 20, 18, 90.0%, Testing`,
  },
];

export default function App() {
  // Input states
  const [prompt, setPrompt] = useState(SAMPLE_PRESETS[0].prompt);
  const [rawData, setRawData] = useState(SAMPLE_PRESETS[0].data);
  const [reportTitle, setReportTitle] = useState(SAMPLE_PRESETS[0].title);

  // App core state
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'download'>('view');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Apply a sample preset
  const handleSelectPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setPrompt(preset.prompt);
    setRawData(preset.data);
    setReportTitle(preset.title);
  };

  // Generate Report API call
  const handleGenerateReport = async () => {
    if (!prompt.trim() && !rawData.trim()) {
      setErrorMsg('Please enter your prompt or paste data into the box.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          rawData: rawData.trim(),
          reportTitle: reportTitle.trim() || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.report) {
          setReport(json.report);
          setActiveTab('view');
          return;
        }
      }
      
      // Fallback if server route returned non-200 or running statically
      const localReport = generateLocalReport(prompt, rawData, reportTitle);
      setReport(localReport);
      setActiveTab('view');
    } catch (err: any) {
      console.warn('Backend unavailable, using client-side report generator:', err);
      const localReport = generateLocalReport(prompt, rawData, reportTitle);
      setReport(localReport);
      setActiveTab('view');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset or start new
  const handleReset = () => {
    setReport(null);
  };

  const themeConfig = report ? THEME_CONFIGS[report.theme] : THEME_CONFIGS['executive-blue'];
  const hex = `#${themeConfig.primaryHex}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                ReportCraft AI
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Data to Multi-Format Executive Reports
              </span>
            </div>
          </div>

          {/* If report is generated, show the 3 requested options: View, Edit, Download */}
          {report ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'view'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View</span>
                </button>

                <button
                  onClick={() => setActiveTab('edit')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'edit'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setActiveTab('download')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'download'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download</span>
                </button>
              </div>

              <button
                onClick={handleReset}
                title="Create a new report with new prompt/data"
                className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                PDF • Word • PPT • Excel
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* If no report is generated yet, show the streamlined input interface */}
        {!report ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Simple Hero */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                Prompt & Data to Executive Report
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Create & Edit Reports in Any Format
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                Paste your prompt and raw figures. We turn your data into professional
                reports with charts, tables, KPIs, live Word/Excel-style editing, and export to PDF, Word, PowerPoint, or Excel.
              </p>
            </div>

            {/* Quick 1-click sample presets */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Try Sample Datasets:
                </span>
                <span className="text-[11px] text-slate-400">1-click fill</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors"
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* The Main Prompt & Data Input Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
              {/* Optional Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Report Title (Optional)
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  placeholder="e.g. Q3 Sales & Operations Report"
                  className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Instructions / Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Report Instructions & Objective
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Highlight revenue growth, customer churn, and compare quarterly targets..."
                  className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Raw Data Input Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Raw Data / Numbers / Notes
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Accepts text, numbers, CSV, or bullet points
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={rawData}
                  onChange={e => setRawData(e.target.value)}
                  placeholder="Paste your raw metrics, sales figures, team logs, or copy-pasted table here..."
                  className="w-full font-mono text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:outline-hidden leading-relaxed transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Primary Generate Button */}
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm sm:text-base bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Data & Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Executive Report</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-slate-500 text-[11px]">
                <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Visual Charts</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Data Tables</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Live Word/Excel Edit</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>PDF, Word, PPT, XLSX</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Report Generated: Display with 3 Clear Options (View, Edit, Download) */
          <div className="space-y-6">
            {/* Quick Mode Bar */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Mode:
                </span>
                <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                  {activeTab === 'view' && '👁️ Full Presentation View'}
                  {activeTab === 'edit' && '✏️ Live Document & Table Editor'}
                  {activeTab === 'download' && '📥 Multi-Format Exporter'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'view'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  View Report
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'edit'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Edit Report
                </button>
                <button
                  onClick={() => setActiveTab('download')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'download'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Download Report
                </button>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 ml-2"
                >
                  Start Over
                </button>
              </div>
            </div>

            {/* TAB 1: VIEW REPORT */}
            {activeTab === 'view' && (
              <ReportViewMode
                report={report}
                onSwitchToEdit={() => setActiveTab('edit')}
                onSwitchToDownload={() => setActiveTab('download')}
              />
            )}

            {/* TAB 2: EDIT REPORT */}
            {activeTab === 'edit' && (
              <ReportEditMode
                report={report}
                onUpdateReport={updated => setReport(updated)}
                onSwitchToView={() => setActiveTab('view')}
                onSwitchToDownload={() => setActiveTab('download')}
              />
            )}

            {/* TAB 3: DOWNLOAD REPORT */}
            {activeTab === 'download' && <ReportDownloader report={report} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ReportCraft AI • Smart Report Generator & Multi-Format Downloader
          </span>
          <span className="text-slate-400">
            Strictly grounded in your data • PDF • DOCX • PPTX • XLSX
          </span>
        </div>
      </footer>
    </div>
  );
}
