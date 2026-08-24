import { useState } from 'react';
import { X, Code2, Copy, Check, FileText, Globe } from 'lucide-react';

export const CallbackPayloadModal = ({ isOpen, onClose, logData }) => {
  const [activeTab, setActiveTab] = useState('detail');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !logData) return null;

  const parseHeader = (headerStr) => {
    if (!headerStr) return null;
    try {
      return JSON.parse(headerStr);
    } catch {
      return headerStr;
    }
  };

  const parsedHeader = parseHeader(logData.request_header);
  const rawJsonText = JSON.stringify(logData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Callback Log #{logData.id}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {logData.transaction_no || '-'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 flex justify-between items-center border-b border-slate-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Detail Data
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('header')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'header'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Request Header
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'raw'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Raw JSON
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin' : 'Salin Semua'}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'detail' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction No</span>
                <span className="font-mono font-bold text-slate-800">{logData.transaction_no || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Reff ID</span>
                <span className="font-mono text-slate-800">{logData.payment_reff_id || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Channel ID</span>
                <span className="font-mono text-slate-800">{logData.channel_id || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Client IP</span>
                <span className="font-mono text-slate-800">{logData.client_ip || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nominal</span>
                <span className="font-bold text-blue-600 text-sm">
                  {logData.currency || 'IDR'} {Number(logData.transaction_amount || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-emerald-600">
                  {logData.transaction_message} ({logData.transaction_status})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Additional Data</span>
                <span className="text-slate-700">{logData.additional_data || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Auth Code</span>
                <span className="font-mono text-slate-500 truncate block" title={logData.auth_code}>
                  {logData.auth_code || '-'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="bg-slate-900 p-4 rounded-xl">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap select-all">
                <code>{typeof parsedHeader === 'object' ? JSON.stringify(parsedHeader, null, 2) : parsedHeader || '// Header kosong'}</code>
              </pre>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="bg-slate-900 p-4 rounded-xl">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap select-all">
                <code>{rawJsonText}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};