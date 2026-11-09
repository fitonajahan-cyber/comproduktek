// Warna kotak per box_color, dipetakan ke palet resmi project ini
// (navy/gold/blue-600) - bukan warna Verixa, supaya konsisten dengan
// halaman lain (Navbar, tombol, dst yang sudah pakai navy & blue-600).
export const BOX_COLORS = {
  merah: { bg: "bg-red-50", text: "text-red-800", border: "border-red-300" },
  oranye: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  }, // Fallback
  teal: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }, // Semua staf jadi biru
};

// Warna cincin foto berdasarkan jabatan (dipakai bareng oleh bagan desktop
// dan jendela detail, supaya warnanya selalu konsisten di kedua tempat).
export function getHaloRing(position) {
  const pos = (position || "").toUpperCase();
  if (pos.includes("DANSATLAK")) return "ring-red-600";
  if (pos.includes("DANTIM") || pos.includes("DANUNIT")) return "ring-amber-400";
  return "ring-blue-600";
}

// Pemetaan warna standar karakter DISC (D=merah, I=kuning, S=hijau, C=biru).
export const DISC_COLORS = {
  D: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-300", chip: "bg-red-600 text-white" },
  I: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-300", chip: "bg-amber-500 text-white" },
  S: { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-700 dark:text-green-300", chip: "bg-green-600 text-white" },
  C: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-300", chip: "bg-blue-600 text-white" },
};

// Menggabungkan disc_kode ("DC") dan disc_label ("Dominasi,Ketelitian") milik
// satu personel menjadi array pasangan {letter, label, ...warna} yang siap
// dirender. Mengembalikan array kosong kalau datanya belum diisi admin.
export function parseDiscPairs(discKode, discLabel) {
  if (!discKode) return [];
  const letters = discKode.toUpperCase().split("").filter((ch) => /[A-Z]/.test(ch));
  const labels = (discLabel || "").split(",").map((s) => s.trim());
  return letters.map((letter, i) => ({
    letter,
    label: labels[i] || "",
    ...(DISC_COLORS[letter] || DISC_COLORS.C),
  }));
}

// Mengubah daftar datar (flat, dengan parent_id) menjadi struktur pohon (tree)
// dengan properti `children` di tiap node. Dipakai bersama oleh versi desktop
// (tree bergaris) maupun versi mobile (list bertingkat).
export function buildTree(items) {
  const map = new Map();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));

  const roots = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
