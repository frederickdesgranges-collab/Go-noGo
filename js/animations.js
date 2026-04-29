/**
 * CEC Check-in - animations.js
 * Inline SVG climber scenes generated as strings.
 * Premium illustrations with depth, lighting, detail.
 */

export function climberScene(color) {
  if (color === 'yellow') return yellowScene();
  if (color === 'red') return redScene();
  return greenScene();
}

export function mountScene(container, color) {
  if (!container) return;
  container.innerHTML = climberScene(color);
}

/* Shared filters and gradients used by every scene */
function defs(color) {
  return `
    <defs>
      <linearGradient id="block-top-${color}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#5a6a8c"/>
        <stop offset="100%" stop-color="#3a4768"/>
      </linearGradient>
      <linearGradient id="block-front-${color}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3a4768"/>
        <stop offset="100%" stop-color="#1f2738"/>
      </linearGradient>
      <linearGradient id="block-side-${color}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2a3552"/>
        <stop offset="100%" stop-color="#161c2c"/>
      </linearGradient>
      <radialGradient id="hold-glow-${color}" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
      <filter id="soft-shadow-${color}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="3" result="offsetblur"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <linearGradient id="skin-${color}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fde0c2"/>
        <stop offset="100%" stop-color="#e8b78a"/>
      </linearGradient>
    </defs>
  `;
}

/**
 * Stylized competition boulder block, 3/4 view, with colored holds.
 */
function blockGroup(color) {
  return `
    <g class="boulder-block" filter="url(#soft-shadow-${color})">
      <!-- Cast shadow on floor -->
      <ellipse cx="118" cy="186" rx="64" ry="6" fill="rgba(0,0,0,0.45)"/>

      <!-- Side face (right) -->
      <polygon points="148,128 178,118 178,168 148,178" fill="url(#block-side-${color})"/>
      <!-- Front face -->
      <polygon points="62,128 148,128 148,178 62,178" fill="url(#block-front-${color})"/>
      <!-- Top face -->
      <polygon points="62,128 92,118 178,118 148,128" fill="url(#block-top-${color})"/>

      <!-- Edge highlights -->
      <line x1="62" y1="128" x2="148" y2="128" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>
      <line x1="148" y1="128" x2="178" y2="118" stroke="rgba(255,255,255,0.18)" stroke-width="0.8"/>

      <!-- Holds (top face) -->
      <g>
        <ellipse cx="100" cy="124" rx="6" ry="3" fill="#fbbf24"/>
        <ellipse cx="100" cy="123" rx="3" ry="1.2" fill="rgba(255,255,255,0.55)"/>
      </g>
      <g>
        <ellipse cx="135" cy="121" rx="5" ry="2.5" fill="#3b82f6"/>
        <ellipse cx="135" cy="120" rx="2.5" ry="1" fill="rgba(255,255,255,0.55)"/>
      </g>

      <!-- Holds (front face) -->
      <g>
        <ellipse cx="78" cy="148" rx="4.5" ry="6" fill="#10b981"/>
        <ellipse cx="77" cy="146" rx="2" ry="2.5" fill="rgba(255,255,255,0.45)"/>
      </g>
      <g>
        <ellipse cx="120" cy="158" rx="4.5" ry="6" fill="#ec4899"/>
        <ellipse cx="119" cy="156" rx="2" ry="2.5" fill="rgba(255,255,255,0.45)"/>
      </g>
      <g>
        <ellipse cx="100" cy="170" rx="4" ry="5.5" fill="#f97316"/>
        <ellipse cx="99" cy="168" rx="1.8" ry="2.2" fill="rgba(255,255,255,0.45)"/>
      </g>

      <!-- Holds (side face) -->
      <g>
        <ellipse cx="163" cy="148" rx="3" ry="5" fill="#8b5cf6"/>
        <ellipse cx="162.5" cy="146" rx="1.4" ry="2" fill="rgba(255,255,255,0.4)"/>
      </g>
    </g>
  `;
}

/**
 * GREEN — climber on top, fist raised, confetti, golden halo
 */
