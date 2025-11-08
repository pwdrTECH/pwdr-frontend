export default function EmptyFileIcon({ className }: { className?: string }) {
  return (
    <svg
      width="103"
      height="103"
      viewBox="0 0 103 103"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width="102.172"
        height="102.172"
        rx="51.0859"
        fill="url(#paint0_linear_4592_96842)"
      />
      <g filter="url(#filter0_dd_4592_96842)">
        <path
          d="M35.3672 35.3672C35.3672 33.1969 37.1266 31.4375 39.2969 31.4375H55.0156L66.8047 43.2266V66.8047C66.8047 68.975 65.0453 70.7344 62.875 70.7344H39.2969C37.1266 70.7344 35.3672 68.975 35.3672 66.8047V35.3672Z"
          fill="#1671D9"
        />
        <path
          opacity="0.3"
          d="M55.0156 31.4375L66.8047 43.2266H58.9453C56.775 43.2266 55.0156 41.4672 55.0156 39.2969V31.4375Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_dd_4592_96842"
          x="28.4375"
          y="29.4375"
          width="45.2969"
          height="45.2969"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.06 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_4592_96842"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_4592_96842"
            result="effect2_dropShadow_4592_96842"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_4592_96842"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_4592_96842"
          x1="51.0859"
          y1="0"
          x2="51.086"
          y2="102.172"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9FAFB" />
          <stop offset="1" stopColor="#EDF0F3" />
        </linearGradient>
      </defs>
    </svg>
  )
}
