import { motion } from 'framer-motion';

/**
 * Donut chart ringan tanpa dependency chart eksternal.
 * segments: [{ label, value, color }] — color harus salah satu token
 * palette dashboard (dashNavy/dashAccent/dashSky/dashMint).
 */
const RADIUS = 60;
const STROKE = 20;
const CIRC = 2 * Math.PI * RADIUS;

export default function DonutChart({ segments, total, centerLabel = 'Anggota' }) {
  if (!total) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-dashMint/60 flex items-center justify-center mb-3">
          <span className="text-dashNavy/40 text-xs font-semibold">0</span>
        </div>
        <p className="text-sm text-dashNavy/60">Belum ada data anggota.</p>
        <p className="text-xs text-dashNavy/40 mt-0.5">Tambahkan lewat menu Struktur Organisasi.</p>
      </div>
    );
  }

  let cumulative = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg viewBox="0 0 140 140" className="w-[150px] h-[150px] -rotate-90">
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#F1F4F9" strokeWidth={STROKE} />
          {segments.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * CIRC;
            const offset = -(cumulative / total) * CIRC;
            cumulative += s.value;
            return (
              <motion.circle
                key={s.label}
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${CIRC - dash}`}
                strokeDashoffset={offset}
                strokeLinecap={segments.length > 1 ? 'butt' : 'round'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-dashNavy">{total}</span>
          <span className="text-xs text-dashNavy/50">{centerLabel}</span>
        </div>
      </div>

      <ul className="flex-1 w-full space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-dashNavy/80">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
            <span className="font-semibold text-dashNavy">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
