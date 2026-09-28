/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Table as TableIcon,
  Plus,
  Trash2,
  Download,
  Calculator,
  RotateCcw,
  Save,
  Check,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

export interface SpreadsheetTemplate {
  id: string;
  name: string;
  headers: string[];
  rows: string[][];
}

export const CBC_SPREADSHEET_TEMPLATES: Record<string, SpreadsheetTemplate> = {
  cat_weighted: {
    id: 'cat_weighted',
    name: 'CAT (60%) & Assignment (40%) Assessment Sheet (Ready to Key In)',
    headers: [
      'Learner Name',
      'UPI',
      'CAT 1 (20)',
      'CAT 2 (20)',
      'CAT 3 (20)',
      'CAT Avg (60%)',
      'Assign 1 (10)',
      'Assign 2 (10)',
      'Assign Avg (40%)',
      'Total (100%)',
      'CBC Band'
    ],
    rows: [
      ['Brian Mwangi Kamau', 'LRA-2026-0042', '', '', '', '', '', '', '', '', ''],
      ['Aisha Njeri Odhiambo', 'LRA-2026-0047', '', '', '', '', '', '', '', '', ''],
      ['Kevin Otieno Onyango', 'LRA-2026-0019', '', '', '', '', '', '', '', '', ''],
      ['Mercy Wanjiku Gitau', 'LRA-2026-0033', '', '', '', '', '', '', '', '', ''],
      ['David Kiprono Cheruiyot', 'LRA-2026-0051', '', '', '', '', '', '', '', '', '']
    ]
  },
  schemes_two_terms: {
    id: 'schemes_two_terms',
    name: 'Schemes of Work (2-Term Template • Ready to Key In)',
    headers: [
      'Term',
      'Week',
      'Lesson',
      'Strand',
      'Sub-Strand',
      'Specific Learning Outcomes',
      'Learning Experiences',
      'Key Inquiry Question',
      'Resources',
      'Assessment'
    ],
    rows: [
      ['Term 1', 'W1', 'L1', '', '', '', '', '', '', ''],
      ['Term 1', 'W1', 'L2', '', '', '', '', '', '', ''],
      ['Term 1', 'W2', 'L1', '', '', '', '', '', '', ''],
      ['Term 1', 'W2', 'L2', '', '', '', '', '', '', ''],
      ['Term 2', 'W1', 'L1', '', '', '', '', '', '', ''],
      ['Term 2', 'W1', 'L2', '', '', '', '', '', '', '']
    ]
  },
  rubric_assessment_book: {
    id: 'rubric_assessment_book',
    name: 'Official Assessment Book Format (4 Color Rubric • Blank Format)',
    headers: ['Learner Name', 'UPI', 'Strand 1 (EE/ME/AE/BE)', 'Strand 2', 'Strand 3', 'Strand 4', 'Overall Level', 'Color Indicator'],
    rows: [
      ['Brian Mwangi Kamau', 'LRA-2026-0042', '', '', '', '', '', ''],
      ['Aisha Njeri Odhiambo', 'LRA-2026-0047', '', '', '', '', '', ''],
      ['Kevin Otieno Onyango', 'LRA-2026-0019', '', '', '', '', '', ''],
      ['Mercy Wanjiku Gitau', 'LRA-2026-0033', '', '', '', '', '', ''],
      ['David Kiprono Cheruiyot', 'LRA-2026-0051', '', '', '', '', '', '']
    ]
  }
};

export interface SpreadsheetToolProps {
  initialTitle?: string;
  defaultTemplateKey?: string;
  onSave?: (title: string, data: { headers: string[]; rows: string[][] }) => void;
  readOnly?: boolean;
}

