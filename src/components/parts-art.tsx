import type { PartKind } from "@/lib/home-products";

export function PartsArt({
  kind,
  name,
  className = "",
  marking,
  detail,
}: {
  kind: PartKind;
  name: string;
  className?: string;
  marking?: string;
  detail?: string;
}) {
  return (
    <div className={`parts-art ${className}`}>
      <svg viewBox="0 0 320 260" role="img" aria-label={name}>
        <ellipse
          cx="160"
          cy="231"
          rx="81"
          ry="9"
          fill="#17202d"
          opacity=".09"
        />
        {kind === "brake" && (
          <g transform="translate(160 128)">
            <circle r="92" fill="#8a929d" />
            <circle r="86" fill="#d8dce0" stroke="#f1f3f5" strokeWidth="3" />
            <circle r="70" fill="none" stroke="#b5bbc4" strokeWidth="20" />
            <circle r="54" fill="#7a8390" />
            <circle r="47" fill="#aeb5be" stroke="#dce0e5" strokeWidth="4" />
            <circle r="22" fill="#252d39" />
            {Array.from({ length: 5 }, (_, i) => (
              <circle
                key={`bolt-${i}`}
                cx="0"
                cy="-35"
                r="6"
                fill="#303845"
                transform={`rotate(${i * 72})`}
              />
            ))}
            {Array.from({ length: 18 }, (_, i) => (
              <g key={`hole-${i}`} transform={`rotate(${i * 20})`}>
                <circle cx="0" cy="-75" r="2.5" fill="#6c7582" />
                <circle cx="7" cy="-64" r="2" fill="#6c7582" />
              </g>
            ))}
            <path
              d="M48-57h36q22 0 22 25v57q0 21-22 21H48l-8-16v-70Z"
              fill="#c82432"
              stroke="#9f1728"
              strokeWidth="3"
            />
            <path d="M62-45v70m17-70v70" stroke="#e9505a" strokeWidth="4" />
            <rect x="48" y="-10" width="47" height="12" rx="3" fill="#a91a29" />
          </g>
        )}
        {kind === "oil" && (
          <g transform="rotate(-5 160 135)">
            <path
              d="M118 77h57l28 22 12 26v92H98V113Z"
              fill="#252d38"
              stroke="#151d28"
              strokeWidth="3"
            />
            <path
              d="M169 85h35l27 42v34h-21v-27l-15-25h-17"
              fill="none"
              stroke="#252d38"
              strokeWidth="17"
              strokeLinejoin="round"
            />
            <rect x="117" y="51" width="51" height="22" rx="4" fill="#e23841" />
            <path
              d="M122 55v13m9-13v13m9-13v13m9-13v13m9-13v13"
              stroke="#a5202d"
              strokeWidth="2"
            />
            <path d="M109 120h94v67h-94Z" fill="#d72a36" />
            <path d="M109 187h94v19h-94Z" fill="#dce2e9" />
            <text
              x="156"
              y="150"
              textAnchor="middle"
              fill="white"
              fontSize="20"
              fontWeight="700"
              fontFamily="Arial"
            >
              {marking ?? "5W-30"}
            </text>
            <text
              x="156"
              y="173"
              textAnchor="middle"
              fill="#ffe0e3"
              fontSize="11"
              fontFamily="Arial"
            >
              {detail ?? "4 L"}
            </text>
            <path
              d="M106 116v-11l17-21"
              stroke="#ffffff"
              strokeWidth="4"
              opacity=".18"
              fill="none"
            />
          </g>
        )}
        {kind === "filter" && (
          <g>
            <path
              d="M99 81h122v119H99Z"
              fill="#d8b362"
              stroke="#997742"
              strokeWidth="2"
            />
            {Array.from({ length: 18 }, (_, i) => (
              <path
                key={i}
                d={`M${104 + i * 6.4} 85v111`}
                stroke={i % 2 ? "#efd298" : "#ad833b"}
                strokeWidth="3"
              />
            ))}
            <ellipse
              cx="160"
              cy="80"
              rx="61"
              ry="19"
              fill="#bec4cc"
              stroke="#747e8a"
              strokeWidth="4"
            />
            <ellipse
              cx="160"
              cy="80"
              rx="27"
              ry="9"
              fill="#28313e"
              stroke="#7e8996"
              strokeWidth="6"
            />
            <path
              d="M99 195q0 25 61 25t61-25v-4q0 20-61 20t-61-20Z"
              fill="#485363"
            />
          </g>
        )}
        {kind === "shock" && (
          <g transform="rotate(28 160 130)">
            <rect x="153" y="25" width="14" height="86" rx="4" fill="#bbc3cc" />
            <rect
              x="138"
              y="97"
              width="44"
              height="102"
              rx="7"
              fill="#293340"
            />
            <path
              d="M132 73q56-10 56 2t-56 16 56 16-56 16 56 16-56 16 56 16-56 16"
              fill="none"
              stroke="#b32032"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M132 72q56-10 56 2t-56 16 56 16-56 16 56 16-56 16 56 16-56 16"
              fill="none"
              stroke="#ed4b54"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="125" y="56" width="70" height="12" rx="4" fill="#3d495a" />
            <rect
              x="143"
              y="198"
              width="34"
              height="27"
              rx="7"
              fill="#344254"
            />
            <circle cx="160" cy="214" r="7" fill="#111e2c" />
          </g>
        )}
        {kind === "tire" && (
          <g>
            <ellipse cx="161" cy="131" rx="78" ry="97" fill="#171d25" />
            <ellipse
              cx="174"
              cy="128"
              rx="77"
              ry="97"
              fill="#28313c"
              stroke="#101821"
              strokeWidth="4"
            />
            <ellipse
              cx="175"
              cy="128"
              rx="57"
              ry="76"
              fill="#8995a4"
              stroke="#374252"
              strokeWidth="7"
            />
            <ellipse cx="175" cy="128" rx="49" ry="66" fill="#27313e" />
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={i}
                d="M170 117l-13-48 20-8 10 54-7 13Z"
                fill="#c3ccd6"
                stroke="#7a8796"
                strokeWidth="2"
                transform={`rotate(${i * 60} 175 128)`}
              />
            ))}
            <ellipse
              cx="175"
              cy="128"
              rx="14"
              ry="19"
              fill="#d7dee6"
              stroke="#7d8a99"
              strokeWidth="3"
            />
            <path
              d="M109 67l-14 5m9 13-17 4m13 14-16 3m14 15-17 1m18 18-17-1m20 19-18-3m25 22-17-5m28 20-16-6"
              stroke="#4b5663"
              strokeWidth="5"
            />
          </g>
        )}
        {kind === "battery" && (
          <g>
            <path d="M84 90h150v126H84Z" fill="#2e3744" />
            <path d="M234 90l23-15v126l-23 15Z" fill="#1d2632" />
            <path d="M84 90l24-15h149l-23 15Z" fill="#495563" />
            <rect x="106" y="54" width="30" height="26" rx="5" fill="#d33140" />
            <rect x="210" y="54" width="29" height="23" rx="5" fill="#151f2c" />
            <path
              d="M135 80V58h47v22"
              fill="none"
              stroke="#495767"
              strokeWidth="10"
              strokeLinejoin="round"
            />
            <rect
              x="98"
              y="113"
              width="122"
              height="68"
              rx="3"
              fill="#e9eef3"
            />
            <path d="M98 113h122v19H98Z" fill="#c82432" />
            <text
              x="159"
              y="163"
              fill="#263442"
              textAnchor="middle"
              fontSize="21"
              fontWeight="700"
              fontFamily="Arial"
            >
              {marking ?? "12V 60Ah"}
            </text>
            <path
              d="M90 192h139m-139 10h139"
              stroke="#506071"
              strokeWidth="3"
            />
          </g>
        )}
        {kind === "plug" && (
          <g transform="rotate(24 160 130)">
            <rect x="153" y="29" width="14" height="24" rx="4" fill="#aeb9c6" />
            <rect
              x="145"
              y="49"
              width="30"
              height="73"
              rx="7"
              fill="#edf0f5"
              stroke="#bdc8d3"
              strokeWidth="2"
            />
            {Array.from({ length: 5 }, (_, i) => (
              <rect
                key={i}
                x="139"
                y={58 + i * 11}
                width="42"
                height="7"
                rx="3"
                fill="#e1e7ee"
                stroke="#b5c1cf"
              />
            ))}
            <path
              d="M136 124h48l8 14-8 15h-48l-8-15Z"
              fill="#9caaba"
              stroke="#64758a"
              strokeWidth="3"
            />
            <rect x="143" y="153" width="34" height="57" fill="#acb7c3" />
            {Array.from({ length: 7 }, (_, i) => (
              <path
                key={i}
                d={`M143 ${160 + i * 6}h34`}
                stroke="#60748a"
                strokeWidth="2"
              />
            ))}
            <path
              d="M145 210v16h19v-9"
              fill="none"
              stroke="#8e9baa"
              strokeWidth="5"
            />
            <path d="M160 209v10" stroke="#44576c" strokeWidth="4" />
          </g>
        )}
      </svg>
    </div>
  );
}
