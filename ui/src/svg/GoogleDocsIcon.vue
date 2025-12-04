<template>
  <svg
    viewBox="0 0 47 65"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient
        id="gdoc-gradient"
        x1="50%"
        y1="8.59%"
        x2="50%"
        y2="100%"
      >
        <stop
          stop-color="#1A237E"
          stop-opacity="0.2"
          offset="0%"
        />
        <stop
          stop-color="#1A237E"
          stop-opacity="0.02"
          offset="100%"
        />
      </linearGradient>
      <radialGradient
        id="gdoc-radial"
        cx="3.17%"
        cy="2.72%"
        r="161.25%"
      >
        <stop
          stop-color="#FFFFFF"
          stop-opacity="0.1"
          offset="0%"
        />
        <stop
          stop-color="#FFFFFF"
          stop-opacity="0"
          offset="100%"
        />
      </radialGradient>
    </defs>
    <!-- Main document shape -->
    <path
      d="M29.375,0 L4.406,0 C1.983,0 0,1.994 0,4.432 L0,60.568 C0,63.006 1.983,65 4.406,65 L42.594,65 C45.017,65 47,63.006 47,60.568 L47,17.727 L36.719,10.341 L29.375,0 Z"
      fill="#4285F4"
    />
    <!-- Corner fold shadow -->
    <polygon
      fill="url(#gdoc-gradient)"
      points="30.664 16.431 47 32.858 47 17.727"
    />
    <!-- Text lines -->
    <path
      d="M11.75,47.273 L35.25,47.273 L35.25,44.318 L11.75,44.318 L11.75,47.273 Z M11.75,53.182 L29.375,53.182 L29.375,50.227 L11.75,50.227 L11.75,53.182 Z M11.75,32.5 L11.75,35.455 L35.25,35.455 L35.25,32.5 L11.75,32.5 Z M11.75,41.364 L35.25,41.364 L35.25,38.409 L11.75,38.409 L11.75,41.364 Z"
      fill="#F1F1F1"
    />
    <!-- Corner fold -->
    <path
      d="M29.375,0 L29.375,13.295 C29.375,15.744 31.347,17.727 33.781,17.727 L47,17.727 L29.375,0 Z"
      fill="#A1C2FA"
    />
    <!-- Top highlight -->
    <path
      d="M4.406,0 C1.983,0 0,1.994 0,4.432 L0,4.801 C0,2.364 1.983,0.369 4.406,0.369 L29.375,0.369 L29.375,0 L4.406,0 Z"
      fill="#FFFFFF"
      fill-opacity="0.2"
    />
    <!-- Bottom shadow -->
    <path
      d="M42.594,64.631 L4.406,64.631 C1.983,64.631 0,62.636 0,60.199 L0,60.568 C0,63.006 1.983,65 4.406,65 L42.594,65 C45.017,65 47,63.006 47,60.568 L47,60.199 C47,62.636 45.017,64.631 42.594,64.631 Z"
      fill="#1A237E"
      fill-opacity="0.2"
    />
    <!-- Fold edge shadow -->
    <path
      d="M33.781,17.727 C31.347,17.727 29.375,15.744 29.375,13.295 L29.375,13.665 C29.375,16.113 31.347,18.097 33.781,18.097 L47,18.097 L47,17.727 L33.781,17.727 Z"
      fill="#1A237E"
      fill-opacity="0.1"
    />
    <!-- Overlay gradient -->
    <path
      d="M29.375,0 L4.406,0 C1.983,0 0,1.994 0,4.432 L0,60.568 C0,63.006 1.983,65 4.406,65 L42.594,65 C45.017,65 47,63.006 47,60.568 L47,17.727 L29.375,0 Z"
      fill="url(#gdoc-radial)"
    />
  </svg>
</template>
