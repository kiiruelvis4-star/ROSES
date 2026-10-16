import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Send,
  Download,
  Info,
  Smartphone,
  MessageSquare,
  FileText
} from 'lucide-react';
import {
  isWebShareSupported,
  shareViaWebShareOrFallback,
  copyToClipboard,
  getWhatsAppShareUrl,
  PupilReportInfo,
  LessonPlanInfo,
  formatStudentProgressReportText,
  formatLessonPlanShareText
} from '../utils/webShare';

export interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'progress_report' | 'lesson_plan' | 'document';
  pupilData?: PupilReportInfo;
  lessonData?: LessonPlanInfo;
  documentData?: {
    title: string;
    grade?: string;
    subject?: string;
    content?: string;
    fileName?: string;
  };
  teacherName?: string;
  showToast: (msg: string) => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  type,
  pupilData,
  lessonData,
  documentData,
  teacherName,
  showToast
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const hasNativeShare = isWebShareSupported();

  // Generate title and formatted content
  let title = '';
  let content = '';
  let recipientPhone = '';
  let recipientLabel = '';
  let fileName = '';

  if (type === 'progress_report' && pupilData) {
    title = `CBC Progress Report - ${pupilData.name}`;
    content = formatStudentProgressReportText(pupilData, teacherName);
    recipientPhone = pupilData.parentPhone || '';
    recipientLabel = pupilData.parentName ? `${pupilData.parentName} (${pupilData.parentRelation || 'Parent'})` : 'Parent';
    fileName = `CBC_Report_${pupilData.upi.replace(/\s+/g, '_')}.txt`;
  } else if (type === 'lesson_plan' && lessonData) {
    title = `Lesson Plan - ${lessonData.subject} (${lessonData.grade})`;
    content = formatLessonPlanShareText(lessonData, teacherName);
    recipientLabel = `Parents of ${lessonData.grade}`;
    fileName = `Lesson_Plan_${lessonData.subject.replace(/\s+/g, '_')}_${lessonData.grade.replace(/\s+/g, '_')}.txt`;
  } else if (documentData) {
    title = documentData.title;
    content = `🏫 LITTLE ROSES ACADEMY\n📁 CURRICULUM RESOURCE: ${documentData.title}\nGrade: ${documentData.grade || 'General'} • Subject: ${documentData.subject || 'CBC'}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${documentData.content || 'School curriculum resource.'}`;
    fileName = documentData.fileName || `${documentData.title.replace(/\s+/g, '_')}.txt`;
  }

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const res = await shareViaWebShareOrFallback({
        title,
        text: content,
        fileName,
        recipientPhone
      });

      if (res.success) {
        if (res.method === 'native') {
          showToast('Shared successfully via Native OS! 🚀');
        } else if (res.method === 'whatsapp') {
          showToast('Opened in WhatsApp! 💬');
        } else if (res.method === 'clipboard') {
          showToast('Report copied to clipboard! 📋');
        }
        onClose();
      } else if (res.cancelled) {
        // User backed out of the native dialog
      } else {
        showToast(res.error || 'Sharing could not be completed.');
      }
    } catch {
      showToast('Sharing failed. Please try copying the text.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsApp = () => {
    const url = getWhatsAppShareUrl(recipientPhone, content);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with formatted details... 💬');
    onClose();
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      showToast('Copied formatted message to clipboard! 📋');
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast('Could not copy to clipboard.');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded ${fileName}! 📄`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0B152E] border-2 border-emerald-500/80 rounded-3xl w-full max-w-xl text-white shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Share with Parents via Web Share API
              </h3>
              <p className="text-[11px] text-emerald-300 font-mono">
                {type === 'progress_report'
                  ? 'Official CBC Student Progress Report'
                  : type === 'lesson_plan'
                  ? 'CBC Lesson Plan & Homework Sheet'
                  : 'Curriculum Resource Document'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Target Recipient Banner */}
          {recipientLabel && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Recipient:</span>
                <span className="font-bold text-white">{recipientLabel}</span>
              </div>
              {recipientPhone && (
                <span className="font-mono text-emerald-400 text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  {recipientPhone}
                </span>
              )}
            </div>
          )}

          {/* Formatted Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                Message Preview
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {content.length} characters
              </span>
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] leading-relaxed text-slate-200 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto select-all">
              {content}
            </pre>
          </div>

          {/* Native OS Sharing Status Badge */}
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Native OS Sharing:</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  {hasNativeShare ? 'Supported on this device' : 'Fallback Mode Active'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-normal">
                {hasNativeShare
                  ? 'Tapping "Native OS Share" opens your device\'s system sheet to share directly into WhatsApp, SMS, AirDrop, Gmail, or Telegram.'
                  : 'Your browser will seamlessly offer WhatsApp direct messaging and clipboard copying as fallbacks.'}
              </p>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* 1. Primary: Native OS Share */}
            <button
              type="button"
              disabled={isSharing}
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>{hasNativeShare ? 'Open Native OS Share' : 'Share Now'}</span>
            </button>

            {/* 2. Direct WhatsApp Link */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>

            {/* 3. Copy to Clipboard */}
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {/* 4. Download as Text Document */}
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 px-5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-slate-400">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Little Roses Academy CBC Home-School Bridge</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