function greenScene() {
  const confetti = [];
  const colors = ['#fbbf24', '#10b981', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#14b8a6', '#fde68a'];
  for (let i = 0; i < 18; i++) {
    const x = 24 + Math.random() * 152;
    const delay = (i * 0.14).toFixed(2);
    const c = colors[i % colors.length];
    const w = 3 + Math.random() * 4;
    const h = 5 + Math.random() * 5;
    confetti.push(`<rect class="confetti-piece" x="${x.toFixed(1)}" y="-12" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${c}" style="animation-delay: ${delay}s" />`);
  }

  return `
    <svg class="climber-svg climber-green" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${defs('green')}
      <defs>
        <radialGradient id="haloGreen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.95"/>
          <stop offset="55%" stop-color="#fbbf24" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="jersey-green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#34d399"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>

      <!-- Halo behind head -->
      <circle class="halo" cx="100" cy="58" r="44" fill="url(#haloGreen)"/>

      ${blockGroup('green')}

      <!-- Climber on top, victorious -->
      <g class="climber-body">
        <!-- Shadow under feet -->
        <ellipse cx="100" cy="120" rx="14" ry="2.5" fill="rgba(0,0,0,0.35)"/>

        <!-- Legs -->
        <line x1="96" y1="116" x2="92" y2="124" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>
        <line x1="104" y1="116" x2="108" y2="124" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>
        <!-- Shoes -->
        <ellipse cx="92" cy="124" rx="4" ry="2.2" fill="#0f172a"/>
        <ellipse cx="108" cy="124" rx="4" ry="2.2" fill="#0f172a"/>

        <!-- Body / jersey -->
        <ellipse cx="100" cy="100" rx="12" ry="19" fill="url(#jersey-green)"/>
        <!-- Jersey shine -->
        <ellipse cx="96" cy="94" rx="3.5" ry="9" fill="rgba(255,255,255,0.18)"/>
        <!-- CEC mark -->
        <text x="100" y="103" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7" font-weight="800" fill="rgba(255,255,255,0.5)">CEC</text>

        <!-- Head -->
        <circle cx="100" cy="74" r="11" fill="url(#skin-green)"/>
        <!-- Hair -->
        <path d="M89 70 Q92 63 100 62 Q108 63 111 70 Q108 67 100 67 Q92 67 89 70 Z" fill="#3a2410"/>
        <!-- Smile -->
        <path class="smile" d="M95 78 Q100 82 105 78" stroke="#3a2410" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <!-- Eyes (closed in joy) -->
        <path d="M94 73 Q96 71 98 73" stroke="#1a1a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M102 73 Q104 71 106 73" stroke="#1a1a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>

        <!-- Raised arm with fist -->
        <g class="victory-arm">
          <line x1="100" y1="92" x2="86" y2="56" stroke="url(#jersey-green)" stroke-width="6.5" stroke-linecap="round"/>
          <circle cx="84" cy="53" r="7" fill="url(#skin-green)"/>
          <!-- Fist knuckles -->
          <path d="M80 51 L83 49 L86 51 L89 49" stroke="#3a2410" stroke-width="0.8" fill="none"/>
        </g>
        <!-- Other arm (chest level) -->
        <line x1="100" y1="94" x2="116" y2="106" stroke="url(#jersey-green)" stroke-width="6.5" stroke-linecap="round"/>
        <circle cx="118" cy="108" r="4" fill="url(#skin-green)"/>
      </g>

      <!-- Confetti -->
      <g>${confetti.join('\n')}</g>
    </svg>
  `;
}

/**
 * YELLOW — climber on the blue mat, dazed, stars in orbit, slow recover
 */
function yellowScene() {
  return `
    <svg class="climber-svg climber-yellow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${defs('yellow')}
      <defs>
        <linearGradient id="jersey-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
        <linearGradient id="mat-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#1e40af"/>
        </linearGradient>
      </defs>

      ${blockGroup('yellow')}

      <!-- Crash mat with depth -->
      <ellipse cx="100" cy="190" rx="90" ry="11" fill="rgba(0,0,0,0.5)"/>
      <ellipse cx="100" cy="186" rx="86" ry="9" fill="url(#mat-blue)"/>
      <!-- Mat seams -->
      <path d="M40 184 L160 184" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4,3"/>

      <!-- Climber sitting on mat -->
      <g class="climber-body">
        <!-- Legs forward -->
        <line x1="94" y1="166" x2="78" y2="180" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>
        <line x1="106" y1="166" x2="124" y2="180" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>
        <ellipse cx="78" cy="180" rx="4" ry="2.2" fill="#0f172a"/>
        <ellipse cx="124" cy="180" rx="4" ry="2.2" fill="#0f172a"/>

        <!-- Body -->
        <ellipse cx="100" cy="158" rx="14" ry="11" fill="url(#jersey-yellow)"/>
        <ellipse cx="96" cy="153" rx="3" ry="6" fill="rgba(255,255,255,0.18)"/>

        <!-- Head -->
        <circle cx="100" cy="138" r="11" fill="url(#skin-yellow)"/>
        <!-- Hair messed up -->
        <path d="M89 134 Q92 126 100 124 Q108 126 111 134 Q105 130 100 131 Q95 130 89 134 Z" fill="#3a2410"/>
        <!-- Dazed eyes (X pattern) -->
        <path d="M93 136 L98 140 M98 136 L93 140" stroke="#1a1a1a" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M102 136 L107 140 M107 136 L102 140" stroke="#1a1a1a" stroke-width="1.6" stroke-linecap="round"/>
        <!-- Mouth wavy -->
        <path d="M94 146 Q97 144 100 146 Q103 148 106 146" stroke="#3a2410" stroke-width="1.4" fill="none" stroke-linecap="round"/>

        <!-- Arms relaxed -->
        <line x1="88" y1="156" x2="76" y2="168" stroke="url(#jersey-yellow)" stroke-width="6.5" stroke-linecap="round"/>
        <line x1="112" y1="156" x2="124" y2="168" stroke="url(#jersey-yellow)" stroke-width="6.5" stroke-linecap="round"/>
        <circle cx="76" cy="168" r="4" fill="url(#skin-yellow)"/>
        <circle cx="124" cy="168" r="4" fill="url(#skin-yellow)"/>
      </g>

      <!-- Stars orbiting -->
      <g>
        ${star(100, 134, 'star-1', '#fbbf24')}
        ${star(100, 134, 'star-2', '#fde68a')}
        ${star(100, 134, 'star-3', '#f59e0b')}
      </g>
    </svg>
  `;
}

function star(cx, cy, cls, fill) {
  const path = `M0,-7.5 L2.2,-2.4 L7.5,-1.6 L3.4,2.2 L4.4,7.5 L0,4.6 L-4.4,7.5 L-3.4,2.2 L-7.5,-1.6 L-2.2,-2.4 Z`;
  return `
    <g class="star ${cls}" transform="translate(${cx} ${cy})">
      <path d="${path}" fill="${fill}" stroke="#b45309" stroke-width="0.8"
            filter="drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))"/>
    </g>
  `;
}

/**
 * RED — climber walking away from the wall, frustrated, alert marks on hold
 */
function redScene() {
  return `
    <svg class="climber-svg climber-red" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${defs('red')}
      <defs>
        <linearGradient id="jersey-red" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#7f1d1d"/>
        </linearGradient>
      </defs>

      ${blockGroup('red')}

      <!-- Alert marks "!!" on starting hold -->
      <g class="alert-marks">
        <circle cx="78" cy="138" r="9" fill="rgba(239, 68, 68, 0.18)"/>
        <text x="73" y="145" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ef4444"
              filter="drop-shadow(0 0 4px rgba(239,68,68,0.8))">!</text>
        <text x="80" y="145" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ef4444"
              filter="drop-shadow(0 0 4px rgba(239,68,68,0.8))">!</text>
      </g>

      <!-- Climber walking away (back view), to the right -->
      <g class="climber-leaving">
        <!-- Legs walking -->
        <line x1="116" y1="164" x2="111" y2="180" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>
        <line x1="124" y1="164" x2="132" y2="180" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>
        <ellipse cx="111" cy="180" rx="4" ry="2.2" fill="#0f172a"/>
        <ellipse cx="132" cy="180" rx="4" ry="2.2" fill="#0f172a"/>

        <!-- Body -->
        <ellipse cx="120" cy="150" rx="11" ry="17" fill="url(#jersey-red)"/>
        <ellipse cx="116" cy="146" rx="3" ry="7" fill="rgba(0,0,0,0.18)"/>

        <!-- Head (back of head) -->
        <circle cx="120" cy="128" r="10" fill="#3a2410"/>
        <path d="M111 130 Q120 122 129 130" stroke="#1a1209" stroke-width="2" fill="none"/>
        <!-- Neck shadow -->
        <path d="M115 134 Q120 138 125 134" stroke="rgba(0,0,0,0.4)" stroke-width="1.5" fill="none"/>

        <!-- Slumped shoulders -->
        <line x1="111" y1="142" x2="105" y2="158" stroke="url(#jersey-red)" stroke-width="6.5" stroke-linecap="round"/>
        <line x1="129" y1="142" x2="135" y2="158" stroke="url(#jersey-red)" stroke-width="6.5" stroke-linecap="round"/>
        <!-- Hand on neck (frustration) -->
        <line x1="129" y1="142" x2="124" y2="130" stroke="url(#jersey-red)" stroke-width="6.5" stroke-linecap="round"/>
      </g>
    </svg>
  `;
}
