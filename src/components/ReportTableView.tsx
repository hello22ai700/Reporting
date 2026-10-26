import React, { useState } from 'react';
import { ReportTable, ReportTheme, THEME_CONFIGS } from '../types/report';
import { Plus, Trash2, ArrowUpDown, Search } from 'lucide-react';

interface Props {
  table: ReportTable;
  theme: ReportTheme;
  isEditable?: boolean;
  onUpdate?: (updated: ReportTable) => void;
}

export const ReportTableView: React.FC<Props> = ({
  table,
  theme,
  isEditable = false,
  onUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS['executive-blue'];
  const hex = `#${themeConfig.primaryHex}`;

  const headers = table.headers || [];
  const rows = table.rows || [];

  // Filtered rows for viewing
  const filteredRows = rows.filter(row => {
    if (!searchTerm) return true;
    return row.some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Sorting
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sortCol === null) return 0;
    const valA = a[sortCol];
    const valB = b[sortCol];
    const numA = parseFloat(String(valA).replace(/[^0-9.-]/g, ''));
    const numB = parseFloat(String(valB).replace(/[^0-9.-]/g, ''));

    if (!isNaN(numA) && !isNaN(numB)) {
      return sortAsc ? numA - numB : numB - numA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleCellChange = (rowIndex: number, colIndex: number, newValue: string) => {
    if (!onUpdate) return;
    const newRows = rows.map((r, rIdx) => {
      if (rIdx === rowIndex) {
        const updatedRow = [...r];
        updatedRow[colIndex] = newValue;
        return updatedRow;
      }
      return r;
    });
    onUpdate({ ...table, rows: newRows });
  };

  const handleHeaderChange = (colIndex: number, newHeader: string) => {
    if (!onUpdate) return;
    const newHeaders = [...headers];
    newHeaders[colIndex] = newHeader;
    onUpdate({ ...table, headers: newHeaders });
  };

  const addRow = () => {
    if (!onUpdate) return;
    const newRow = headers.map((_, i) => (i === 0 ? `New Item ${rows.length + 1}` : '-'));
    onUpdate({ ...table, rows: [...rows, newRow] });
  };

  const deleteRow = (rowIndex: number) => {
    if (!onUpdate) return;
    const newRows = rows.filter((_, idx) => idx !== rowIndex);
    onUpdate({ ...table, rows: newRows });
  };

  const addColumn = () => {
    if (!onUpdate) return;
    const colName = `Column ${headers.length + 1}`;
    const newHeaders = [...headers, colName];
    const newRows = rows.map(r => [...r, '-']);
    onUpdate({ ...table, headers: newHeaders, rows: newRows });
  };

  const deleteColumn = (colIndex: number) => {
    if (!onUpdate || headers.length <= 1) return;
    const newHeaders = headers.filter((_, idx) => idx !== colIndex);
    const newRows = rows.map(r => r.filter((_, idx) => idx !== colIndex));
    onUpdate({ ...table, headers: newHeaders, rows: newRows });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Header controls */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          {isEditable ? (
            <input
              type="text"
              value={table.title || ''}
              onChange={e => onUpdate && onUpdate({ ...table, title: e.target.value })}
              className="font-semibold text-sm text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="Table Title"
            />
          ) : (
            <h4 className="font-semibold text-sm text-slate-800">{table.title}</h4>
          )}
          {table.summary && <p className="text-xs text-slate-500 mt-0.5">{table.summary}</p>}
        </div>

        {/* View mode search or Edit mode quick actions */}
        {!isEditable ? (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 w-40 sm:w-56"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={addRow}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              Add Row
            </button>
            <button
              onClick={addColumn}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              Add Column
            </button>
          </div>
        )}
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: hex }}>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-white font-semibold tracking-wider uppercase text-[11px] border-r border-white/20 last:border-r-0"
                >
                  {isEditable ? (
                    <div className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={header}
                        onChange={e => handleHeaderChange(idx, e.target.value)}
                        className="bg-black/20 text-white px-2 py-0.5 rounded text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-white w-full"
                      />
                      {headers.length > 1 && (
                        <button
                          onClick={() => deleteColumn(idx)}
                          title="Delete column"
                          className="text-white/70 hover:text-white p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (sortCol === idx) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortCol(idx);
                          setSortAsc(true);
                        }
                      }}
                      className="inline-flex items-center gap-1 hover:underline focus:outline-hidden"
                    >
                      <span>{header}</span>
                      <ArrowUpDown className="w-3 h-3 opacity-70" />
                    </button>
                  )}
                </th>
              ))}
              {isEditable && <th className="px-3 py-2 text-white/80 w-12 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(!isEditable ? sortedRows : rows).map((row, rIdx) => (
              <tr
                key={rIdx}
                className={rIdx % 2 === 0 ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-50'}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2.5 text-slate-700 border-r border-slate-100 last:border-r-0">
                    {isEditable ? (
                      <input
                        type="text"
                        value={String(cell)}
                        onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded px-2 py-1 text-xs text-slate-800 transition-colors focus:outline-hidden"
                      />
                    ) : (
                      <span className="font-medium text-slate-800">{cell}</span>
                    )}
                  </td>
                ))}
                {isEditable && (
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => deleteRow(rIdx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Delete row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditable && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Excel-style live editing: Click any header or cell to edit values directly.</span>
          <button
            onClick={addRow}
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Row
          </button>
        </div>
      )}
    </div>
  );
};
