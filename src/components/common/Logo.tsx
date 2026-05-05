import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex flex-col items-center group">
      <div className="relative">
        <svg viewBox="0 0 400 200" className="w-80 h-auto drop-shadow-sm overflow-visible">

          {/* Perfect Circular Circumference Arc */}
          <path
            d="M 120,30 A 70,70 0 1 0 185,145"
            fill="none"
            stroke="#2fb344"
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-700 group-hover:stroke-emerald-500"
          />

          {/* TIME Text - Perfectly centered within the circle */}
          <text
            x="170"
            y="135"
            textAnchor="middle"
            className="font-serif font-black text-6xl fill-black dark:fill-white"
            style={{ fontWeight: 900 }}
          >
            T<tspan fill="#2fb344">I</tspan>ME
          </text>

          {/* Clock Hands on 'I' */}
          <g transform="translate(137, 90)">
            <path
              d="M 0,0 L -30,-45 M 0,0 L 40,-40"
              fill="none"
              stroke="#2fb344"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* Subtitle - Burgur & Pizza */}
          <text
            x="345"
            y="150"
            textAnchor="end"
            className="font-mono font-bold text-xl fill-[#2fb344]"
          >
            Burgur & Pizza
          </text>
        </svg>
      </div>
    </Link>
  );
}
