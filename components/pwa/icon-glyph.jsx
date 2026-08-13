/**
 * App icon — the D-monogram mark on a rounded, filled tile, rendered via
 * `next/og`'s ImageResponse (satori) for every icon size the manifest and
 * `<head>` metadata need. `maskable` shrinks the mark so an OS-imposed
 * circular/rounded mask (Android adaptive icons) doesn't clip it.
 */
export function AppIconGlyph({ size, maskable = false }) {
  const markSize = Math.round(size * (maskable ? 0.5 : 0.72));
  const strokeWidth = size <= 40 ? 4.5 : size <= 200 ? 4 : 3.5;
  const tickWidth = strokeWidth * 0.85;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#18181b",
      }}
    >
      <svg width={markSize} height={markSize} viewBox="0 0 56 56">
        <path
          d="M16,46 V10 H26 Q40,10 40,28 Q40,46 26,46 Z"
          fill="none"
          stroke="#fafafa"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22,19 H30 M22,28 H35 M22,37 H30"
          fill="none"
          stroke="#fafafa"
          strokeWidth={tickWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
