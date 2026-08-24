import { useState, useEffect, useCallback } from 'react';
import { callbackLogService } from '../services/api';
import { Building2, Layers, RefreshCw, Eye } from 'lucide-react';
import { CallbackPayloadModal } from '../components/modals/CallbackPayloadModal';

export const LogPage = () => {
  const [activeTab, setActiveTab] = useState('client');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(appliedFilters).filter(([, v]) => v !== '' && v !== null)
      );

      let res;
      if (activeTab === 'client') {
        res = await callbackLogService.getClientLogs(cleanParams);
      } else {
        res = await callbackLogService.getBillerLogs(cleanParams);
      }

      const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
      const sortedList = [...list].sort((a, b) => Number(a.id) - Number(b.id));
      setLogs(sortedList);

      const pag = res?.pagination || res?.meta || {};
      const totalRecords = Number(pag.total ?? pag.total_data ?? res?.total ?? list.length);
      const limitRecords = Number(pag.limit ?? appliedFilters.limit ?? 10);
      const calculatedPages = Math.ceil(totalRecords / (limitRecords || 1)) || 1;
      const totalPages = Number(pag.total_pages ?? pag.total_page ?? calculatedPages);

      setPagination({
        page: Number(pag.page ?? appliedFilters.page ?? 1),
        limit: limitRecords,
        total: totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1,
      });
    } catch (err) {
      console.error('Gagal mengambil callback logs:', err);
      setErrorMsg(err.message || 'Gagal memuat data riwayat callback.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, activeTab]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setAppliedFilters({
      ...filters,
      page: 1,
    });
  };

  const handleResetFilter = () => {
    const defaultState = {
      date_from: '',
      date_to: '',
      status: '',
      page: 1,
      limit: 10,
    };
    setFilters(defaultState);
    setAppliedFilters(defaultState);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    handleResetFilter();
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    setAppliedFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status, msg) => {
    const s = String(status || '').toLowerCase();
    const m = String(msg || '').toLowerCase();
    if (s === '00' || s === '200' || m.includes('approved') || m.includes('success')) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (s === 'pending') {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Callback Log</h2>
          <p className="text-sm text-slate-500">
            Monitoring callback payload dan response dari Biller maupun ke Client/Mitra
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('client')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'client'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Callback ke Mitra / Client
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('biller')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'biller'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Callback dari Biller
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Dari Tanggal</label>
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Sampai Tanggal</label>
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Status Response</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Status</option>
              <option value="200">200 (Success)</option>
              <option value="500">500 (Error / Failed)</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cari
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
          Memuat riwayat callback...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">
                  {activeTab === 'client' ? 'Mitra / Client' : 'Biller'}
                </th>
                <th className="px-4 py-3 font-semibold">Reference ID / Trx ID</th>
                <th className="px-4 py-3 font-semibold">Endpoint Callback</th>
                <th className="px-4 py-3 font-semibold">HTTP Code</th>
                <th className="px-4 py-3 font-semibold">Waktu Callback</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    Tidak ada riwayat callback log ditemukan.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{item.id}</td>

                    {/* Channel ID & IP */}
                    <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 font-mono text-xs">{item.channel_id || '-'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{item.client_ip || '-'}</p>
                    </td>

                    {/* No Transaksi & Reff */}
                    <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-blue-600">
                        {item.transaction_no || item.reference_id || '-'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                        Ref: {item.payment_reff_id || '-'}
                        </p>
                    </td>

                    {/* Nominal */}
                    <td className="px-4 py-3 font-semibold text-slate-800 text-xs">
                        {item.currency || 'IDR'} {Number(item.transaction_amount || 0).toLocaleString('id-ID')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                        <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            item.transaction_status,
                            item.transaction_message
                        )}`}
                        >
                        {item.transaction_message || item.transaction_status || 'UNKNOWN'}
                        </span>
                    </td>

                    {/* Waktu */}
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {item.transaction_date || item.created_at
                        ? new Date(item.transaction_date || item.created_at).toLocaleString('id-ID')
                        : '-'}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 text-center">
                        <button
                        type="button"
                        onClick={() => setSelectedLog(item)}
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

          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="text-xs text-slate-500">
              Halaman <span className="font-semibold text-slate-800">{pagination.page}</span> dari{' '}
              <span className="font-semibold text-slate-800">{pagination.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &laquo; Prev
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Callback Payload */}
      <CallbackPayloadModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        logData={selectedLog}
      />
    </div>
  );
};