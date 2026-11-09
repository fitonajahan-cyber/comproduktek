import { useState } from 'react';
import api from '../../services/api';
import RevealSection from '../../components/common/RevealSection';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const initial = {
  sender_name: '',
  sender_email: '',
  subject: '',
  message: ''
};

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.sender_name.trim()) e.sender_name = 'Nama wajib diisi.';
    if (!/^\S+@\S+\.\S+$/.test(form.sender_email)) e.sender_email = 'Format email tidak valid.';
    if (!form.subject.trim()) e.subject = 'Subjek / Instansi wajib diisi.';
    if (!form.message.trim()) e.message = 'Pesan wajib diisi.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setStatus(null);
    try {
      await api.post('/messages', form);
      setStatus('success');
      setForm(initial);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-darkbg text-inktext dark:text-gray-300 min-h-screen pb-20 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 -mt-2 py-10 space-y-12">
        {/* Section Header Judul */}
        <RevealSection className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy dark:text-white tracking-tight">
            Hubungi Kami
          </h1>
          <p className="text-inktext/70 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light">
            Sampaikan pertanyaan, koordinasi teknis, atau pengajuan kerjasama dengan Satlak Dukteksi PUSSIBERAD.
          </p>
        </RevealSection>

        {/* Layout Utama (Grid 2 Kolom) */}
        <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-4">

          {/* Kolom Kiri: Informasi Kontak */}
          <div className="lg:col-span-5 space-y-8">

            {/* Item 1: Lokasi */}
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center shrink-0 border border-blue-100/60 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1 pt-0.5">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  ALAMAT MARKAS / KANTOR
                </span>
                <h3 className="text-lg font-bold text-navy dark:text-gray-100 leading-snug">
                  Markas Besar TNI AD
                </h3>
                <p className="text-sm text-inktext/70 dark:text-gray-400 font-light leading-relaxed">
                  Jl. Veteran No.5, RT.3/RW.2, Gambir, Kec. Gambir, Kota Jakarta Pusat, DKI Jakarta 10110
                </p>
              </div>
            </div>

            {/* Item 2: Telepon */}
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center shrink-0 border border-blue-100/60 shadow-sm">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  TELEPON RESMI
                </span>
                <p className="text-lg font-bold text-navy dark:text-gray-100">
                  (021) 12345678
                </p>
              </div>
            </div>

            {/* Item 3: Email */}
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center shrink-0 border border-blue-100/60 shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  EMAIL OFFICIAL
                </span>
                <p className="text-lg font-bold text-navy dark:text-gray-100">
                  info@pussiberad.mil.id
                </p>
              </div>
            </div>

            {/* Card Tambahan Jam Layanan Operasional */}
            <div className="bg-[#f8fafc] dark:bg-darkpanel border border-gray-100 dark:border-darkborder p-6 rounded-3xl shadow-sm space-y-3 mt-6">
              <div className="flex items-center gap-2.5 text-navy dark:text-white font-bold text-sm">
                <Clock className="w-4 h-4 text-navy dark:text-gray-400" />
                <span>Jam Layanan Operasional</span>
              </div>
              <div className="text-xs text-inktext/70 dark:text-gray-400 space-y-1.5 font-light">
                <div className="flex justify-between border-b border-gray-200/60 dark:border-gray-700 pb-1.5">
                  <span>Senin – Kamis</span>
                  <span className="font-semibold text-navy dark:text-gray-200">09.00 – 15.00 WIB</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span>Jumat</span>
                  <span className="font-semibold text-navy dark:text-gray-200">09.00 – 15.30 WIB</span>
                </div>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Card Form Pengiriman Pesan */}
          <div className="lg:col-span-7 bg-white dark:bg-darkpanel border border-gray-100 dark:border-darkborder rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-100 dark:shadow-none">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Form Row 1: Nama & Email (2 Kolom Sejajar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="sender_name" className="block text-sm font-bold text-navy dark:text-gray-200 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    id="sender_name"
                    type="text"
                    placeholder="Contoh: Nama Lengkap Anda"
                    value={form.sender_name}
                    onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
                    className="w-full bg-[#f8fafc] dark:bg-[#112236] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 text-sm font-medium dark:text-gray-200 focus:outline-none focus:border-navy dark:focus:border-blue-500 focus:bg-white dark:focus:bg-darkbg focus:ring-1 focus:ring-navy dark:focus:ring-blue-500 transition-all"
                  />
                  {errors.sender_name && (
                    <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.sender_name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="sender_email" className="block text-sm font-bold text-navy dark:text-gray-200 mb-2">
                    Alamat Email
                  </label>
                  <input
                    id="sender_email"
                    type="email"
                    placeholder="Contoh: nama@domain.com"
                    value={form.sender_email}
                    onChange={(e) => setForm({ ...form, sender_email: e.target.value })}
                    className="w-full bg-[#f8fafc] dark:bg-[#112236] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 text-sm font-medium dark:text-gray-200 focus:outline-none focus:border-navy dark:focus:border-blue-500 focus:bg-white dark:focus:bg-darkbg focus:ring-1 focus:ring-navy dark:focus:ring-blue-500 transition-all"
                  />
                  {errors.sender_email && (
                    <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.sender_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Row 2: Subjek / Instansi (Full Width) */}
              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-navy dark:text-gray-200 mb-2">
                  Subjek
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Tuliskan subjek pesan anda..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-[#f8fafc] dark:bg-[#112236] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 text-sm font-medium dark:text-gray-200 focus:outline-none focus:border-navy dark:focus:border-blue-500 focus:bg-white dark:focus:bg-darkbg focus:ring-1 focus:ring-navy dark:focus:ring-blue-500 transition-all"
                />
                {errors.subject && (
                  <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Form Row 3: Pesan (Full Width) */}
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-navy dark:text-gray-200 mb-2">
                  Pesan / Maksud Kedatangan
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tuliskan pesan atau konsultasi Anda secara detail di sini..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-[#f8fafc] dark:bg-[#112236] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 text-sm font-medium dark:text-gray-200 focus:outline-none focus:border-navy dark:focus:border-blue-500 focus:bg-white dark:focus:bg-darkbg focus:ring-1 focus:ring-navy dark:focus:ring-blue-500 transition-all resize-none"
                />
                {errors.message && (
                  <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-sm py-3.5 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Mengirim Pesan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </button>

              {/* Status Indicator Messages */}
              {status === 'success' && (
                <div role="status" className="flex items-start gap-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-4 rounded-2xl text-xs font-medium animate-fade-in mt-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Pesan Berhasil Terkirim!</p>
                    <p className="mt-0.5 opacity-90">
                      Terima kasih telah menghubungi Satlak Dukteksi PUSSIBERAD. Tim kami akan segera menindaklanjuti pesan Anda.
                    </p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div role="status" className="flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-2xl text-xs font-medium animate-fade-in mt-4">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Gagal Mengirim Pesan</p>
                    <p className="mt-0.5 opacity-90">
                      Terjadi kendala pada sistem jaringan. Silakan coba beberapa saat lagi atau hubungi via email resmi.
                    </p>
                  </div>
                </div>
              )}

            </form>
          </div>

        </RevealSection>

      </div>
    </div>
  );
}