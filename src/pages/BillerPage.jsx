import { useState, useEffect, useCallback } from 'react';
import { billerService } from '../services/api';
import { RefreshCw } from 'lucide-react';
import { BillerFormModal } from '../components/modals/BillerFormModal';

export const BillerPage = () => {
  const [billers, setBillers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const sortByIdAsc = (dataArray) => {
    return [...dataArray].sort((a, b) => Number(a.id) - Number(b.id));
  };

  const fetchBillers = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await billerService.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setBillers(sortByIdAsc(list));
    } catch (err) {
      console.error('Gagal mengambil data biller:', err);
      setErrorMsg(err.message || 'Gagal memuat data biller dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillers();
  }, [fetchBillers]);

  const formatMaskedKey = (keyString) => {
    if (!keyString) return '****';
    if (keyString.includes('*')) return keyString;
    if (keyString.length <= 8) return '****' + keyString.slice(-4);
    return keyString.slice(0, 4) + '****' + keyString.slice(-4);
  };

  const handleOpenModal = (biller = null) => {
    setSelectedBiller(biller);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Config Biller</h2>
          <p className="text-sm text-slate-500">Kelola integrasi endpoint mitra biller</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchBillers}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            + Tambah Biller
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
          Memuat data biller dari API...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Nama Biller</th>
                <th className="px-4 py-3 font-semibold">Tipe</th>
                <th className="px-4 py-3 font-semibold">Endpoint</th>
                <th className="px-4 py-3 font-semibold">Public Key</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    Belum ada data biller dari server.
                  </td>
                </tr>
              ) : (
                billers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      #{item.id}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                    
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <code
                        className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 truncate max-w-xs inline-block font-mono"
                        title={item.endpoint}
                      >
                        {item.endpoint}
                      </code>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {formatMaskedKey(item.public_key)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.flag === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.flag === 1 ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah / Edit Biller */}
      <BillerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        biller={selectedBiller}
        onSuccess={fetchBillers}
      />
    </div>
  );
};