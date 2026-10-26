export type ReportTheme =
  | 'executive-blue'
  | 'corporate-navy'
  | 'emerald-growth'
  | 'slate-modern'
  | 'crimson-edge';

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  note?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  benchmark?: number;
}

export interface ReportChart {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: ChartDataPoint[];
  summaryNote?: string;
}

export interface ReportTable {
  id: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'narrative' | 'recommendations' | 'summary';
  content?: string;
  bullets?: string[];
  metrics?: MetricCard[];
  chart?: ReportChart;
  table?: ReportTable;
}

export interface GeneratedReport {
  id: string;
  title: string;
  subtitle: string;
  preparedFor?: string;
  preparedBy?: string;
  date: string;
  executiveSummary: string;
  theme: ReportTheme;
  sections: ReportSection[];
  rawPrompt?: string;
}

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'html';

export interface ThemeConfig {
  name: string;
  primary: string;
  primaryHex: string;
  secondaryHex: string;
  bgLight: string;
  accentHex: string;
  borderClass: string;
  badgeClass: string;
  gradient: string;
}

export const THEME_CONFIGS: Record<ReportTheme, ThemeConfig> = {
  'executive-blue': {
    name: 'Executive Blue',
    primary: 'blue-600',
    primaryHex: '2563EB',
    secondaryHex: '1E40AF',
    bgLight: 'bg-blue-50/50',
    accentHex: '3B82F6',
    borderClass: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-600 to-indigo-700',
  },
  'corporate-navy': {
    name: 'Corporate Navy',
    primary: 'slate-800',
    primaryHex: '1E293B',
    secondaryHex: '0F172A',
    bgLight: 'bg-slate-50',
    accentHex: '475569',
    borderClass: 'border-slate-300',
    badgeClass: 'bg-slate-200 text-slate-800',
    gradient: 'from-slate-800 to-slate-950',
  },
  'emerald-growth': {
    name: 'Emerald Growth',
    primary: 'emerald-600',
    primaryHex: '059669',
    secondaryHex: '047857',
    bgLight: 'bg-emerald-50/50',
    accentHex: '10B981',
    borderClass: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    gradient: 'from-emerald-600 to-teal-700',
  },
  'slate-modern': {
    name: 'Slate Minimal',
    primary: 'zinc-700',
    primaryHex: '3F3F46',
    secondaryHex: '27272A',
    bgLight: 'bg-zinc-50',
    accentHex: '71717A',
    borderClass: 'border-zinc-300',
    badgeClass: 'bg-zinc-200 text-zinc-800',
    gradient: 'from-zinc-700 to-zinc-900',
  },
  'crimson-edge': {
    name: 'Crimson Impact',
    primary: 'rose-600',
    primaryHex: 'E11D48',
    secondaryHex: 'BE123C',
    bgLight: 'bg-rose-50/50',
    accentHex: 'F43F5E',
    borderClass: 'border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800',
    gradient: 'from-rose-600 to-pink-700',
  },
};
