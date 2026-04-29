"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAcceptedRequest } from "@/redux/acceptedRequestSlice";
import config from "@/services/socketio/config";
import socketService from "@/services/socketio/SocketService";
import { PiWarningFill } from "react-icons/pi";

interface AcceptedRequest {
  providerId: string;
  requestId: string;
  timestamp: string;
}

interface DesktopProps {
  id: string;
}

// ─── Canvas Spinner ────────────────────────────────────────────────────────────
function TimerCanvas({ timeLeft }: { timeLeft: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 300, H = 300, cx = 150, cy = 150;
    let outerCRotation = 0;
    let innerCRotation = 0;
    let outerDotsRotation = 0;
    let colorIndex = 0;
    let colorT = 0;
    let animId: number;

    // Circle bg gradient colors (top color at 0.5 alpha → white at 0.5 alpha)
    const bgColors = [
      { top: [120,47,248], bot: [255,255,255] },   // purple
      { top: [255,219,67], bot: [255,255,255] },    // yellow
      { top: [251,55,72], bot: [255,255,255] },     // red
      { top: [26,164,91], bot: [255,255,255] },     // green
    ];
    // Element colors: #FFFFFF, #FFDB43, #FB3748, #1AA45B
    const elemColors = [
      { r: 255, g: 255, b: 255 },
      { r: 255, g: 219, b: 67 },
      { r: 251, g: 55, b: 72 },
      { r: 26, g: 164, b: 91 },
    ];

    const draw = () => {
      outerCRotation += 0.035;
      innerCRotation -= 0.045;
      outerDotsRotation += 0.05;
      colorT += 0.02;
      if (colorT >= 1) { colorT = 0; colorIndex = (colorIndex + 1) % bgColors.length; }
      const nextIndex = (colorIndex + 1) % bgColors.length;
      const t = colorT;

      const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
      const lerpArr = (a: number[], b: number[]) => a.map((v, i) => lerp(v, b[i]));

      const cur = bgColors[colorIndex], nxt = bgColors[nextIndex];
      const topRgb = lerpArr(cur.top, nxt.top);
      const botRgb = lerpArr(cur.bot, nxt.bot);

      const curE = elemColors[colorIndex], nxtE = elemColors[nextIndex];
      const eR = lerp(curE.r, nxtE.r), eG = lerp(curE.g, nxtE.g), eB = lerp(curE.b, nxtE.b);
      const eStroke = `rgba(${eR},${eG},${eB},0.92)`;
      const eFill = `rgba(${eR},${eG},${eB},0.90)`;
      const eDot = `rgba(${eR},${eG},${eB},0.88)`;
      ctx.clearRect(0, 0, W, H);

      // ── Circle background (linear gradient top to bottom, 0.5 alpha) ──
      const bg = ctx.createLinearGradient(cx, 0, cx, H);
      bg.addColorStop(0, `rgba(${topRgb.join(",")},0.5)`);
      bg.addColorStop(1, `rgba(${botRgb.join(",")},0.5)`);
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();

      // ── Subtle rim glow ──
      const rim = ctx.createRadialGradient(cx, cy, 130, cx, cy, 150);
      rim.addColorStop(0, `rgba(${topRgb.join(",")},0.0)`);
      rim.addColorStop(0.7, `rgba(${topRgb.join(",")},0.15)`);
      rim.addColorStop(1, `rgba(${topRgb.join(",")},0.35)`);
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      // ── Outer ring: 12 clock-position dots (fast spin) ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(outerDotsRotation);
      ctx.translate(-cx, -cy);
      const OUTER_R = 120;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(cx + OUTER_R * Math.cos(a), cy + OUTER_R * Math.sin(a), 9.5, 0, Math.PI * 2);
        ctx.fillStyle = eFill;
        ctx.fill();
      }
      ctx.restore();

      ctx.lineCap = "round";
      ctx.lineWidth = 13;

      // ── Outer C-shape + dot at tip (slow spin) ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(outerCRotation);
      ctx.translate(-cx, -cy);
      ctx.beginPath();
      ctx.arc(cx, cy, 82, Math.PI * 0.15, Math.PI * 1.55);
      ctx.strokeStyle = eStroke;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 89 * Math.cos(Math.PI * 0.15), cy + 2 * Math.sin(Math.PI * 0.15), 9.5, 0, Math.PI * 2);
      ctx.fillStyle = eDot;
      ctx.fill();
      ctx.restore();

      // ── Inner C-shape + dot at tip (medium spin, reverse) ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(innerCRotation);
      ctx.translate(-cx, -cy);
      ctx.lineCap = "round";
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, Math.PI * 1.7, Math.PI * 0.9);
      ctx.strokeStyle = eStroke;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 50 * Math.cos(Math.PI * 1.7), cy + 60 * Math.sin(Math.PI * 1.7), 9.5, 0, Math.PI * 2);
      ctx.fillStyle = eDot;
      ctx.fill();
      ctx.restore();

      // ── Timer text (stays static) ──
      const mins = Math.floor(timeLeftRef.current / 60).toString().padStart(2, "0");
      const secs = (timeLeftRef.current % 60).toString().padStart(2, "0");
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${mins}:${secs}`, cx, cy);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ display: "block" }} />;
}

// ─── Main Component ────────────────────────────────────────────────────────────
function Desktop({ id }: DesktopProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const totalTime = 180;
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const socket = socketService.connect(config.SOCKET_URL);
    socket.on("connect", () => {
      const customerId = localStorage.getItem("userId");
      socket.emit("joinCustomerRoom", customerId);
    });
    socket.on("requestAccepted", (data: AcceptedRequest) => {
      dispatch(setAcceptedRequest(data));
      router.push("/foundservicer");
    });
    return () => { socketService.disconnect(); };
  }, []);

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#000000" }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.9) 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        {timeLeft > 0 ? (
          <>
            <TimerCanvas timeLeft={timeLeft} />
            <div className="mt-5 text-center">
              <p className="font-bold text-white text-xl">
                Waiting for Your Service Partner
              </p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                We&apos;ve notified your partner. Hang tight!
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl px-10 py-10 max-w-lg w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                <PiWarningFill className="text-white" size={32} />
              </div>
            </div>
            <h2 className="font-poppins font-bold text-[30px] leading-[28px] tracking-[-0.2px] text-gray-900 mb-3">Ooops!</h2>
            <p className="text-gray-400 text-sm mb-8">
              We couldn&apos;t confirm this partner&apos;s arrival. Please try
              another service partner within 10 km distance.
            </p>
            <div className="flex gap-4">
              <button className="flex-1 py-3 rounded-xl border-2 border-[#FB3748] text-[#FB3748] font-semibold text-sm hover:bg-red-50 transition">
                Cancel
              </button>
              <button className="flex-1 py-3 rounded-xl bg-[#782FF8] text-white font-semibold text-sm hover:bg-[#6611EE] transition">
                Next 10km
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Desktop;
