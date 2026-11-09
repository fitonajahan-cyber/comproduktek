import { useState } from "react";
import { UserRound, ChevronDown, ChevronRight } from "lucide-react";
import { BOX_COLORS } from "./orgTreeUtils";

function PersonRow({ node, depth, onSelect }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children?.length > 0;
  const c = BOX_COLORS[node.box_color] || BOX_COLORS.teal;

  // LOGIKA PINTAR: Dorong TRUNK (Batang Dantim) ke urutan paling bawah
  const sortedChildren = hasChildren
    ? [...node.children].sort((a, b) => {
        if (a.position === "_TRUNK_" && b.position !== "_TRUNK_") return 1;
        if (a.position !== "_TRUNK_" && b.position === "_TRUNK_") return -1;
        return 0;
      })
    : [];

  // Lewati node spacer
  if (
    node.position === "_TRUNK_" ||
    node.position === "_EMPTY_" ||
    node.position === "_SPACER_BATIMIN_" ||
    node.position === "_SPACER_PENATA_"
  ) {
    return (
      <>
        {sortedChildren.map((child) => (
          <PersonRow key={child.id} node={child} depth={depth} onSelect={onSelect} />
        ))}
      </>
    );
  }

  return (
    <div
      style={{ marginLeft: depth > 0 ? 16 : 0 }}
      className={
        depth > 0 ? "border-l border-gray-200 dark:border-gray-700 pl-3" : ""
      }
    >
      <div
        className={`w-full flex items-center gap-2 rounded-xl border ${c.bg} ${c.text} ${c.border} px-3 py-2 mb-2`}
      >
        {/* Area utama: klik untuk membuka jendela detail personel */}
        <button
          onClick={() => onSelect?.(node)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {node.photo ? (
            <img
              src={node.photo}
              alt={node.name}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-white shadow"
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0">
              <UserRound className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{node.position}</p>
            <p className="text-[11px] opacity-80 truncate">
              {node.rank ? `${node.rank}` : ""} {node.name}
            </p>
          </div>
        </button>

        {/* Tombol terpisah: buka/tutup daftar bawahan, tidak membuka jendela detail */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            aria-label={open ? "Tutup daftar bawahan" : "Buka daftar bawahan"}
            className="shrink-0 p-1"
          >
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {hasChildren && open && (
        <div className="mb-2">
          {sortedChildren.map((child) => (
            <PersonRow key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgListMobile({ roots, onSelect }) {
  return (
    <div>
      {roots.map((root) => (
        <PersonRow key={root.id} node={root} depth={0} onSelect={onSelect} />
      ))}
    </div>
  );
}