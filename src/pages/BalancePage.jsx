import { useState, useEffect, useCallback, useRef } from 'react';
import { balanceService } from '../services/api';
import {
  Building2,
  Layers,
  RefreshCw,
  Search,
  Eye,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { BalanceDetailModal } from '../components/modals/BalanceDetailModal';

const SEARCH_DEBOUNCE_MS = 400;

export const BalancePage = () => {
  const [activeTab, setActiveTab] = useState('mitra');
  const [balanceLogs, setBalanceLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [jumpPageInput, setJumpPageInput] = useState('');

  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchBalanceData = useCallback(async (page = 1) => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {
        page: Number(page),
        limit: 20,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
        params.mitra_code = debouncedSearch;
      }

      let res;
      if (activeTab === 'mitra') {
        res = await balanceService.getDigitalBalanceMitra(params);
      } else {
        res = await balanceService.getDigitalBalance(params);
      }

      if (currentRequestId !== requestIdRef.current) return;

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : res?.items || res?.rows || [];

      const pag =
        res?.pagination ||
        res?.data?.pagination ||
        res?.meta ||
        res?.data?.meta ||
        {};

      const limitVal = Number(pag.limit ?? res?.limit ?? 20);
      const pageVal = Number(pag.page ?? res?.page ?? page);
      
      const rawTotal =
        pag.total ??
        pag.total_data ??
        pag.total_records ??
        pag.total_rows ??
        pag.count ??
        res?.total ??
        res?.total_data ??
        res?.count;

      const totalVal = rawTotal !== undefined && rawTotal !== null ? Number(rawTotal) : list.length;
      
      const rawTotalPages =
        pag.total_pages ??
        pag.total_page ??
        pag.totalPages ??
        res?.total_pages ??
        res?.total_page;

      const calculatedPages = Math.ceil(totalVal / (limitVal || 1)) || 1;
      const totalPagesVal = rawTotalPages !== undefined && rawTotalPages !== null
        ? Number(rawTotalPages)
        : calculatedPages;

      setBalanceLogs(list);
      setPagination({
        page: pageVal,
        limit: limitVal,
        total: totalVal,
        total_pages: totalPagesVal > 0 ? totalPagesVal : 1,
      });
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.error('Gagal mengambil data mutasi saldo:', err);
      setErrorMsg(err.message || 'Gagal memuat riwayat mutasi saldo.');
      setBalanceLogs([]);
      setPagination({ page: 1, limit: 20, total: 0, total_pages: 1 });
    } finally {
      if (currentRequestId === requestIdRef.current) setLoading(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchBalanceData(1);
  }, [fetchBalanceData]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchInput('');
    setDebouncedSearch('');
    setJumpPageInput('');
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.total_pages || loading) return;
    fetchBalanceData(newPage);
    setJumpPageInput('');
  };

  const handleJumpPageSubmit = (e) => {
    e.preventDefault();
    const targetPage = Number(jumpPageInput);
    if (!targetPage || targetPage < 1 || targetPage > pagination.total_pages) {
      alert(`Masukkan nomor halaman antara 1 sampai ${pagination.total_pages}`);
      return;
    }
    handlePageChange(targetPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mutasi Saldo Digital</h1>
          <p className="text-sm text-slate-500">
            Monitoring arus kas masuk (kredit) dan keluar (debit) saldo digital mitra & sistem
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchBalanceData(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Navigasi Tab & Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => handleTabChange('mitra')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mitra'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Saldo Mutasi Mitra
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('system')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Saldo Mutasi Sistem / Biller
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari kode mitra..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tabel Mutasi Saldo */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
          Memuat riwayat mutasi saldo...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Kode Mitra & App</th>
                  <th className="px-4 py-3 font-semibold">Reference & UID</th>
                  <th className="px-4 py-3 font-semibold">Kategori / Deskripsi</th>
                  <th className="px-4 py-3 font-semibold text-right">Kredit (+)</th>
                  <th className="px-4 py-3 font-semibold text-right">Debit (-)</th>
                  <th className="px-4 py-3 font-semibold">Tanggal & Waktu</th>
                  <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                      Tidak ada mutasi saldo ditemukan.
                    </td>
                  </tr>
                ) : (
                  balanceLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        #{item.id}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 font-mono text-xs">{item.mitra_code || '-'}</p>
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded mt-0.5">
                          {item.app_id || 'general'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs font-mono font-medium text-blue-600 flex items-center gap-1">
                          {item.reference_id || '-'}
                        </p>
                        {item.uid && (
                          <p className="text-[11px] font-mono text-slate-400">UID: {item.uid}</p>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-xs truncate">
                        <span className="font-semibold text-slate-700 text-xs">
                          [{item.category || 'MUTASI'}]
                        </span>
                        <p className="text-xs text-slate-500 truncate" title={item.description}>
                          {item.description || '-'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {Number(item.credit) > 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 font-mono text-xs">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            +Rp {Number(item.credit).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {Number(item.debit) > 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 font-mono text-xs">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            -Rp {Number(item.debit).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedBalance(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50">
            <span className="text-xs text-slate-500">
              Halaman <span className="font-semibold text-slate-800">{pagination.page}</span> dari{' '}
              <span className="font-semibold text-slate-800">{pagination.total_pages}</span>{' '}
              ({pagination.total} data)
            </span>

            <div className="flex items-center gap-3">
              <form onSubmit={handleJumpPageSubmit} className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Lompat ke:</span>
                <input
                  type="number"
                  min="1"
                  max={pagination.total_pages}
                  placeholder="Hal"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center font-mono"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer transition-colors"
                >
                  Go
                </button>
              </form>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  &laquo; Prev
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.total_pages || loading}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Mutasi Saldo */}
      <BalanceDetailModal
        isOpen={Boolean(selectedBalance)}
        onClose={() => setSelectedBalance(null)}
        balanceData={selectedBalance}
      />
    </div>
  );
};