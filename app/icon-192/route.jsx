import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/components/pwa/icon-glyph";

export async function GET() {
  return new ImageResponse(<AppIconGlyph size={192} />, { width: 192, height: 192 });
}
