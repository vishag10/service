'use client'
import React, { useState, useRef, useCallback, useEffect } from 'react'

type Mode = 'hour' | 'minute'

interface ClockPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const HOUR_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTE_NUMBERS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function parseTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 7, minute: 0, period: 'AM' as const };
  return { hour: parseInt(match[1]), minute: parseInt(match[2]), period: match[3].toUpperCase() as 'AM' | 'PM' };
}

function formatTime(hour: number, minute: number, period: string) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

export default function ClockPicker({ value, onChange }: ClockPickerProps) {
  const { hour, minute, period } = parseTime(value);
  const [mode, setMode] = useState<Mode>('hour');
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const RADIUS = 130;
  const CENTER = 150;
  const NUMBER_RADIUS = 105;
  const DOT_RADIUS = 18;

  const selectedValue = mode === 'hour' ? hour : minute;
  const numbers = mode === 'hour' ? HOUR_NUMBERS : MINUTE_NUMBERS;

  const getAngle = (val: number) => {
    if (mode === 'hour') return ((val % 12) / 12) * 360 - 90;
    return (val / 60) * 360 - 90;
  };

  const getPosition = (val: number) => {
    const angle = (getAngle(val) * Math.PI) / 180;
    return {
      x: CENTER + NUMBER_RADIUS * Math.cos(angle),
      y: CENTER + NUMBER_RADIUS * Math.sin(angle),
    };
  };

  const handAngle = getAngle(selectedValue);
  const handRad = (handAngle * Math.PI) / 180;
  const handEndX = CENTER + NUMBER_RADIUS * Math.cos(handRad);
  const handEndY = CENTER + NUMBER_RADIUS * Math.sin(handRad);

  const getValueFromPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - CENTER;
    const y = clientY - rect.top - CENTER;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hour') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      return { hour: h, minute };
    } else {
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      return { hour, minute: m };
    }
  }, [mode, hour, minute]);

  const applyValue = useCallback((clientX: number, clientY: number) => {
    const result = getValueFromPoint(clientX, clientY);
    if (result) onChange(formatTime(result.hour, result.minute, period));
  }, [getValueFromPoint, period, onChange]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    applyValue(e.clientX, e.clientY);
  }, [applyValue]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      applyValue(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setDragging(false);
      if (mode === 'hour') setMode('minute');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, applyValue, mode]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setDragging(true);
    const touch = e.touches[0];
    applyValue(touch.clientX, touch.clientY);
  }, [applyValue]);

  useEffect(() => {
    if (!dragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      applyValue(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      setDragging(false);
      if (mode === 'hour') setMode('minute');
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, applyValue, mode]);

  const setPeriod = (p: 'AM' | 'PM') => onChange(formatTime(hour, minute, p));

  return (
    <div className="flex flex-col items-center">
      {/* Time display */}
      <div className="flex items-center justify-center gap-1 mb-4">
        <button
          onClick={() => setMode('hour')}
          className={`text-4xl font-medium px-3 py-1 rounded-md transition ${
            mode === 'hour' ? 'bg-purple-100 text-[#7722FF]' : 'text-gray-400'
          }`}
        >
          {String(hour).padStart(2, '0')}
        </button>
        <span className="text-4xl font-medium text-gray-400">:</span>
        <button
          onClick={() => setMode('minute')}
          className={`text-4xl font-medium px-3 py-1 rounded-md transition ${
            mode === 'minute' ? 'bg-purple-100 text-[#7722FF]' : 'text-gray-400'
          }`}
        >
          {String(minute).padStart(2, '0')}
        </button>
        <div className="flex flex-col ml-2">
          <button
            onClick={() => setPeriod('AM')}
            className={`text-xs font-bold px-2 py-1 rounded-t transition ${
              period === 'AM' ? 'bg-[#7722FF] text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            AM
          </button>
          <button
            onClick={() => setPeriod('PM')}
            className={`text-xs font-bold px-2 py-1 rounded-b transition ${
              period === 'PM' ? 'bg-[#7722FF] text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock face */}
      <svg
        ref={svgRef}
        width={CENTER * 2}
        height={CENTER * 2}
        className="cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#E8E0F0" />
        <line
          x1={CENTER} y1={CENTER}
          x2={handEndX} y2={handEndY}
          stroke="#7722FF" strokeWidth={2}
        />
        <circle cx={CENTER} cy={CENTER} r={4} fill="#7722FF" />
        <circle cx={handEndX} cy={handEndY} r={DOT_RADIUS} fill="#7722FF" />

        {numbers.map((num) => {
          const pos = getPosition(num);
          const isActive = num === selectedValue;
          const label = mode === 'minute' ? String(num).padStart(2, '0') : String(num);
          return (
            <text
              key={num}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="select-none pointer-events-none"
              fontSize={14}
              fontWeight={isActive ? 700 : 400}
              fill={isActive ? 'white' : '#555'}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
