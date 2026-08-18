import { useState, useEffect } from 'react';
import { paymentChannelService } from '../services/api';

export const ChannelPage = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. GET /payment-channels (Fetch Data)
  const fetchChannels = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await paymentChannelService.getAll();
      const data = res.data || res;
      setChannels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal memuat payment channel:', err);
      setErrorMsg(err.message || 'Gagal mengambil data payment channel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // 2. Open Modal (Tambah vs Edit)
  const handleOpenModal = (channel = null) => {
    setCurrentChannel(channel);
    setIsModalOpen(true);
  };

  // 3. POST & PUT /payment-channels (Simpan Form)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const payload = {
      code: formData.get('code'),
      name: formData.get('name'),
      type: formData.get('type'),
      fee: Number(formData.get('fee')),
      is_active: formData.get('is_active') === 'true',
    };

    try {
      if (currentChannel) {
        // UPDATE (PUT /payment-channels/:id)
        await paymentChannelService.update(currentChannel.id, payload);
      } else {
        // CREATE (POST /payment-channels)
        await paymentChannelService.create(payload);
      }
      setIsModalOpen(false);
      fetchChannels(); // Refresh data
    } catch (err) {
      alert(err.message || 'Gagal menyimpan payment channel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Toggle Status Aktif / Nonaktifkan Channel (Aksi Cepat)
  const handleToggleStatus = async (channel) => {
    const currentActive = channel.flag === 1 || channel.flag === '1';
    const nextFlag = currentActive ? 0 : 1;
    const confirmMsg = `Apakah Anda yakin ingin ${
      nextFlag === 1 ? 'mengaktifkan' : 'menonaktifkan'
    } channel ${channel.service_name || channel.channel_code}?`;

    if (window.confirm(confirmMsg)) {
      try {
        await paymentChannelService.update(channel.id, {
          ...channel,
          flag: nextFlag,
        });
        // Update state lokal
        setChannels((prev) =>
          prev.map((item) =>
            item.id === channel.id ? { ...item, flag: nextFlag } : item
          )
        );
      } catch (err) {
        alert(err.message || 'Gagal mengubah status channel.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Payment Channel</h2>
          <p className="text-sm text-slate-500">Kelola opsi dan metode pembayaran sistem</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchChannels}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            + Tambah Channel
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tabel Data Payment Channel */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
          Memuat data channel pembayaran...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode Channel</th>
                <th className="px-4 py-3 font-semibold">Nama Channel / Layanan</th>
                <th className="px-4 py-3 font-semibold">Mitra / Metode</th>
                <th className="px-4 py-3 font-semibold">Admin Fee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                    Belum ada data payment channel.
                  </td>
                </tr>
              ) : (
                channels.map((item) => {
                  const isActive = item.flag === 1 || item.flag === '1';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* 1. Kode Channel */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {item.channel_code || item.channel_id || '-'}
                      </td>

                      {/* 2. Nama Channel / Layanan */}
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.service_name || item.company_name || '-'}
                      </td>

                      {/* 3. Mitra & Metode */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {item.method || item.mitra_code || 'MANUAL'}
                        </span>
                      </td>

                      {/* 4. Admin Fee & Mata Uang */}
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {item.currency || 'IDR'} {Number(item.admin_fee || 0).toLocaleString('id-ID')}
                      </td>

                      {/* 5. Status (flag: 1 = Aktif, 0 = Non-Aktif) */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>

                      {/* 6. Aksi */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`px-3 py-1 border rounded text-xs font-medium ${
                              isActive
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {isActive ? 'Nonaktifkan' : 'Aktifkan'}
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {currentChannel ? 'Edit Payment Channel' : 'Tambah Channel Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Kode Channel</label>
                <input
                  name="code"
                  defaultValue={currentChannel?.code || ''}
                  required
                  placeholder="Contoh: QRIS_DOKU, VA_BCA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Nama Channel</label>
                <input
                  name="name"
                  defaultValue={currentChannel?.name || ''}
                  required
                  placeholder="Contoh: QRIS DOKU, Virtual Account BCA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Tipe</label>
                  <select
                    name="type"
                    defaultValue={currentChannel?.type || 'VA'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="VA">Virtual Account</option>
                    <option value="QRIS">QRIS</option>
                    <option value="EWALLET">E-Wallet</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Biaya Fee (Rp)</label>
                  <input
                    type="number"
                    name="fee"
                    defaultValue={currentChannel?.fee ?? 0}
                    required
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Status</label>
                <select
                  name="is_active"
                  defaultValue={currentChannel ? String(currentChannel.is_active) : 'true'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Non-Aktif</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};