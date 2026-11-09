export default function OrgNodeCard({ node, onEdit, onEmpty, childrenNodes }) {
  return (
    <div className={childrenNodes ? "mb-3" : ""}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-dashAccent/40 transition">
        <div className="flex items-center gap-4 mb-3 sm:mb-0">
          {node.photo ? (
            <img
              src={node.photo}
              alt={node.name}
              loading="lazy"
              className="w-12 h-12 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-dashNavy/40 text-sm font-semibold">
              ?
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-dashNavy uppercase">
              {node.position}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {node.name ? (
                node.name
              ) : (
                <span className="italic text-gray-400">Belum ada nama</span>
              )}
              {node.rank && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
                  {node.rank}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(node)}
            className="bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white rounded-md px-4 py-2 text-sm font-semibold transition"
          >
            Edit Personel
          </button>
          <button
            onClick={() => onEmpty(node)}
            title="Kosongkan Jabatan (Orang Keluar)"
            className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-md px-4 py-2 text-sm font-semibold transition"
          >
            Kosongkan
          </button>
        </div>
      </div>

      {childrenNodes && childrenNodes.length > 0 && (
        <div className="pl-6 md:pl-10 mt-3 border-l-2 border-dashed border-gray-200 space-y-3">
          {childrenNodes}
        </div>
      )}
    </div>
  );
}
