// Decorative gold QR mark with a scanning line, used wherever QR login is explained.
export function QrGlyph({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden className="shrink-0">
      <g fill="none" stroke="#e6c36a" strokeWidth="2">
        <rect x="3" y="3" width="12" height="12" rx="1.5" />
        <rect x="29" y="3" width="12" height="12" rx="1.5" />
        <rect x="3" y="29" width="12" height="12" rx="1.5" />
      </g>
      <g fill="#e6c36a">
        <rect x="7" y="7" width="4" height="4" /><rect x="33" y="7" width="4" height="4" /><rect x="7" y="33" width="4" height="4" />
        <rect x="20" y="4" width="4" height="4" /><rect x="20" y="12" width="4" height="4" /><rect x="20" y="20" width="4" height="4" />
        <rect x="28" y="20" width="4" height="4" /><rect x="36" y="20" width="4" height="4" /><rect x="4" y="20" width="4" height="4" />
        <rect x="12" y="20" width="4" height="4" /><rect x="28" y="28" width="4" height="4" /><rect x="36" y="36" width="4" height="4" />
        <rect x="20" y="32" width="4" height="4" /><rect x="28" y="36" width="4" height="4" /><rect x="36" y="28" width="4" height="4" />
      </g>
      <rect x="1" y="0" width="42" height="2" fill="#fff6dc" opacity=".85" className="qr-scan" />
    </svg>
  );
}
