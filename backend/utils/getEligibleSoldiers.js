const { Soldier } = require("../models");

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

const isEligibleRank = (rank) => {
  const norm = normalizeRank(rank);
  if (!norm) return false;
  return eligibleRankPrefixes.some(
    (prefix) => norm === prefix || norm.startsWith(`${prefix} `),
  );
};

const getEligibleSoldiers = () =>
  Soldier.findAll({
    where: { status: "aktif" },
    order: [["id", "ASC"]],
  }).then((soldiers) =>
    soldiers.filter((soldier) => isEligibleRank(soldier.pangkat)),
  );

module.exports = {
  eligibleRanks: eligibleRankPrefixes,
  normalizeRank,
  isEligibleRank,
  getEligibleSoldiers,
};
