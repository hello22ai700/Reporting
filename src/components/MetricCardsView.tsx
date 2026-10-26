import React from 'react';
import { MetricCard, ReportTheme, THEME_CONFIGS } from '../types/report';
import { TrendingUp, TrendingDown, Minus, Plus, Trash2 } from 'lucide-react';

interface Props {
  metrics: MetricCard[];
  theme: ReportTheme;
  isEditable?: boolean;
  onUpdate?: (updated: MetricCard[]) => void;
}

export const MetricCardsView: React.FC<Props> = ({
  metrics,
  theme,
  isEditable = false,
  onUpdate,
}) => {
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS['executive-blue'];
  const hex = `#${themeConfig.primaryHex}`;

  const handleMetricChange = (index: number, field: keyof MetricCard, val: string) => {
    if (!onUpdate) return;
    const newMetrics = [...metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: val };
    onUpdate(newMetrics);
  };

  const addMetric = () => {
    if (!onUpdate) return;
    const newCard: MetricCard = {
      id: `m_${Date.now()}`,
      label: 'New Metric',
      value: '100%',
      change: '+5.0%',
      trend: 'up',
      note: 'Added metric',
    };
    onUpdate([...metrics, newCard]);
  };

  const deleteMetric = (index: number) => {
    if (!onUpdate) return;
    onUpdate(metrics.filter((_, idx) => idx !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((metric, idx) => {
          const isUp = metric.trend === 'up' || (metric.change && metric.change.includes('+'));
          const isDown = metric.trend === 'down' || (metric.change && metric.change.includes('-'));

          return (
            <div
              key={metric.id || idx}
              className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs relative group transition-all hover:border-slate-300 hover:shadow-sm"
            >
              {isEditable && (
                <button
                  onClick={() => deleteMetric(idx)}
                  className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Remove Metric"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Metric Label */}
              {isEditable ? (
                <input
                  type="text"
                  value={metric.label}
                  onChange={e => handleMetricChange(idx, 'label', e.target.value)}
                  className="w-full text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 mb-1.5 focus:outline-hidden focus:bg-white"
                  placeholder="Metric Label"
                />
              ) : (
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 truncate">
                  {metric.label}
                </div>
              )}

              {/* Metric Big Value */}
              {isEditable ? (
                <input
                  type="text"
                  value={metric.value}
                  onChange={e => handleMetricChange(idx, 'value', e.target.value)}
                  className="w-full text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-hidden focus:bg-white mb-2"
                  placeholder="Value (e.g. $1.2M)"
                />
              ) : (
                <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: hex }}>
                  {metric.value}
                </div>
              )}

              {/* Change / Trend Indicator */}
              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                {isEditable ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <select
                      value={metric.trend || 'up'}
                      onChange={e => handleMetricChange(idx, 'trend', e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-700"
                    >
                      <option value="up">↑ Up</option>
                      <option value="down">↓ Down</option>
                      <option value="neutral">- Flat</option>
                    </select>
                    <input
                      type="text"
                      value={metric.change || ''}
                      onChange={e => handleMetricChange(idx, 'change', e.target.value)}
                      className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 w-full focus:outline-hidden focus:bg-white"
                      placeholder="+12.5%"
                    />
                  </div>
                ) : (
                  <>
                    {metric.change && (
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isUp
                            ? 'bg-emerald-50 text-emerald-700'
                            : isDown
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isUp && <TrendingUp className="w-3 h-3" />}
                        {isDown && <TrendingDown className="w-3 h-3" />}
                        {!isUp && !isDown && <Minus className="w-3 h-3" />}
                        <span>{metric.change}</span>
                      </div>
                    )}
                    {metric.note && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[120px] ml-auto">
                        {metric.note}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isEditable && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={addMetric}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add KPI Metric Card
          </button>
        </div>
      )}
    </div>
  );
};
