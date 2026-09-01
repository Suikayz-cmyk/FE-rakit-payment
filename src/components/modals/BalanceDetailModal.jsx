import { useState } from 'react';
import { X, Receipt, Copy, Check, FileText, Code2, } from 'lucide-react';

export const BalanceDetailModal = ({ isOpen, onClose, balanceData }) => {
  const [activeTab, setActiveTab] = useState('detail');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !balanceData) return null;

  const rawJsonText = JSON.stringify(balanceData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCredit = Number(balanceData.credit || 0) > 0;
  const isDebit = Number(balanceData.debit || 0) > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Detail Mutasi #{balanceData.id}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {balanceData.reference_id || '-'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Copy Button */}
        <div className="px-5 pt-3 pb-2 flex justify-between items-center border-b border-slate-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
              onClick={() => setActiveTab('raw')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            {copied ? 'Tersalin' : 'Salin JSON'}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'detail' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Kode Mitra</span>
                <span className="font-mono font-bold text-slate-800">{balanceData.mitra_code || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">App ID</span>
                <span className="font-mono text-slate-800">{balanceData.app_id || '-'}</span>
              </div>
              {balanceData.uid && (
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">User ID (UID)</span>
                  <span className="font-mono text-slate-800">{balanceData.uid}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Reference ID</span>
                <span className="font-mono font-bold text-blue-600">{balanceData.reference_id || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Kategori</span>
                <span className="font-mono font-semibold uppercase text-slate-700">
                  {balanceData.category || 'MUTASI'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Deskripsi</span>
                <span className="text-slate-700">{balanceData.description || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nominal Kredit (Masuk)</span>
                <span className={`font-mono font-bold ${isCredit ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isCredit ? `+Rp ${Number(balanceData.credit).toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nominal Debit (Keluar)</span>
                <span className={`font-mono font-bold ${isDebit ? 'text-rose-600' : 'text-slate-400'}`}>
                  {isDebit ? `-Rp ${Number(balanceData.debit).toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Waktu Transaksi</span>
                <span className="font-mono text-slate-600">
                  {balanceData.created_at ? new Date(balanceData.created_at).toLocaleString('id-ID') : '-'}
                </span>
              </div>
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