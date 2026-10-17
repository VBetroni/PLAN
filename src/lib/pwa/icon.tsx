import { ImageResponse } from "next/og";

export const ICON_SIZES = [180, 192, 512] as const;
export type IconSize = (typeof ICON_SIZES)[number];

export function isIconSize(value: number): value is IconSize {
  return (ICON_SIZES as readonly number[]).includes(value);
}

// Square, full-bleed icon: iOS applies its own rounded corners.
export function renderIcon(size: IconSize) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
          color: "#ffffff",
          fontSize: size * 0.6,
          fontWeight: 700,
        }}
      >
        R
      </div>
    ),
    { width: size, height: size },
  );
}
