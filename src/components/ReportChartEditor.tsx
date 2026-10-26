import React from 'react';
import { ReportChart, ReportTheme } from '../types/report';
import { Plus, Trash2, BarChart2, TrendingUp, PieChart, Layers } from 'lucide-react';
import { ReportChartViewer } from './ReportChartViewer';

interface Props {
  chart: ReportChart;
  theme: ReportTheme;
  onUpdate: (updated: ReportChart) => void;
}

export const ReportChartEditor: React.FC<Props> = ({ chart, theme, onUpdate }) => {
  const handleTypeChange = (type: 'bar' | 'line' | 'pie' | 'area') => {
    onUpdate({ ...chart, type });
  };

  const handlePointChange = (idx: number, field: 'label' | 'value', val: any) => {
    const updated = [...chart.data];
    if (field === 'value') {
      const num = parseFloat(val) || 0;
      updated[idx] = { ...updated[idx], value: num };
    } else {
      updated[idx] = { ...updated[idx], label: val };
    }
    onUpdate({ ...chart, data: updated });
  };

  const addPoint = () => {
    const newPoint = {
      label: `Item ${chart.data.length + 1}`,
      value: 100,
    };
    onUpdate({ ...chart, data: [...chart.data, newPoint] });
  };

  const removePoint = (idx: number) => {
    if (chart.data.length <= 1) return;
    onUpdate({ ...chart, data: chart.data.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      {/* Live Chart Preview */}
      <ReportChartViewer chart={chart} theme={theme} />

      {/* Editing Controls */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Chart Title
            </label>
            <input
              type="text"
              value={chart.title}
              onChange={e => onUpdate({ ...chart, title: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="Chart Title"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Visualization Type
            </label>
            <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleTypeChange('bar')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  chart.type === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Bar
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('line')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  chart.type === 'line' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Line
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('area')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  chart.type === 'area' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Area
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('pie')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  chart.type === 'pie' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" /> Donut
              </button>
            </div>
          </div>
        </div>

        {/* Data points table editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[11px] text-slate-600 uppercase">Data Points & Values</span>
            <button
              onClick={addPoint}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Point
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {chart.data.map((point, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg shadow-2xs"
              >
                <input
                  type="text"
                  value={point.label}
                  onChange={e => handlePointChange(idx, 'label', e.target.value)}
                  className="w-2/3 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800"
                  placeholder="Label"
                />
                <input
                  type="number"
                  value={point.value}
                  onChange={e => handlePointChange(idx, 'value', e.target.value)}
                  className="w-1/3 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-900"
                  placeholder="Val"
                />
                {chart.data.length > 1 && (
                  <button
                    onClick={() => removePoint(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                    title="Delete Point"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
