import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Send,
  MessageCircle,
  Smartphone,
  Download,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  isWebShareSupported,
  shareViaWebShare,
  openWhatsAppShare,
  openSMSShare,
  PupilShareData,
  LessonPlanShareData,
  formatStudentProgressReportText,
  formatLessonPlanShareText,
} from '../utils/webShare';

export interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareType: 'progress_report' | 'lesson_plan' | 'custom';
  pupilData?: PupilShareData;
  lessonData?: LessonPlanShareData;
  customText?: string;
  recipientPhone?: string;
  recipientName?: string;
  showToast?: (msg: string) => void;
}

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  shareType,
  pupilData,
  lessonData,
  customText,
  recipientPhone,
  recipientName,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const contentText =
    shareType === 'progress_report' && pupilData
      ? formatStudentProgressReportText(pupilData)
      : shareType === 'lesson_plan' && lessonData
      ? formatLessonPlanShareText(lessonData)
      : customText || '';

  const hasNativeShare = isWebShareSupported();
  const targetPhone = recipientPhone || pupilData?.parentPhone;
  const targetName = recipientName || pupilData?.parentName || 'Parent / Guardian';

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const res = await shareViaWebShare({
        title,
        text: contentText,
        url: typeof window !== 'undefined' ? window.location.origin : undefined,
      });

      if (res.success) {
        if (showToast) {
          showToast(
            res.method === 'native'
              ? 'Shared successfully via Native OS! 🚀'
              : 'Content copied to clipboard! 📋'
          );
        }
        onClose();
      } else if (!res.cancelled) {
        if (showToast) showToast('Could not open native share. You can use WhatsApp or Copy.');
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError' && showToast) {
        showToast('Sharing cancelled or unavailable.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentText);
      setCopied(true);
      if (showToast) showToast('Report copied to clipboard! Ready to paste into WhatsApp/SMS 📋');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      if (showToast) showToast('Failed to copy to clipboard.');
    }
  };

  const handleWhatsApp = () => {
    openWhatsAppShare(targetPhone, contentText);
    if (showToast) showToast(`Opening WhatsApp for ${targetName}... 💬`);
  };

  const handleSMS = () => {
    openSMSShare(targetPhone, contentText);
    if (showToast) showToast(`Opening SMS messaging for ${targetName}... 📱`);
  };

  const handleDownload = () => {
    const filename =
      shareType === 'progress_report' && pupilData
        ? `CBC-Report-${pupilData.upi}.txt`
        : shareType === 'lesson_plan' && lessonData
        ? `Lesson-Plan-${lessonData.subject}-${lessonData.grade}.txt`
        : 'school-document.txt';

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contentText));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (showToast) showToast(`Downloaded ${filename} 📄`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0B152E] border-2 border-cyan-500/60 rounded-3xl w-full max-w-xl p-5 sm:p-6 text-white shadow-2xl space-y-4 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  Web Share API
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Recipient: <strong className="text-cyan-300">{targetName}</strong>
                {targetPhone ? ` (${targetPhone})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Support Pill Banner */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">
              {hasNativeShare
                ? 'Native OS Share sheet supported on this device/browser.'
                : 'Native share unavailable in this browser; using WhatsApp & Clipboard fallbacks.'}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              hasNativeShare
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}
          >
            {hasNativeShare ? 'Native API Active' : 'Fallback Active'}
          </span>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Formatted Share Text Preview</span>
            <span className="font-mono text-[10px]">{contentText.length} characters</span>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-200 max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
            {contentText}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          {/* Primary Action: Native OS Share */}
          <button
            type="button"
            disabled={isSharing}
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {isSharing
                ? 'Opening Native Share Sheet...'
                : hasNativeShare
                ? 'Share via Native OS (WhatsApp, Messages, Drive, AirDrop)'
                : 'Share / Copy (Web Share Fallback)'}
            </span>
          </button>

          {/* Secondary Quick Share Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Send via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleSMS}
              className="py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Send via SMS"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Copy Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
