import { useState, useEffect } from 'react';
import { paymentChannelService } from '../services/api';
import { RefreshCw } from 'lucide-react';
import { ChannelFormModal } from '../components/modals/ChannelFormModal';

export const ChannelPage = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const fetchChannels = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await paymentChannelService.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);

      const sorted = [...list].sort((a, b) => Number(a.id) - Number(b.id));
      setChannels(sorted);
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

  const handleOpenModal = (channel = null) => {
    setSelectedChannel(channel);
    setIsModalOpen(true);
  };

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
            + Tambah Channel
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
          Memuat data channel pembayaran...
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Kode Channel</th>
                <th className="px-4 py-3 font-semibold">Nama Channel / Layanan</th>
                <th className="px-4 py-3 font-semibold">Mitra / Biller</th>
                <th className="px-4 py-3 font-semibold">Admin Fee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    Belum ada data payment channel.
                  </td>
                </tr>
              ) : (
                channels.map((item) => {
                  const isActive = item.flag === 1 || item.flag === '1';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        {item.id}
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {item.channel_code || '-'}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{item.service_name || '-'}</p>
                        <p className="text-xs text-slate-400 font-mono">{item.method || item.company_name || '-'}</p>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-50 text-blue-700">
                          {item.mitra_code || 'ALL MITRA'}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.biller || '-'}</p>
                      </td>

                      <td className="px-4 py-3 font-mono text-sm text-slate-700">
                        {item.currency || 'IDR'} {Number(item.admin_fee || 0).toLocaleString('id-ID')}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center justify-center w-16">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            onClick={() => handleToggleStatus(item)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-none ${
                              isActive ? 'bg-[#4cd964]' : 'bg-[#ff3b30]'
                            }`}
                            title={isActive ? 'Status Aktif (Klik untuk matikan)' : 'Status Non-Aktif (Klik untuk aktifkan)'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                                isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <span
                            className={`text-[10px] font-bold tracking-tight text-center mt-1 w-full truncate ${
                              isActive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isActive ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </div>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah / Edit Channel */}
      <ChannelFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        channel={selectedChannel}
        onSuccess={fetchChannels}
      />
    </div>
  );
};