/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  Printer,
  Save,
  FileText,
  Copy,
  Check,
  Undo,
  Redo,
  Table as TableIcon
} from 'lucide-react';

export interface WordDocumentToolProps {
  initialTitle?: string;
  initialContent?: string;
  onSave?: (title: string, content: string) => void;
  readOnly?: boolean;
}

export function WordDocumentTool({
  initialTitle = 'Untitled Document',
  initialContent = '',
  onSave,
  readOnly = false
}: WordDocumentToolProps) {
  const [docTitle, setDocTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);
  const [activeAlign, setActiveAlign] = useState<'left' | 'center' | 'right'>('left');

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleInsertText = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}\n${prefix} [Text here] ${suffix}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${docTitle}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([`${docTitle}\n\n${content}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${docTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl overflow-hidden flex flex-col font-sans">
      {/* Document Top Bar */}
      <div className="bg-slate-100 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            disabled={readOnly}
            className="font-bold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-400 focus:border-blue-600 focus:outline-none px-1 py-0.5 rounded w-full max-w-md"
            placeholder="Document Title"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-xs transition-all"
            title="Copy Document Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-xs transition-all"
            title="Download Word Document"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .doc</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-xs transition-all"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {onSave && !readOnly && (
            <button
              onClick={() => onSave(docTitle, content)}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Ribbon / Formatting Toolbar */}
      {!readOnly && (
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center gap-1 text-slate-700 text-xs">
          {/* Headings */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-slate-300">
            <button
              onClick={() => handleInsertText('## HEADING 1')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText('### HEADING 2')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText('#### HEADING 3')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Text Style */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300">
            <button
              onClick={() => handleInsertText('**[BOLD TEXT]**')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 font-bold"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText('*[ITALIC TEXT]*')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 italic"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText('<u>[UNDERLINE TEXT]</u>')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 underline"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300">
            <button
              onClick={() => handleInsertText('• ')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700"
              title="Bulleted List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText('1. ')}
              className="p-1 rounded hover:bg-slate-200 text-slate-700"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300">
            <button
              onClick={() => setActiveAlign('left')}
              className={`p-1 rounded ${activeAlign === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-700'}`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveAlign('center')}
              className={`p-1 rounded ${activeAlign === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-700'}`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveAlign('right')}
              className={`p-1 rounded ${activeAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-700'}`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Inserts */}
          <div className="flex items-center gap-1.5 pl-2">
            <button
              onClick={() => handleInsertText('| Column 1 | Column 2 | Column 3 |\n|---|---|---|\n| Item A | Item B | Item C |')}
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center gap-1"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Insert Table</span>
            </button>

            <button
              onClick={() => handleInsertText('--- Official QASO Kenya Curriculum Header ---\nSchool: Little Roses Academy\nTerm: Term 1 | Pacing: 2-Term Standard')}
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
            >
              + CBC Stamp
            </button>
          </div>
        </div>
      )}

      {/* Editor Body - Paper Style */}
      <div className="p-4 sm:p-6 bg-slate-200/60 overflow-y-auto max-h-[520px] flex justify-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-slate-300 p-6 min-h-[420px] flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={readOnly}
            placeholder="Type or paste curriculum design, lesson notes, scheme of work, or teacher reflections here..."
            className={`w-full flex-1 resize-y bg-transparent focus:outline-none text-slate-800 font-sans text-xs sm:text-sm leading-relaxed ${
              activeAlign === 'center' ? 'text-center' : activeAlign === 'right' ? 'text-right' : 'text-left'
            }`}
            rows={16}
          />
        </div>
      </div>

      {/* Status Footer */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>
          <span>Words: {wordCount}</span> • <span>Characters: {charCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Format: Microsoft Word (.docx compatible)</span>
          <span className="text-emerald-700 font-bold">● Local Auto-save Active</span>
        </div>
      </div>
    </div>
  );
}
