// Mirror dari backend/utils/getEligibleSoldiers.js
const eligibleRankPrefixes = [
  "letnan satu",
  "lettu",
  "letnan dua",
  "letda",
  "peltu",
  "pelda",
  "serma",
  "serka",
  "sertu",
  "serda",
  "kopka",
  "koptu",
  "kopda",
  "praka",
  "pratu",
  "prada",
];

const normalizeRank = (rank) => {
  if (!rank) return null;
  return rank.trim().toLowerCase().replace(/\s+/g, " ");
};

export const isEligiblePiketRank = (rank) => {
  const norm = normalizeRank(rank);
  if (!norm) return false;
  return eligibleRankPrefixes.some(
    (prefix) => norm === prefix || norm.startsWith(`${prefix} `),
  );
};

export const isEligiblePiket = (user) => {
  if (!user) return false;
  if ((user.status || "aktif") !== "aktif") return false;
  return isEligiblePiketRank(user.pangkat || user.OrgStructure?.rank);
};
