import { useState } from 'react';
import { whitelistService } from '../../services/api';
import { Shield } from 'lucide-react';

export const WhitelistFormModal = ({ isOpen, onClose, ipItem, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const ipValue = formData.get('ip_address')?.trim();
    const serviceValue = formData.get('service_name')?.trim();
    const flagValue = Number(formData.get('flag') ?? 1);

    const payload = {
      ip_address: ipValue,
      ip: ipValue,
      service_name: serviceValue,
      client: serviceValue,
      flag: flagValue,
    };

    try {
      if (ipItem) {
        await whitelistService.update(ipItem.id, payload);
        alert('Berhasil memperbarui Whitelist IP!');
      } else {
        await whitelistService.create(payload);
        alert('Berhasil menambahkan Whitelist IP baru!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error simpan IP:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Gagal menyimpan data IP: ${serverMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            {ipItem ? 'Edit Whitelist IP' : 'Tambah Whitelist IP'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
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
              defaultValue={ipItem?.ip_address || ipItem?.ip || ''}
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
              defaultValue={ipItem?.service_name || ipItem?.client || ''}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Status</label>
            <select
              name="flag"
              defaultValue={ipItem ? String(ipItem.flag) : '1'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="1">Aktif (Izinkan Akses)</option>
              <option value="0">Nonaktif (Blokir Akses)</option>
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
              {isSubmitting ? 'Menyimpan...' : ipItem ? 'Perbarui IP' : 'Simpan IP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};