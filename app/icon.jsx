import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/components/pwa/icon-glyph";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<AppIconGlyph size={32} />, { ...size });
}
