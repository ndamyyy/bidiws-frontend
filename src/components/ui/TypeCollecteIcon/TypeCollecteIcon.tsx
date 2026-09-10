// ============================================================
// BIDIWS — TypeCollecteIcon
// Fichier : src/components/ui/TypeCollecteIcon/TypeCollecteIcon.tsx
// Icône + couleur par type de collecte, mappées en dur par `code`
// (OM/TRI/VERRE/ENCOMBRANTS/DECHETS_VERTS/BIODECHETS) — volontairement
// pas basé sur TypeCollecte.couleur/icone (backend), jamais confirmé
// peuplé de façon fiable.
// ============================================================

import type { FC } from "react";

interface IconProps {
  color: string;
}

const IconOm: FC<IconProps> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconTri: FC<IconProps> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);

const IconVerre: FC<IconProps> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="2" x2="15" y2="2"/>
    <path d="M9 2v5.5L6 12v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8l-3-4.5V2"/>
  </svg>
);

const IconEncombrants: FC<IconProps> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/>
    <path d="M2 14h20v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
    <line x1="4" y1="10" x2="4" y2="7"/>
    <line x1="20" y1="10" x2="20" y2="7"/>
  </svg>
);

const IconDechetsVerts: FC<IconProps> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13c0-7 7-11 15-12 1 8-3 15-8 19z"/>
    <path d="M4 13c3 0 6 1 8 3"/>
  </svg>
);

const IconBiodechets: FC<IconProps> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20v-6"/>
    <path d="M12 14c-4 0-7-3-7-7 4 0 7 2 7 7z"/>
    <path d="M12 14c4 0 7-4 7-8-4 0-7 3-7 8z"/>
  </svg>
);

interface TypeCollecteMeta {
  color: string;
  Icon : FC<IconProps>;
}

const TYPE_COLLECTE_META: Record<string, TypeCollecteMeta> = {
  OM:            { color: "#4caf50", Icon: IconOm },
  TRI:           { color: "#2196f3", Icon: IconTri },
  VERRE:         { color: "#f59e0b", Icon: IconVerre },
  ENCOMBRANTS:   { color: "#9c27b0", Icon: IconEncombrants },
  DECHETS_VERTS: { color: "#2e7d32", Icon: IconDechetsVerts },
  BIODECHETS:    { color: "#795548", Icon: IconBiodechets },
};

const FALLBACK_META: TypeCollecteMeta = { color: "#6b84a3", Icon: IconOm };

export const TypeCollecteIcon: FC<{ code?: string; size?: number; className?: string }> = ({
  code,
  size = 20,
  className,
}) => {
  const { color, Icon } = (code ? TYPE_COLLECTE_META[code] : undefined) ?? FALLBACK_META;

  return (
    <span
      className={className}
      style={{ display: "inline-flex", width: size, height: size, flexShrink: 0 }}
    >
      <Icon color={color} />
    </span>
  );
};
