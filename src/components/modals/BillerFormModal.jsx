import { useState } from 'react';
import { billerService } from '../../services/api';

export const BillerFormModal = ({ isOpen, onClose, biller, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const formValues = {
      name: formData.get('name')?.trim(),
      type: formData.get('type'),
      endpoint: formData.get('endpoint')?.trim(),
      endpoint_snap: formData.get('endpoint_snap')?.trim() || '',
      public_key: formData.get('public_key')?.trim(),
      private_key: formData.get('private_key')?.trim() || '',
      secret_key: formData.get('secret_key')?.trim() || '',
      flag: Number(formData.get('flag') ?? 1),
    };

    try {
      if (biller) {
        await billerService.update(biller.id, formValues);
        alert('Berhasil memperbarui data biller!');
      } else {
        await billerService.create(formValues);
        alert('Berhasil menambahkan biller baru!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Gagal menyimpan config biller:', err);
      alert(err.response?.data?.message || err.message || 'Gagal menyimpan config biller.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {biller ? `Edit Biller #${biller.id}` : 'Tambah Biller Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Nama Biller *</label>
              <input
                name="name"
                defaultValue={biller?.name || ''}
                required
                placeholder="Contoh: DOKU"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Tipe *</label>
              <select
                name="type"
                defaultValue={biller?.type || 'dev'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="dev">dev</option>
                <option value="prod">prod</option>
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700">Endpoint URL *</label>
              <input
                type="url"
                name="endpoint"
                defaultValue={biller?.endpoint || ''}
                required
                placeholder="https://api-sandbox.doku.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700">Endpoint SNAP URL</label>
              <input
                type="url"
                name="endpoint_snap"
                defaultValue={biller?.endpoint_snap || ''}
                placeholder="https://api-sandbox.doku.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Public Key *</label>
              <input
                name="public_key"
                defaultValue={biller?.public_key || ''}
                required
                placeholder="Masukkan Public Key"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status (Flag)</label>
              <select
                name="flag"
                defaultValue={biller ? String(biller.flag) : '1'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="1">Aktif (1)</option>
                <option value="0">Non-Aktif (0)</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'Menyimpan...' : biller ? 'Perbarui Biller' : 'Simpan Config'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};