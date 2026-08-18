import { useState, useEffect, useCallback } from 'react';
import { transactionService, paymentChannelService } from '../services/api';

export const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedTx, setSelectedTx] = useState(null);;

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    channel: '',
    page: 1,
    limit: 10,
  });

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await paymentChannelService.getAll();
        const data = res.data || res;
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Gagal memuat opsi channel:', err);
      }
    };
    fetchChannels();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
      );

      const res = await transactionService.getAll(cleanParams);
      
      const list = Array.isArray(res) ? res : (res.data || res.items || []);
      setTransactions(list);

      const totalRecords = res.total || res.total_records || res.count;
      const calculatedPages = res.total_pages 
        || (totalRecords ? Math.ceil(totalRecords / filters.limit) : 1);

      setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
    } catch (err) {
      console.error('Gagal mengambil data transaksi:', err);
      setErrorMsg(err.message || 'Gagal memuat riwayat transaksi.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleApplyDateFilter = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleResetFilter = () => {
    setFilters({
      date_from: '',
      date_to: '',
      status: '',
      channel: '',
      page: 1,
      limit: 10,
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'unpaid':
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Transaksi</h2>
          <p className="text-sm text-slate-500">Pantau seluruh arus pembayaran & status transaksi</p>
        </div>
        <button
          type="button"
          onClick={fetchTransactions}
          className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleApplyDateFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
            <label className="text-xs font-medium text-slate-600 block mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="paid">Paid (Lunas)</option>
              <option value="unpaid">Unpaid (Belum Bayar)</option>
              <option value="failed">Failed (Gagal)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Payment Channel</label>
            <select
              name="channel"
              value={filters.channel}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Channel</option>
              {channels.map((ch) => (
                <option key={ch.id || ch.code} value={ch.code}>
                  {ch.name} ({ch.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cari
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
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
          Memuat riwayat transaksi...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">ID Transaksi</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Channel</th>
                <th className="px-4 py-3 font-semibold">Nominal</th>
                <th className="px-4 py-3 font-semibold">Fee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    Tidak ada riwayat transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id || tx.transaction_id} className="hover:bg-slate-50 transition-colors">
                    {/* 1. ID Transaksi */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {tx.transaction_id || tx.id}
                    </td>

                    {/* 2. Tanggal */}
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {tx.transaction_date || '-'}
                    </td>

                    {/* 3. Customer */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-xs">{tx.customer_name || '-'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{tx.customer_phone || tx.client || '-'}</p>
                    </td>

                    {/* 4. Channel */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {tx.channel_code || tx.channel_id || '-'}
                      </span>
                    </td>

                    {/* 5. Nominal Pokok */}
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      Rp {Number(tx.transaction_amount || 0).toLocaleString('id-ID')}
                    </td>

                    {/* 6. Fee */}
                    <td className="px-4 py-3 text-xs text-slate-500">
                      Rp {Number(tx.transaction_fee || 0).toLocaleString('id-ID')}
                    </td>

                    {/* 7. Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadge(
                          tx.transaction_status
                        )}`}
                      >
                        {tx.transaction_status || 'UNPAID'}
                      </span>
                    </td>

                    {/* 8. Aksi */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="px-3 py-1 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION BAR */}
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="text-xs text-slate-500">
              Halaman <span className="font-semibold text-slate-800">{filters.page}</span> dari{' '}
              <span className="font-semibold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &laquo; Prev
              </button>
              <button
                type="button"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Detail Transaksi</h3>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">ID / Nomor Referensi</span>
                <span className="font-mono font-bold text-slate-800">{selectedTx.reference_no || selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Transaksi</span>
                <span className="text-slate-800">{new Date(selectedTx.created_at).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Biller / Partner</span>
                <span className="font-semibold text-slate-800">{selectedTx.biller_name || 'DOKU'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Payment Channel</span>
                <span className="font-mono text-slate-800">{selectedTx.channel_code || selectedTx.channel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Nominal</span>
                <span className="font-bold text-blue-600 text-base">
                  Rp {Number(selectedTx.amount || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getStatusBadge(selectedTx.status)}`}>
                  {selectedTx.status}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};