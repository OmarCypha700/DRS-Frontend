import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/components/pwa/icon-glyph";

// Extra padding so an OS-imposed circular/rounded mask doesn't clip the glyph.
export async function GET() {
  return new ImageResponse(<AppIconGlyph size={512} maskable />, { width: 512, height: 512 });
}
