/**
 * CEC Check-in - animations.js
 * Editorial-style SVG silhouettes for the result screen.
 * NO cartoons. Anatomically correct, monochrome with accent color,
 * dramatic lighting like a sports magazine cover.
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

/**
 * Shared <defs>: gradients, filters used in every scene.
 */
function commonDefs(prefix, accent, accentDark) {
  return `
    <defs>
      <radialGradient id="${prefix}-spot" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.18)"/>
        <stop offset="35%" stop-color="rgba(255, 255, 255, 0.06)"/>
        <stop offset="70%" stop-color="rgba(255, 255, 255, 0)"/>
      </radialGradient>
      <linearGradient id="${prefix}-wall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1a2236"/>
        <stop offset="100%" stop-color="#0a0e1a"/>
      </linearGradient>
      <linearGradient id="${prefix}-figure" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="${prefix}-rim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="${accentDark}"/>
      </linearGradient>
      <radialGradient id="${prefix}-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <filter id="${prefix}-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.4"/>
      </filter>
    </defs>
  `;
}

/**
 * Climbing-gym wall background: panels, holds with depth.
 */
function wallBackdrop(prefix) {
  return `
    <!-- Wall panels (faceted geometry, IFSC-style) -->
    <g class="wall">
      <rect x="0" y="0" width="220" height="220" fill="url(#${prefix}-wall)"/>
      <!-- Diagonal faceted panel -->
      <polygon points="0,40 220,0 220,80 0,140" fill="rgba(30, 41, 59, 0.6)"/>
      <polygon points="0,140 220,80 220,140 0,180" fill="rgba(15, 23, 42, 0.7)"/>
      <!-- Subtle panel separators -->
      <line x1="0" y1="40" x2="220" y2="0" stroke="rgba(255,255,255,0.04)" stroke-width="0.6"/>
      <line x1="0" y1="140" x2="220" y2="80" stroke="rgba(255,255,255,0.05)" stroke-width="0.6"/>
      <!-- Spotlight from top -->
      <ellipse cx="110" cy="0" rx="140" ry="80" fill="url(#${prefix}-spot)"/>
    </g>

    <!-- Distant holds with subtle glow -->
    <g class="distant-holds">
      <ellipse cx="36" cy="80" rx="3.5" ry="6" fill="rgba(96, 165, 250, 0.55)" filter="url(#${prefix}-soft)"/>
      <ellipse cx="184" cy="50" rx="3" ry="5" fill="rgba(244, 114, 182, 0.5)" filter="url(#${prefix}-soft)"/>
      <ellipse cx="170" cy="125" rx="4" ry="6" fill="rgba(245, 158, 11, 0.5)" filter="url(#${prefix}-soft)"/>
      <ellipse cx="50" cy="150" rx="3" ry="5" fill="rgba(139, 92, 246, 0.45)" filter="url(#${prefix}-soft)"/>
    </g>

    <!-- Floor / mat suggestion -->
    <rect x="0" y="195" width="220" height="25" fill="rgba(15, 23, 42, 0.85)"/>
    <line x1="0" y1="195" x2="220" y2="195" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
  `;
}

/**
 * Chalk dust particles floating in the spotlight.
 */
function chalkParticles(count, prefix, accent) {
  const out = [];
  const seed = prefix.charCodeAt(0); // simple deterministic seed
  for (let i = 0; i < count; i++) {
    const x = ((seed * 7 + i * 23) % 200) + 10;
    const y = ((seed * 11 + i * 17) % 150) + 20;
    const r = 0.6 + ((i * 3) % 5) * 0.2;
    const o = 0.15 + ((i * 7) % 4) * 0.08;
    const drift = 4 + ((i * 5) % 8);
    const dur = 6 + ((i * 13) % 8);
    out.push(`
      <circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="${i % 4 === 0 ? accent : '#cbd5e1'}" opacity="${o.toFixed(2)}">
        <animate attributeName="cy" values="${y};${y - drift};${y}" dur="${dur}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="${o};${(o * 1.6).toFixed(2)}; ${o}" dur="${dur}s" repeatCount="indefinite"/>
      </circle>
    `);
  }
  return out.join('');
}

