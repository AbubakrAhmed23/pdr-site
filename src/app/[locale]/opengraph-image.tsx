import { ImageResponse } from "next/og";

export const alt = "PDR Danışmanlık — Online Psikolojik Danışmanlık & Rehberlik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #134e4a 0%, #0f766e 60%, #115e59 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, opacity: 0.85, marginBottom: 16 }}>
          PDR Danışmanlık
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
          Online Psikolojik Danışmanlık &amp; Rehberlik
        </div>
        <div style={{ fontSize: 30, opacity: 0.85, marginTop: 28 }}>
          Güvenli · Gizli · Bireye Özel — Online Counseling &amp; Guidance
        </div>
      </div>
    ),
    { ...size },
  );
}
