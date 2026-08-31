import { useState, useEffect, useCallback } from 'react';
import { billerService } from '../services/api';
import { RefreshCw } from 'lucide-react';

export const BillerPage = () => {
  const [billers, setBillers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBiller, setCurrentBiller] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortByIdAsc = (dataArray) => {
    return [...dataArray].sort((a, b) => Number(a.id) - Number(b.id));
  };

  const fetchBillers = useCallback(async (forceFetch = false) => {
    const cachedData = sessionStorage.getItem('billers_cache');
    const cachedTime = sessionStorage.getItem('billers_cache_time');
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (
      !forceFetch &&
      cachedData &&
      cachedTime &&
      Date.now() - Number(cachedTime) < FIVE_MINUTES
    ) {
      const parsedData = JSON.parse(cachedData);
      setBillers(sortByIdAsc(parsedData));
      setLoading(false);
      return;
    }

    try {
      const res = await billerService.getAll();
      const data = res.data || res;
      const resultArr = Array.isArray(data) ? data : [];
      const sortedArr = sortByIdAsc(resultArr);

      setBillers(sortedArr);
      sessionStorage.setItem('billers_cache', JSON.stringify(sortedArr));
      sessionStorage.setItem('billers_cache_time', String(Date.now()));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const formValues = {
      name: formData.get('name'),
      type: formData.get('type'),
      endpoint: formData.get('endpoint'),
      endpoint_snap: formData.get('endpoint_snap'),
      public_key: formData.get('public_key'),
      private_key: formData.get('private_key'),
      secret_key: formData.get('secret_key'),
      flag: Number(formData.get('flag')),
    };

    try {
      if (currentBiller) {
        const res = await billerService.update(currentBiller.id, formValues);
        const updatedItem = res.data || { ...currentBiller, ...formValues };

        setBillers((prev) => {
          const updatedList = prev.map((item) =>
            item.id === currentBiller.id ? { ...item, ...updatedItem } : item
          );
          const sortedList = sortByIdAsc(updatedList);
          sessionStorage.setItem('billers_cache', JSON.stringify(sortedList));
          return sortedList;
        });

        alert('Berhasil memperbarui data biller!');
      } else {
        const res = await billerService.create(formValues);
        const newItem = res.data || { id: Date.now(), ...formValues };

        setBillers((prev) => {
          const updatedList = sortByIdAsc([...prev, newItem]);
          sessionStorage.setItem('billers_cache', JSON.stringify(updatedList));
          return updatedList;
        });

        alert('Berhasil menambahkan biller baru!');
      }

      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan config biller.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMaskedKey = (keyString) => {
    if (!keyString) return '****';
    if (keyString.includes('*')) return keyString;
    if (keyString.length <= 8) return '****' + keyString.slice(-4);
    return keyString.slice(0, 4) + '****' + keyString.slice(-4);
  };

  const handleOpenModal = (biller = null) => {
    setCurrentBiller(biller);
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
            className="p-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
         </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Tambah Biller
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
                <th className="px-4 py-3 font-semibold">Aksi</th>
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
                      {item.id}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                    
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <code
                        className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 truncate max-w-xs inline-block"
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

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-100"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {currentBiller ? `Edit Biller #${currentBiller.id}` : 'Tambah Biller Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Nama Biller</label>
                  <input
                    name="name"
                    defaultValue={currentBiller?.name || ''}
                    required
                    placeholder="Contoh: DOKU"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Tipe</label>
                  <select
                    name="type"
                    defaultValue={currentBiller?.type || 'dev'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="dev">dev</option>
                    <option value="prod">prod</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700">Endpoint URL</label>
                  <input
                    type="url"
                    name="endpoint"
                    defaultValue={currentBiller?.endpoint || ''}
                    required
                    placeholder="https://api-sandbox.doku.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700">Endpoint SNAP URL</label>
                  <input
                    type="url"
                    name="endpoint_snap"
                    defaultValue={currentBiller?.endpoint_snap || ''}
                    placeholder="https://api-sandbox.doku.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Public Key</label>
                  <input
                    name="public_key"
                    defaultValue={currentBiller?.public_key || ''}
                    required
                    placeholder="Masukkan Public Key"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Status (Flag)</label>
                  <select
                    name="flag"
                    defaultValue={currentBiller ? String(currentBiller.flag) : '1'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="1">Aktif (1)</option>
                    <option value="0">Non-Aktif (0)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Config'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};