/* ============================================
   GREEN — top-out victory silhouette
   ============================================ */
function greenScene() {
  const accent = '#10b981';
  const accentDark = '#047857';
  const p = 'g';
  return `
    <svg class="climber-svg climber-green" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      ${commonDefs(p, accent, accentDark)}
      ${wallBackdrop(p)}

      <!-- Hero glow behind the figure -->
      <circle cx="110" cy="110" r="80" fill="url(#${p}-glow)"/>

      <!-- Top-out hold (large jug with edge highlight) -->
      <g class="hold-jug">
        <path d="M 60 90 Q 110 70 160 90 Q 162 100 158 105 L 62 105 Q 58 100 60 90 Z"
              fill="${accent}" opacity="0.85"/>
        <path d="M 64 85 Q 110 70 156 85" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" fill="none"/>
        <path d="M 60 90 Q 110 75 160 90" stroke="${accentDark}" stroke-width="0.8" fill="none" opacity="0.5"/>
      </g>

      <!-- Climber silhouette: topping out, both hands on the jug,
           pulling up, head approaching the top. Editorial style. -->
      <g class="climber-figure" transform="translate(0, 0)">
        <!-- Right arm (extended, hand on jug) -->
        <path d="M 138 100 Q 134 112 130 122 Q 128 130 124 138" stroke="url(#${p}-figure)" stroke-width="9" stroke-linecap="round" fill="none"/>
        <!-- Left arm pulling -->
        <path d="M 82 100 Q 86 112 92 124 Q 96 132 100 140" stroke="url(#${p}-figure)" stroke-width="9" stroke-linecap="round" fill="none"/>

        <!-- Torso (powerful triangle) -->
        <path d="M 96 138 L 124 138 L 132 168 L 88 168 Z" fill="url(#${p}-figure)"/>
        <!-- Torso accent line (jersey hem) -->
        <line x1="92" y1="158" x2="128" y2="158" stroke="${accent}" stroke-width="1.5" opacity="0.85"/>
        <!-- CEC mark -->
        <text x="110" y="156" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" font-weight="800" fill="${accent}" opacity="0.9" letter-spacing="0.5">CEC</text>

        <!-- Head (small, profile-leaning) -->
        <ellipse cx="110" cy="125" rx="9" ry="11" fill="url(#${p}-figure)"/>
        <!-- Hair top -->
        <path d="M 102 117 Q 110 113 118 117 L 117 121 Q 110 119 103 121 Z" fill="#1f2937"/>
        <!-- Rim light on head from spotlight -->
        <path d="M 108 116 Q 113 116 117 119" stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none"/>

        <!-- Hips / belt -->
        <rect x="92" y="166" width="36" height="6" rx="1" fill="#1f2937"/>
        <line x1="92" y1="169" x2="128" y2="169" stroke="${accent}" stroke-width="0.8" opacity="0.7"/>

        <!-- Legs (athletic stance, one knee bent) -->
        <path d="M 99 172 Q 95 184 90 196" stroke="url(#${p}-figure)" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M 121 172 Q 128 184 134 196" stroke="url(#${p}-figure)" stroke-width="10" stroke-linecap="round" fill="none"/>

        <!-- Climbing shoes -->
        <ellipse cx="89" cy="196" rx="6" ry="2.5" fill="${accent}"/>
        <ellipse cx="135" cy="196" rx="6" ry="2.5" fill="${accent}"/>

        <!-- Hands on jug (visible) -->
        <ellipse cx="80" cy="100" rx="4.5" ry="3" fill="url(#${p}-figure)"/>
        <ellipse cx="140" cy="100" rx="4.5" ry="3" fill="url(#${p}-figure)"/>

        <!-- Rim light on shoulder + back (left side, simulating spotlight) -->
        <path d="M 85 138 Q 88 152 90 168" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
        <path d="M 100 122 Q 96 130 90 138" stroke="rgba(255,255,255,0.18)" stroke-width="1" fill="none"/>
      </g>

      <!-- Subtle confetti / celebration sparks -->
      <g class="celebration">
        ${[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 30 + i * 32;
          const delay = (i * 0.25).toFixed(2);
          return `<circle cx="${x}" cy="-8" r="1.6" fill="${['#10b981','#fbbf24','#3b82f6','#ec4899','#8b5cf6','#f97316'][i]}">
            <animate attributeName="cy" values="-8;220" dur="3.5s" begin="${delay}s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;1;1;0" dur="3.5s" begin="${delay}s" repeatCount="indefinite"/>
          </circle>`;
        }).join('')}
      </g>

      <!-- Chalk dust -->
      <g class="chalk">${chalkParticles(20, p, accent)}</g>
    </svg>
  `;
}

