import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = fetch(`${siteConfig.url}/fonts/inter.woff2`).then((res) =>
  res.arrayBuffer()
);

export default async function OpengraphImage() {
  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: "#09090b",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {"</>"}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#fafafa",
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 20,
          }}
        >
          {siteConfig.tagline}
        </div>

        <div
          style={{
            fontSize: 34,
            color: "#a1a1aa",
            lineHeight: 1.4,
            maxWidth: 800,
          }}
        >
          {siteConfig.subTagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "Inter",
          data: fontData,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}