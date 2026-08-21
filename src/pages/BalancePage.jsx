import { useState, useEffect, useMemo, useCallback } from 'react';
import { balanceService } from '../services/api';
import {
  Building2,
  Layers,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';

export const BalancePage = () => {
  const [activeTab, setActiveTab] = useState('mitra'); // 'mitra' atau 'system'
  const [balanceLogs, setBalanceLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBalanceData = useCallback(async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const limit = 10;
      const params = { page, limit };

      let res;
      if (activeTab === 'mitra') {
        res = await balanceService.getDigitalBalanceMitra(params);
      } else {
        res = await balanceService.getDigitalBalance(params);
      }

      const list = Array.isArray(res)
        ? res
        : (res?.data || res?.items || res?.rows || []);

      const rawPag = res?.pagination || res?.meta || {};
      const totalData = Number(rawPag.total ?? rawPag.total_data ?? rawPag.count ?? list.length);
      const limitData = Number(rawPag.limit ?? limit);
      const currentPage = Number(rawPag.page ?? rawPag.current_page ?? page);

      const calculatedPages = Math.ceil(totalData / (limitData || 1)) || 1;
      const totalPages = Number(rawPag.total_pages ?? rawPag.total_page ?? rawPag.totalPages ?? calculatedPages);

      setBalanceLogs(list);
      setPagination({
        page: currentPage,
        limit: limitData,
        total: totalData,
        total_pages: totalPages,
      });
    } catch (err) {
      console.error('Gagal mengambil data mutasi saldo:', err);
      setErrorMsg(err.message || 'Gagal memuat riwayat mutasi saldo.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBalanceData(1);
  }, [fetchBalanceData]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return balanceLogs;
    const q = searchQuery.toLowerCase();

    return balanceLogs.filter((item) => {
      const mitra = (item.mitra_code || '').toLowerCase();
      const ref = (item.reference_id || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const uid = (item.uid || '').toLowerCase();
      return mitra.includes(q) || ref.includes(q) || cat.includes(q) || desc.includes(q) || uid.includes(q);
    });
  }, [balanceLogs, searchQuery]);

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
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors disabled:opacity-50"
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
            onClick={() => {
              setActiveTab('mitra');
              setSearchQuery('');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'mitra'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Building2 className="w-4 h-4" />
            Saldo Mutasi Mitra
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('system');
              setSearchQuery('');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'system'
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode mitra, ref ID, kategori..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                      Tidak ada mutasi saldo ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        #{item.id}
                      </td>

                      {/* Mitra & App ID */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{item.mitra_code || '-'}</p>
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded mt-0.5">
                          {item.app_id || 'general'}
                        </span>
                      </td>

                      {/* Ref ID & UID */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono font-medium text-blue-600 flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5" />
                          {item.reference_id || '-'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">UID: {item.uid || '-'}</p>
                      </td>

                      {/* Kategori & Keterangan */}
                      <td className="px-4 py-3 max-w-xs truncate">
                        <span className="font-semibold text-slate-700 text-xs">
                          [{item.category || 'MUTASI'}]
                        </span>
                        <p className="text-xs text-slate-500 truncate" title={item.description}>
                          {item.description || '-'}
                        </p>
                      </td>

                      {/* Nominal Kredit (Masuk) */}
                      <td className="px-4 py-3 text-right">
                        {Number(item.credit) > 0 ? (
                          <span className="font-bold text-emerald-600 font-mono text-sm">
                            + Rp {Number(item.credit).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">-</span>
                        )}
                      </td>

                      {/* Nominal Debit (Keluar) */}
                      <td className="px-4 py-3 text-right">
                        {Number(item.debit) > 0 ? (
                          <span className="font-bold text-rose-600 font-mono text-sm">
                            - Rp {Number(item.debit).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">-</span>
                        )}
                      </td>

                      {/* Waktu Transaksi */}
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Kontrol Navigasi Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Menampilkan <span className="font-medium">{filteredLogs.length}</span> dari{' '}
              <span className="font-medium">{pagination.total}</span> data mutasi
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchBalanceData(pagination.page - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              <span className="text-xs font-medium text-slate-600 px-2">
                Hal {pagination.page} dari {pagination.total_pages || 1}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.total_pages || loading}
                onClick={() => fetchBalanceData(pagination.page + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};