/* ============================================
   YELLOW — mid-route, evaluating, focused
   ============================================ */
function yellowScene() {
  const accent = '#f59e0b';
  const accentDark = '#b45309';
  const p = 'y';
  return `
    <svg class="climber-svg climber-yellow" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      ${commonDefs(p, accent, accentDark)}
      ${wallBackdrop(p)}

      <circle cx="110" cy="105" r="75" fill="url(#${p}-glow)"/>

      <!-- Two holds: one in hand, one being assessed -->
      <g class="hold-current">
        <ellipse cx="80" cy="92" rx="9" ry="6" fill="${accent}" opacity="0.85"/>
        <ellipse cx="78" cy="89" rx="4" ry="2" fill="rgba(255,255,255,0.45)"/>
      </g>
      <g class="hold-target">
        <ellipse cx="148" cy="68" rx="7" ry="5" fill="${accentDark}" opacity="0.7"/>
        <ellipse cx="146" cy="66" rx="3" ry="1.5" fill="rgba(255,255,255,0.3)"/>
      </g>

      <!-- Climber silhouette: paused mid-route, looking up at the next hold -->
      <g class="climber-figure">
        <!-- Right arm reaching toward next hold -->
        <path d="M 122 122 Q 134 100 148 78" stroke="url(#${p}-figure)" stroke-width="9" stroke-linecap="round" fill="none"/>
        <ellipse cx="148" cy="76" rx="4" ry="3" fill="url(#${p}-figure)"/>

        <!-- Left arm holding current hold -->
        <path d="M 96 122 Q 88 108 80 96" stroke="url(#${p}-figure)" stroke-width="9" stroke-linecap="round" fill="none"/>
        <ellipse cx="80" cy="96" rx="4" ry="3" fill="url(#${p}-figure)"/>

        <!-- Torso: side profile, slightly twisted -->
        <path d="M 95 122 L 125 122 L 128 158 L 92 158 Z" fill="url(#${p}-figure)"/>
        <line x1="92" y1="148" x2="128" y2="148" stroke="${accent}" stroke-width="1.5" opacity="0.8"/>
        <text x="110" y="146" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" font-weight="800" fill="${accent}" opacity="0.85" letter-spacing="0.5">CEC</text>

        <!-- Head looking up-right (profile) -->
        <ellipse cx="115" cy="110" rx="8.5" ry="11" fill="url(#${p}-figure)"/>
        <path d="M 108 102 Q 115 98 122 102 L 121 106 Q 115 104 109 106 Z" fill="#1f2937"/>
        <!-- Profile detail: nose hint -->
        <path d="M 124 110 Q 126 112 124 114" stroke="rgba(255,255,255,0.18)" stroke-width="0.8" fill="none"/>

        <!-- Hips -->
        <rect x="92" y="156" width="36" height="6" rx="1" fill="#1f2937"/>

        <!-- Legs: one bent on a foot hold, one extended -->
        <path d="M 100 162 Q 92 170 86 180 Q 84 188 88 196" stroke="url(#${p}-figure)" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M 122 162 Q 132 174 138 188" stroke="url(#${p}-figure)" stroke-width="10" stroke-linecap="round" fill="none"/>
        <ellipse cx="88" cy="196" rx="6" ry="2.5" fill="${accent}"/>
        <ellipse cx="138" cy="190" rx="6" ry="2.5" fill="${accent}"/>

        <!-- Foothold under right foot -->
        <ellipse cx="138" cy="190" rx="8" ry="3" fill="${accentDark}" opacity="0.5"/>

        <!-- Rim light -->
        <path d="M 96 122 Q 92 138 92 156" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
        <path d="M 110 100 Q 108 106 108 110" stroke="rgba(255,255,255,0.18)" stroke-width="1" fill="none"/>
      </g>

      <g class="chalk">${chalkParticles(16, p, accent)}</g>
    </svg>
  `;
}

