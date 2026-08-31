import { useState, useEffect, useCallback } from 'react';
import { whitelistService } from '../services/api';
import { Plus, Search, Trash2, Edit2, RefreshCw, Globe } from 'lucide-react';
import { WhitelistFormModal } from '../components/modals/WhitelistFormModal';

export const WhitelistPage = () => {
  const [ips, setIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState(null);

  const fetchWhitelist = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await whitelistService.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      const sortedList = [...list].sort((a, b) => Number(a.id) - Number(b.id));
      setIps(sortedList);
    } catch (err) {
      console.error('Gagal mengambil data whitelist IP:', err);
      setErrorMsg(err.message || 'Gagal memuat data whitelist IP.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWhitelist();
  }, [fetchWhitelist]);

  const filteredIps = ips.filter((item) => {
    const ip = (item.ip_address || item.ip || '').toLowerCase();
    const serviceName = (item.service_name || item.client || item.mitra_code || '').toLowerCase();
    const q = search.toLowerCase();
    return ip.includes(q) || serviceName.includes(q);
  });

  const handleOpenModal = (item = null) => {
    setSelectedIp(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    const ipDisplay = item.ip_address || item.ip;
    const nameDisplay = item.service_name || item.client || 'Layanan';
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus IP ${ipDisplay} (${nameDisplay})?`
    );
    if (!confirmDelete) return;

    try {
      await whitelistService.delete(item.id);
      alert('Whitelist IP berhasil dihapus.');
      setIps((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert(err.message || 'Gagal menghapus Whitelist IP.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Whitelist IP Address</h1>
          <p className="text-sm text-slate-500">
            Kelola daftar IP yang diizinkan mengakses API Payment Gateway
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchWhitelist}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah IP
          </button>
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari IP Address atau Service Name..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tabel Data Whitelist */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
          Memuat daftar IP whitelist...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">IP Address</th>
                <th className="px-4 py-3 font-semibold">Service Name</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIps.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    Tidak ada IP whitelist ditemukan.
                  </td>
                </tr>
              ) : (
                filteredIps.map((item) => {
                  const isActive = item.flag === 1 || item.flag === '1';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">#{item.id}</td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded font-mono font-bold text-slate-800 text-xs">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          {item.ip_address || item.ip}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.service_name || item.client || '-'}
                      </td>

                      {/* Status Terpusat (Center) */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-18.75 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 border border-red-200 bg-red-50 rounded text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah / Edit Whitelist */}
      <WhitelistFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ipItem={selectedIp}
        onSuccess={fetchWhitelist}
      />
    </div>
  );
};