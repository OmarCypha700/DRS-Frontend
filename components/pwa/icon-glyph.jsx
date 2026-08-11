/**
 * Placeholder app icon — a simple document glyph on the app's dark neutral
 * primary color, rendered via `next/og`'s ImageResponse (satori). Swap this
 * out for real brand assets later; the manifest/icon routes that consume it
 * won't need to change shape, just what they render.
 */
export function AppIconGlyph({ size, maskable = false }) {
  const scale = maskable ? 0.62 : 1;
  const docWidth = Math.round(size * 0.34 * scale);
  const docHeight = Math.round(size * 0.44 * scale);
  const lineHeight = Math.max(2, Math.round(size * 0.018 * scale));

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
      <div
        style={{
          width: docWidth,
          height: docHeight,
          background: "#ffffff",
          borderRadius: Math.max(1, Math.round(size * 0.02)),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "60%",
            height: lineHeight,
            background: "#a1a1aa",
            borderRadius: lineHeight,
            marginBottom: lineHeight,
          }}
        />
        <div
          style={{
            width: "60%",
            height: lineHeight,
            background: "#a1a1aa",
            borderRadius: lineHeight,
            marginBottom: lineHeight,
          }}
        />
        <div style={{ width: "40%", height: lineHeight, background: "#a1a1aa", borderRadius: lineHeight }} />
      </div>
    </div>
  );
}
