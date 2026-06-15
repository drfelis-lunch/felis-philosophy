// 고양이 발자국 (공감 버튼용)
export function Paw({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6" cy="11" rx="2" ry="2.6" />
      <ellipse cx="11" cy="8" rx="2" ry="2.8" />
      <ellipse cx="16.5" cy="9" rx="2" ry="2.6" />
      <ellipse cx="19.5" cy="13.5" rx="1.7" ry="2.2" />
      <path d="M12.5 13c-2.2 0-4 1.5-4.6 3.4-.4 1.3.6 2.6 2 2.6.9 0 1.7-.4 2.6-.4s1.7.4 2.6.4c1.4 0 2.4-1.3 2-2.6-.6-1.9-2.4-3.4-4.6-3.4z" />
    </svg>
  );
}

// 고양이 얼굴 (익명 아바타용)
export function CatFace() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5l3 4M20 5l-3 4" />
      <path d="M5 9c0-1 1-1.5 2-1.5h10c1 0 2 .5 2 1.5 1 2 1 5 0 7-1.2 2.5-4 4-7 4s-5.8-1.5-7-4c-1-2-1-5 0-7z" />
      <circle cx="9.2" cy="13" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="13" r="0.6" fill="currentColor" stroke="none" />
      <path d="M12 15v1M10.8 16.5c.4.4.8.4 1.2.4s.8 0 1.2-.4" />
    </svg>
  );
}

export function Icon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    arrow: <path d="M9 18l6-6-6-6" />,
    back: <path d="M15 18l-6-6 6-6" />,
    message: <path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.4 8.4 0 01-3.8-.8L3 21l1.9-5.2A8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z" />,
    edit: <><path d="M11 4H4v16h16v-7" /><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></>,
    sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
    moon: <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    eyeoff: <><path d="M9.9 4.2A9.5 9.5 0 0112 4c6.5 0 10 8 10 8a16 16 0 01-3 3.7M6 6.3A16 16 0 002 12s3.5 7 10 7a9.5 9.5 0 004-.9M3 3l18 18" /></>,
    book: <><path d="M4 19V5a2 2 0 012-2h13v17H6a2 2 0 00-2 2zM6 17h13" /></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// 익명 라벨별 색상 (6종 순환)
export const CAT_COLORS = [
  { bg: "#3a2e26", fg: "#ff9d6e" },
  { bg: "#2a3530", fg: "#6fd3aa" },
  { bg: "#2e2f3a", fg: "#9aa0ee" },
  { bg: "#3a2e36", fg: "#e892b6" },
  { bg: "#36332a", fg: "#ddc46a" },
  { bg: "#2a3338", fg: "#7fc4dd" },
];
export function catColor(seq) {
  return CAT_COLORS[(seq - 1) % CAT_COLORS.length];
}
