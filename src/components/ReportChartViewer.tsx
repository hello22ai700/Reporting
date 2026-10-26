import React, { useState } from 'react';
import { ReportChart, ReportTheme, THEME_CONFIGS } from '../types/report';

interface Props {
  chart: ReportChart;
  theme: ReportTheme;
}

export const ReportChartViewer: React.FC<Props> = ({ chart, theme }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS['executive-blue'];
  const hex = `#${themeConfig.primaryHex}`;
  const accentHex = `#${themeConfig.accentHex}`;

  const data = chart.data || [];
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No data points available for this visual.
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxValue = Math.max(...values, 1);
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 580;

  // Pie chart calculation
  const totalValue = values.reduce((acc, curr) => acc + curr, 0) || 1;
  const pieColors = [
    hex,
    accentHex,
    '#0284C7',
    '#6366F1',
    '#10B981',
    '#F59E0B',
    '#EC4899',
    '#8B5CF6',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 tracking-tight">{chart.title}</h4>
          {chart.summaryNote && (
            <p className="text-xs text-slate-500 mt-0.5">{chart.summaryNote}</p>
          )}
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-slate-100 text-slate-600">
          {chart.type} Chart
        </span>
      </div>

      <div className="relative w-full overflow-x-auto">
        {/* BAR CHART */}
        {chart.type === 'bar' && (
          <div className="min-w-[480px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
              {/* Horizontal gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - 20}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-sans"
                    >
                      {Math.round(maxValue * pct)}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {data.map((point, idx) => {
                const barSpacing = (chartWidth - paddingX - 40) / data.length;
                const barWidth = Math.min(42, barSpacing * 0.65);
                const barHeight = (point.value / maxValue) * (chartHeight - paddingY * 2);
                const x = paddingX + 20 + idx * barSpacing;
                const y = chartHeight - paddingY - barHeight;
                const isHovered = hoveredIdx === idx;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Bar rectangle */}
                    <rect
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={Math.max(2, barHeight)}
                      rx="4"
                      fill={isHovered ? accentHex : hex}
                      className="transition-colors duration-200"
                    />

                    {/* Value on top of bar */}
                    <text
                      x={x}
                      y={y - 6}
                      textAnchor="middle"
                      className={`text-[11px] font-bold ${isHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-600'}`}
                    >
                      {point.value}
                    </text>

                    {/* X axis label */}
                    <text
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 font-medium truncate max-w-[50px]"
                    >
                      {point.label.length > 9 ? point.label.slice(0, 8) + '…' : point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* LINE & AREA CHART */}
        {(chart.type === 'line' || chart.type === 'area') && (
          <div className="min-w-[480px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - 20}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-sans"
                    >
                      {Math.round(maxValue * pct)}
                    </text>
                  </g>
                );
              })}

              {/* Calculate polyline coordinates */}
              {(() => {
                const points = data.map((d, idx) => {
                  const barSpacing = (chartWidth - paddingX - 40) / Math.max(data.length - 1, 1);
                  const x = paddingX + 20 + idx * barSpacing;
                  const y = chartHeight - paddingY - (d.value / maxValue) * (chartHeight - paddingY * 2);
                  return { x, y, ...d };
                });

                const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
                const areaStr = `${points[0].x},${chartHeight - paddingY} ${pointsStr} ${points[points.length - 1].x},${chartHeight - paddingY}`;

                return (
                  <g>
                    {/* Area fill */}
                    <polygon points={areaStr} fill={hex} fillOpacity="0.12" />

                    {/* Line stroke */}
                    <polyline
                      fill="none"
                      stroke={hex}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pointsStr}
                    />

                    {/* Nodes */}
                    {points.map((p, idx) => {
                      const isHovered = hoveredIdx === idx;
                      return (
                        <g
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 6 : 4}
                            fill="#FFFFFF"
                            stroke={hex}
                            strokeWidth={isHovered ? 3 : 2}
                            className="transition-all"
                          />
                          <text
                            x={p.x}
                            y={p.y - 10}
                            textAnchor="middle"
                            className="text-[10px] font-bold fill-slate-700"
                          >
                            {p.value}
                          </text>
                          <text
                            x={p.x}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            className="text-[10px] fill-slate-500 font-medium"
                          >
                            {p.label.length > 9 ? p.label.slice(0, 8) + '…' : p.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>
          </div>
        )}

        {/* PIE / DONUT CHART */}
        {chart.type === 'pie' && (
          <div className="flex flex-col md:flex-row items-center justify-around py-3 gap-6">
            <svg viewBox="0 0 200 200" className="w-48 h-48">
              {(() => {
                let accumulatedAngle = 0;
                return data.map((point, idx) => {
                  const sliceAngle = (point.value / totalValue) * 360;
                  const startAngle = accumulatedAngle;
                  accumulatedAngle += sliceAngle;
                  const endAngle = accumulatedAngle;

                  // Convert polar to cartesian
                  const radius = 70;
                  const innerRadius = 38; // donut style
                  const cx = 100;
                  const cy = 100;

                  const startRad = ((startAngle - 90) * Math.PI) / 180;
                  const endRad = ((endAngle - 90) * Math.PI) / 180;

                  const x1 = cx + radius * Math.cos(startRad);
                  const y1 = cy + radius * Math.sin(startRad);
                  const x2 = cx + radius * Math.cos(endRad);
                  const y2 = cy + radius * Math.sin(endRad);

                  const ix1 = cx + innerRadius * Math.cos(startRad);
                  const iy1 = cy + innerRadius * Math.sin(startRad);
                  const ix2 = cx + innerRadius * Math.cos(endRad);
                  const iy2 = cy + innerRadius * Math.sin(endRad);

                  const largeArc = sliceAngle > 180 ? 1 : 0;
                  const pathData = [
                    `M ${ix1} ${iy1}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                    `L ${ix2} ${iy2}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
                    'Z',
                  ].join(' ');

                  const color = pieColors[idx % pieColors.length];
                  const isHovered = hoveredIdx === idx;

                  return (
                    <path
                      key={idx}
                      d={pathData}
                      fill={color}
                      opacity={isHovered ? 1 : 0.88}
                      className="cursor-pointer transition-transform duration-150 hover:scale-105 origin-center"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                });
              })()}
              <circle cx="100" cy="100" r="32" fill="#FFFFFF" />
              <text x="100" y="97" textAnchor="middle" className="text-[10px] font-medium fill-slate-400">
                TOTAL
              </text>
              <text x="100" y="112" textAnchor="middle" className="text-[13px] font-bold fill-slate-800">
                {Math.round(totalValue)}
              </text>
            </svg>

            {/* Legend list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {data.map((point, idx) => {
                const color = pieColors[idx % pieColors.length];
                const pct = Math.round((point.value / totalValue) * 100);
                const isHovered = hoveredIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                      isHovered ? 'bg-slate-100 font-semibold' : ''
                    }`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-slate-700 truncate max-w-[110px]">{point.label}</span>
                    <span className="text-slate-400 ml-auto">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
