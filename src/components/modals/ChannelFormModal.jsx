import { useState } from 'react';
import { paymentChannelService } from '../../services/api';

export const ChannelFormModal = ({ isOpen, onClose, channel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);

    const payload = {
      mitra_code: formData.get('mitra_code')?.trim() || '',
      biller: formData.get('biller')?.trim() || '',
      channel_code: formData.get('channel_code')?.trim() || '',
      channel_id: formData.get('channel_id')?.trim() || '',
      service_code: formData.get('service_code')?.trim() || '',
      service_name: formData.get('service_name')?.trim() || '',
      company_name: formData.get('service_name')?.trim() || '',
      method: formData.get('method')?.trim() || 'QRIS',
      currency: 'IDR',
      prefix: formData.get('prefix')?.trim() || '',
      admin_fee: Number(formData.get('admin_fee') || 0),
      expiry: Number(formData.get('expiry') || 60),
      icon: formData.get('icon')?.trim() || '',
      is_snap: false,
      flag: Number(formData.get('flag') ?? 1),
    };

    try {
      if (channel) {
        await paymentChannelService.update(channel.id, payload);
        alert('Channel berhasil diperbarui!');
      } else {
        await paymentChannelService.create(payload);
        alert('Channel baru berhasil ditambahkan!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Gagal simpan channel:', err);
      alert(err.response?.data?.message || err.message || 'Gagal menyimpan channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {channel ? `Edit Payment Channel #${channel.id}` : 'Tambah Channel Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Kode Channel *</label>
              <input
                type="text"
                name="channel_code"
                required
                placeholder="Contoh: QRISKISEL"
                defaultValue={channel?.channel_code || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Kode Mitra *</label>
              <input
                type="text"
                name="mitra_code"
                required
                placeholder="Contoh: KUTOCT24"
                defaultValue={channel?.mitra_code || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Nama Layanan *</label>
              <input
                type="text"
                name="service_name"
                required
                placeholder="Contoh: QRIS"
                defaultValue={channel?.service_name || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Biller *</label>
              <input
                type="text"
                name="biller"
                required
                placeholder="Contoh: TELKOMSEL-PROD"
                defaultValue={channel?.biller || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Metode Pembayaran</label>
              <input
                type="text"
                name="method"
                placeholder="Contoh: QRIS, VA, EWALLET"
                defaultValue={channel?.method || 'QRIS'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Admin Fee (IDR)</label>
              <input
                type="number"
                name="admin_fee"
                min="0"
                placeholder="0"
                defaultValue={channel?.admin_fee || 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Channel ID</label>
              <input
                type="text"
                name="channel_id"
                placeholder="PTKSSQRIS01..."
                defaultValue={channel?.channel_id || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Service Code</label>
              <input
                type="text"
                name="service_code"
                placeholder="Contoh: 1089"
                defaultValue={channel?.service_code || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Status Awal</label>
            <select
              name="flag"
              defaultValue={channel ? String(channel.flag) : '1'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : channel ? 'Perbarui Channel' : 'Simpan Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};