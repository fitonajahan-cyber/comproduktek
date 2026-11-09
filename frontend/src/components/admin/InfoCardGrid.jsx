export default function InfoCardGrid({ cards, cols = 4 }) {
  const colsClass =
    cols === 6
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
      : "grid sm:grid-cols-2 lg:grid-cols-4 gap-4";
  return (
    <div className={colsClass}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-dashCard"
        >
          <p className="text-xs text-dashNavy/50">{card.label}</p>
          <p className="text-2xl font-semibold text-dashNavy mt-1">
            {card.loading ? "..." : card.value}
          </p>
          {card.subtitle && (
            <p className="text-xs text-dashNavy/40 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
