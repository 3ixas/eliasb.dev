import { ImageResponse } from "next/og";

export const alt = "Elias B. — thoughtful software for complex problems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "42px",
        color: "#f0e8d8",
        backgroundColor: "#201c18",
        backgroundImage:
          "radial-gradient(rgba(240, 232, 216, 0.13) 1px, transparent 1px)",
        backgroundSize: "9px 9px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 28px",
          border: "2px solid #f0e8d8",
          borderRadius: "14px",
          boxShadow: "7px 7px 0 #f0e8d8",
          fontFamily: "Arial",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        <span>E/B</span>
        <span style={{ fontSize: 14, fontWeight: 400, letterSpacing: 2 }}>
          SOFTWARE ENGINEER · LONDON
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "54px 24px 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            maxWidth: 790,
            fontFamily: "Georgia",
            fontSize: 88,
            lineHeight: 0.9,
            letterSpacing: -5,
          }}
        >
          I build thoughtful software for complex problems.
        </div>
        <div
          style={{
            display: "flex",
            width: 210,
            minHeight: 142,
            alignItems: "flex-end",
            padding: "20px",
            color: "#17120f",
            background: "#e6b94d",
            border: "2px solid #f0e8d8",
            boxShadow: "7px 7px 0 #f0e8d8",
            fontFamily: "Arial",
            fontSize: 17,
            lineHeight: 1.25,
            transform: "rotate(2deg)",
          }}
        >
          A personal corner of the internet.
        </div>
      </div>
    </div>,
    size,
  );
}
