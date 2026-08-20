import { useState, useEffect, useCallback } from 'react';
import { whitelistService } from '../services/api';
import { Shield, Plus, Search, Trash2, Edit2, RefreshCw, Globe } from 'lucide-react';

export const WhitelistPage = () => {
  const [ips, setIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIp, setCurrentIp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Filter Search (hanya memeriksa IP & Nama Service/Mitra)
  const filteredIps = ips.filter((item) => {
    const ip = (item.ip_address || item.ip || '').toLowerCase();
    const serviceName = (item.service_name || item.client || item.mitra_code || '').toLowerCase();
    const q = search.toLowerCase();
    return ip.includes(q) || serviceName.includes(q);
  });

  const handleOpenModal = (item = null) => {
    setCurrentIp(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const ipValue = formData.get('ip_address')?.trim();
    const serviceValue = formData.get('service_name')?.trim();
    const flagValue = Number(formData.get('flag') ?? 1);

    // Kirim field ganda agar cocok dengan skema backend Golang (baik jika memakai tag json `service_name` / `client`)
    const payload = {
      ip_address: ipValue,
      ip: ipValue,
      service_name: serviceValue,
      client: serviceValue,
      flag: flagValue,
    };

    try {
      if (currentIp) {
        await whitelistService.update(currentIp.id, payload);
        alert('Berhasil memperbarui Whitelist IP!');
      } else {
        await whitelistService.create(payload);
        alert('Berhasil menambahkan Whitelist IP baru!');
      }
      setIsModalOpen(false);
      fetchWhitelist();
    } catch (err) {
      console.error('Error simpan IP:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Gagal menyimpan data IP: ${serverMsg}`);
    } finally {
      setIsSubmitting(false);
    }
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
            className="p-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
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
          placeholder="Cari IP Address"
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
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
                <th className="px-4 py-3 font-semibold">Status</th>
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
                filteredIps.map((item) => (
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

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.flag === 1 || item.flag === '1'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.flag === 1 || item.flag === '1' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 border border-red-200 bg-red-50 rounded text-red-600 hover:bg-red-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah / Edit IP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                {currentIp ? 'Edit Whitelist IP' : 'Tambah Whitelist IP'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">IP Address *</label>
                <input
                  type="text"
                  name="ip_address"
                  required
                  placeholder="Contoh: 103.145.22.10 atau 127.0.0.1"
                  defaultValue={currentIp?.ip_address || currentIp?.ip || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Service Name *</label>
                <input
                  type="text"
                  name="service_name"
                  required
                  placeholder="Contoh: KLKJAN25 atau KISEL"
                  defaultValue={currentIp?.service_name || currentIp?.client || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Status</label>
                <select
                  name="flag"
                  defaultValue={currentIp ? String(currentIp.flag) : '1'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="1">Aktif (Izinkan Akses)</option>
                  <option value="0">Nonaktif (Blokir Akses)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : currentIp ? 'Perbarui IP' : 'Simpan IP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};