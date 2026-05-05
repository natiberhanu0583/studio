'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [exit, setExit] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Counter Animation (0 to 12)
    const duration = 1000; // 2 seconds for counter
    const steps = 12;
    const interval = duration / steps;

    let current = 0;
    const counterTimer = setInterval(() => {
      current++;
      setCount(current);
      if (current >= steps) clearInterval(counterTimer);
    }, interval);

    // Transition stages
    const exitTimer = setTimeout(() => setExit(true), 3000);
    const removeTimer = setTimeout(() => setShow(false), 4000);

    return () => {
      clearInterval(counterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-white dark:bg-[#0a0500] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${exit ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center justify-center w-full h-full">

        {/* PHASE 1: Unified Arc & Clock Hands */}
        <div className={`absolute transition-all duration-1000 ease-in-out ${count >= 12 ? 'opacity-0 scale-50 blur-lg' : 'opacity-100 scale-100'}`}>
          <div className="relative w-96 h-96 flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              {/* Rotating Outer Arc */}
              <path
                d="M 100,40 A 60,60 0 1 1 50,140"
                fill="none"
                stroke="#2fb344"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-[spin_4s_linear_infinite]"
                style={{ transformOrigin: '100px 100px' }}
              />

              {/* Centered Independent Hour/Min Hands */}
              <g transform="translate(100, 100)" style={{ transformOrigin: '0 0' }}>
                {/* Minute Hand */}
                <path
                  d="M 0,0 L 0,-60"
                  fill="none"
                  stroke="#2fb344"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    transform: `rotate(${count * 360}deg)`,
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                {/* Hour Hand */}
                <path
                  d="M 0,0 L 30,-25"
                  fill="none"
                  stroke="#2fb344"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    transform: `rotate(${count * 30}deg)`,
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                {/* Center Pin */}
                <circle cx="0" cy="0" r="3" fill="#2fb344" />
              </g>
            </svg>

            {/* Centered Counter below the origin and the circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-40 text-7xl font-serif font-black text-black dark:text-emerald-500 tabular-nums">
              {count.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* PHASE 2: Precise Brand Reveal (Perfect Circular Arc) */}
        <div className={`flex flex-col items-center justify-center transition-all duration-[1200ms] cubic-bezier(0.23, 1, 0.32, 1) ${count >= 12 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-20'}`}>
          <svg viewBox="0 0 400 200" className="w-[35rem] md:w-[60rem] h-auto overflow-visible">
            {/* Perfect Circular Arc */}
            <path
              d="M 120,30 A 70,70 0 1 0 185,145"
              fill="none"
              stroke="#2fb344"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* TIME Text */}
            <text x="170" y="130" textAnchor="middle" className="font-serif font-black text-6xl fill-black dark:fill-white" style={{ fontWeight: 900 }}>
              T<tspan fill="#2fb344">I</tspan>ME
            </text>
            {/* Clock Hands on 'I' */}
            <g transform="translate(138, 85)">
              <path d="M 0,0 L -40,-45 M 0,0 L 40,-40" fill="none" stroke="#2fb344" strokeWidth="4" strokeLinecap="round" />
            </g>
            {/* Subtitle */}
            <text x="345" y="150" textAnchor="end" className="font-mono font-bold text-xl fill-[#2fb344]">
              Burgur & Pizza
            </text>
          </svg>
        </div>

      </div>
    </div>
  );
}