export function SpreadsheetTool({
  initialTitle = 'CBC Spreadsheet Workbook',
  defaultTemplateKey = 'cat_weighted',
  onSave,
  readOnly = false
}: SpreadsheetToolProps) {
  const initialData = CBC_SPREADSHEET_TEMPLATES[defaultTemplateKey] || CBC_SPREADSHEET_TEMPLATES.cat_weighted;
  const [sheetTitle, setSheetTitle] = useState(initialTitle || initialData.name);
  const [headers, setHeaders] = useState<string[]>(initialData.headers);
  const [rows, setRows] = useState<string[][]>(initialData.rows);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const handleCellChange = (rIdx: number, cIdx: number, value: string) => {
    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[rIdx]) next[rIdx] = [];
      next[rIdx][cIdx] = value;
      return next;
    });
  };

  const handleHeaderChange = (cIdx: number, value: string) => {
    setHeaders((prev) => {
      const next = [...prev];
      next[cIdx] = value;
      return next;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, new Array(headers.length).fill('')]);
  };

  const handleDeleteRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddCol = () => {
    setHeaders((prev) => [...prev, `Column ${prev.length + 1}`]);
    setRows((prev) => prev.map((row) => [...row, '']));
  };

  const handleLoadTemplate = (key: string) => {
    const tmpl = CBC_SPREADSHEET_TEMPLATES[key];
    if (tmpl) {
      setHeaders([...tmpl.headers]);
      setRows(tmpl.rows.map((r) => [...r]));
      setSheetTitle(tmpl.name);
    }
  };

  // Re-calculate CAT (60%) + Assignment (40%) formula
  const handleCalculateWeightedCBC = () => {
    setRows((prev) =>
      prev.map((row) => {
        const next = [...row];
        // Check if row has CAT and Assignment columns
        const cat1 = parseFloat(next[2]) || 0;
        const cat2 = parseFloat(next[3]) || 0;
        const cat3 = parseFloat(next[4]) || 0;
        const catAvg = ((cat1 + cat2 + cat3) / 60) * 60; // scaled to 60%
        next[5] = Math.round(catAvg).toString();

        const a1 = parseFloat(next[6]) || 0;
        const a2 = parseFloat(next[7]) || 0;
        const aAvg = ((a1 + a2) / 20) * 40; // scaled to 40%
        next[8] = Math.round(aAvg).toString();

        const total = Math.round(catAvg + aAvg);
        next[9] = total.toString();

        if (total >= 80) next[10] = 'EE';
        else if (total >= 60) next[10] = 'ME';
        else if (total >= 40) next[10] = 'AE';
        else next[10] = 'BE';

        return next;
      })
    );
  };

  const handleExportCSV = () => {
    const lines = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${sheetTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    link.click();
  };

  const handleSave = () => {
    if (onSave) {
      onSave(sheetTitle, { headers, rows });
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="w-full rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl overflow-hidden flex flex-col font-sans">
      {/* Top Header */}
      <div className="bg-slate-100 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={sheetTitle}
            onChange={(e) => setSheetTitle(e.target.value)}
            disabled={readOnly}
            className="font-bold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-400 focus:border-emerald-600 focus:outline-none px-1 py-0.5 rounded w-full max-w-md"
            placeholder="Spreadsheet Title"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Template Selector */}
          <select
            onChange={(e) => handleLoadTemplate(e.target.value)}
            className="text-xs font-semibold px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 shadow-xs focus:outline-none"
          >
            <option value="cat_weighted">📊 Template: CAT 60% + Assign 40%</option>
            <option value="schemes_two_terms">📋 Template: Schemes of Work (2 Terms)</option>
            <option value="rubric_assessment_book">🎨 Template: 4-Color Rubric Book</option>
          </select>

          <button
            onClick={handleCalculateWeightedCBC}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1 shadow-xs transition-all"
            title="Auto-calculate 60% CAT + 40% Assignment & CBC Bands"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Recalculate (60/40)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-xs transition-all"
            title="Export to Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-xs transition-all"
            title="Print Spreadsheet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm transition-all"
          >
            {saveToast ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveToast ? 'Saved!' : 'Save Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Grid Controls */}
      {!readOnly && (
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddRow}
              className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Learner / Row</span>
            </button>
            <button
              onClick={handleAddCol}
              className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Column</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            <span>Rows: {rows.length}</span>
            <span>Columns: {headers.length}</span>
            <span className="font-mono text-emerald-700 font-bold">CBC Formula: 60% CAT + 40% Assign = 100%</span>
          </div>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto max-h-[460px] bg-slate-100 p-2">
        <table className="w-full border-collapse bg-white text-xs shadow-inner">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-1.5 w-10 text-center font-mono text-[10px] border border-slate-700 bg-slate-900">#</th>
              {headers.map((h, cIdx) => (
                <th key={cIdx} className="p-2 border border-slate-700 text-left min-w-[110px] font-bold">
                  {readOnly ? (
                    h
                  ) : (
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                      className="w-full bg-transparent text-white font-bold focus:outline-none focus:bg-slate-700 px-1 py-0.5 rounded"
                    />
                  )}
                </th>
              ))}
              {!readOnly && (
                <th className="p-1 w-10 text-center border border-slate-700 bg-slate-900">Del</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-blue-50/50 transition-colors">
                {/* Row Number */}
                <td className="p-1 text-center font-mono text-[10px] bg-slate-100 text-slate-500 border border-slate-200 select-none">
                  {rIdx + 1}
                </td>

                {headers.map((_, cIdx) => {
                  const val = row[cIdx] || '';
                  const isBandCol = val === 'EE' || val === 'ME' || val === 'AE' || val === 'BE';
                  const isColorRubric = val.includes('🟢') || val.includes('🔵') || val.includes('🟡') || val.includes('🔴');

                  return (
                    <td
                      key={cIdx}
                      className={`p-1 border border-slate-200 ${
                        activeCell?.r === rIdx && activeCell?.c === cIdx ? 'ring-2 ring-emerald-500 bg-emerald-50/30' : ''
                      }`}
                      onClick={() => setActiveCell({ r: rIdx, c: cIdx })}
                    >
                      {readOnly ? (
                        <div className="px-1 py-1 font-sans">{val}</div>
                      ) : (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs text-slate-800 bg-transparent focus:outline-none focus:bg-white rounded font-sans ${
                              val === 'EE'
                                ? 'bg-emerald-100 text-emerald-800 font-black text-center'
                                : val === 'ME'
                                ? 'bg-blue-100 text-blue-800 font-black text-center'
                                : val === 'AE'
                                ? 'bg-amber-100 text-amber-800 font-black text-center'
                                : val === 'BE'
                                ? 'bg-red-100 text-red-800 font-black text-center'
                                : ''
                            }`}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}

                {!readOnly && (
                  <td className="p-1 text-center border border-slate-200 bg-slate-50">
                    <button
                      onClick={() => handleDeleteRow(rIdx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Status Footer */}
      <div className="bg-slate-100 border-t border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-3">
          <span className="font-bold">Kenya CBC Grading:</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">🟢 EE (80–100%)</span>
          <span className="inline-flex items-center gap-1 text-blue-700 font-bold">🔵 ME (60–79%)</span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">🟡 AE (40–59%)</span>
          <span className="inline-flex items-center gap-1 text-red-700 font-bold">🔴 BE (0–39%)</span>
        </div>
        <div className="font-mono text-slate-500">
          Editable Spreadsheet (.xlsx / .csv compatible)
        </div>
      </div>
    </div>
  );
}
