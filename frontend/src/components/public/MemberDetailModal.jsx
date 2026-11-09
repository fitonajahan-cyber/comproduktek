import { X, UserRound } from "lucide-react";
import { getHaloRing, parseDiscPairs } from "./orgTreeUtils";

function DetailSection({ title, body }) {
  if (!body) return null;
  return (
    <div className="text-center sm:text-left">
      <p className="text-xs font-bold tracking-wide text-gold uppercase mb-1">
        {title}
      </p>
      <p className="text-sm text-inktext/80 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {body}
      </p>
    </div>
  );
}

export default function MemberDetailModal({ member, onClose }) {
  if (!member) return null;

  const discPairs = parseDiscPairs(member.disc_kode, member.disc_label);
  const halo = getHaloRing(member.position);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-darkpanel border border-gray-100 dark:border-darkborder rounded-3xl shadow-xl w-full max-w-md p-6 relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Foto besar di tengah paling atas */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-gray-50 dark:bg-gray-800/50 ring-[3px] ring-offset-4 ring-offset-white dark:ring-offset-darkpanel shadow-lg ${halo}`}
          >
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover object-[center_12%]"
              />
            ) : (
              <UserRound className="w-14 h-14 text-gray-300" />
            )}
          </div>

          <p className="text-base font-bold text-navy dark:text-white mt-4 px-2">
            {member.rank ? `${member.rank} ` : ""}
            {member.name || "-"}
          </p>
          <p className="text-sm font-medium text-gold mt-1 px-2">
            {member.position}
          </p>
        </div>

        {/* Karakter DISC, hanya tampil jika sudah diisi admin */}
        {discPairs.length > 0 && (
          <div className="mt-5 bg-panel dark:bg-[#16273D] rounded-2xl p-4">
            <p className="text-[11px] font-bold tracking-widest text-inktext/50 dark:text-gray-400 uppercase text-center mb-3">
              Karakter
            </p>
            <div className="flex items-center justify-center gap-4">
              {discPairs.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${d.chip}`}
                  >
                    {d.letter}
                  </span>
                  {d.label && (
                    <span className={`text-xs font-semibold ${d.text}`}>
                      {d.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail teks, masing-masing hanya tampil jika sudah diisi admin */}
        <div className="mt-5 space-y-4">
          <DetailSection title="Kekuatan Utama" body={member.kekuatan_utama} />
          <DetailSection
            title="Rekomendasi Pengembangan Diri"
            body={member.rekomendasi_pengembangan}
          />
          <DetailSection
            title="Cara Berkomunikasi"
            body={member.cara_komunikasi}
          />
        </div>

        {discPairs.length === 0 &&
          !member.kekuatan_utama &&
          !member.rekomendasi_pengembangan &&
          !member.cara_komunikasi && (
            <p className="text-center text-sm text-inktext/40 dark:text-gray-500 mt-6">
              Detail karakter untuk personel ini belum tersedia.
            </p>
          )}
      </div>
    </div>
  );
}