/* ============================================
   RED — descending / stepping back
   ============================================ */
function redScene() {
  const accent = '#ef4444';
  const accentDark = '#7f1d1d';
  const p = 'r';
  return `
    <svg class="climber-svg climber-red" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      ${commonDefs(p, accent, accentDark)}
      ${wallBackdrop(p)}

      <circle cx="110" cy="120" r="78" fill="url(#${p}-glow)" opacity="0.6"/>

      <!-- Hold left untouched, with caution glow -->
      <g class="hold-untouched">
        <ellipse cx="148" cy="80" rx="8" ry="6" fill="${accentDark}" opacity="0.5"/>
        <circle cx="148" cy="80" r="14" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.55">
          <animate attributeName="r" values="14;20;14" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.55;0.1;0.55" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <text x="148" y="84" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="${accent}">!</text>
      </g>

      <!-- Climber stepping back (3/4 view, head turned) -->
      <g class="climber-figure">
        <!-- Hands resting at sides (not climbing) -->
        <path d="M 96 138 Q 88 154 86 170" stroke="url(#${p}-figure)" stroke-width="9" stroke-linecap="round" fill="none"/>
        <path d="M 124 138 Q 132 154 134 170" stroke="url(#${p}-figure)" stroke-width="9" stroke-linecap="round" fill="none"/>

        <!-- Torso (slightly slumped) -->
        <path d="M 96 130 L 124 130 L 130 168 L 90 168 Z" fill="url(#${p}-figure)"/>
        <line x1="92" y1="158" x2="128" y2="158" stroke="${accent}" stroke-width="1.5" opacity="0.7"/>
        <text x="110" y="156" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" font-weight="800" fill="${accent}" opacity="0.7" letter-spacing="0.5">CEC</text>

        <!-- Head (looking down/away) -->
        <ellipse cx="110" cy="116" rx="9" ry="11" fill="url(#${p}-figure)"/>
        <path d="M 102 108 Q 110 104 118 108 L 117 112 Q 110 110 103 112 Z" fill="#1f2937"/>

        <!-- Hips -->
        <rect x="90" y="166" width="40" height="6" rx="1" fill="#1f2937"/>

        <!-- Legs walking back (one mid-step) -->
        <path d="M 99 172 Q 90 182 84 196" stroke="url(#${p}-figure)" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M 121 172 Q 130 180 138 192" stroke="url(#${p}-figure)" stroke-width="10" stroke-linecap="round" fill="none"/>
        <ellipse cx="84" cy="196" rx="7" ry="2.5" fill="${accent}"/>
        <ellipse cx="138" cy="192" rx="7" ry="2.5" fill="${accent}"/>

        <!-- Cool rim light only on right side -->
        <path d="M 124 130 Q 128 148 130 168" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" fill="none"/>
      </g>

      <g class="chalk">${chalkParticles(12, p, accent)}</g>
    </svg>
  `;
}
