/**
 * CEC Check-in - animations.js
 * Inline SVG climber scenes generated as strings.
 * Each scene shows a competition boulder block in 3/4 view.
 */

/**
 * Pick the scene SVG for a given color.
 * @param {'green'|'yellow'|'red'} color
 * @returns {string} SVG markup
 */
export function climberScene(color) {
  if (color === 'yellow') return yellowScene();
  if (color === 'red') return redScene();
  return greenScene();
}

/**
 * Mount an SVG scene into a DOM container.
 */
export function mountScene(container, color) {
  if (!container) return;
  container.innerHTML = climberScene(color);
}

/**
 * Render a stylized competition boulder block as an SVG group.
 * 3/4 view: top face + front face + side face, with colored holds.
 */
function blockGroup() {
  return `
    <g class="boulder-block" aria-hidden="true">
      <!-- Side face (right) -->
      <polygon points="148,128 178,118 178,168 148,178" fill="#1f2738" stroke="#2a3552" stroke-width="1"/>
      <!-- Front face -->
      <polygon points="62,128 148,128 148,178 62,178" fill="#2a3552" stroke="#3a4768" stroke-width="1"/>
      <!-- Top face -->
      <polygon points="62,128 92,118 178,118 148,128" fill="#3a4768" stroke="#4a5778" stroke-width="1"/>
      <!-- Holds (top face) -->
      <ellipse cx="100" cy="124" rx="6" ry="3" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="135" cy="121" rx="5" ry="2.5" fill="#3b82f6" opacity="0.9"/>
      <!-- Holds (front face) -->
      <ellipse cx="78" cy="148" rx="4" ry="6" fill="#10b981" opacity="0.9"/>
      <ellipse cx="120" cy="158" rx="4" ry="6" fill="#ec4899" opacity="0.9"/>
      <ellipse cx="100" cy="170" rx="3.5" ry="5" fill="#f97316" opacity="0.9"/>
      <!-- Holds (side face) -->
      <ellipse cx="163" cy="148" rx="3" ry="5" fill="#8b5cf6" opacity="0.85"/>
    </g>
  `;
}

/**
 * GREEN — climber on top, fist raised, confetti, golden halo
 */
function greenScene() {
  const confetti = [];
  const colors = ['#fbbf24', '#10b981', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#14b8a6'];
  for (let i = 0; i < 14; i++) {
    const x = 30 + Math.random() * 140;
    const delay = (i * 0.18).toFixed(2);
    const c = colors[i % colors.length];
    const w = 4 + Math.random() * 4;
    const h = 6 + Math.random() * 4;
    confetti.push(`<rect class="confetti-piece" x="${x.toFixed(1)}" y="-10" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${c}" style="animation-delay: ${delay}s" />`);
  }

  return `
    <svg class="climber-svg climber-green" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="haloGreen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde68a" stop-opacity="0.85"/>
          <stop offset="60%" stop-color="#fbbf24" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Halo behind head -->
      <circle class="halo" cx="100" cy="62" r="40" fill="url(#haloGreen)"/>

      ${blockGroup()}

      <!-- Climber on top, victorious -->
      <g class="climber-body" transform="translate(0,0)">
        <!-- Body -->
        <ellipse cx="100" cy="100" rx="11" ry="18" fill="#10b981"/>
        <!-- Head -->
        <circle cx="100" cy="74" r="11" fill="#fcd9b3"/>
        <!-- Smile -->
        <path class="smile" d="M95 78 Q100 82 105 78" stroke="#3a2410" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <!-- Eyes -->
        <circle cx="96" cy="72" r="1.3" fill="#1a1a1a"/>
        <circle cx="104" cy="72" r="1.3" fill="#1a1a1a"/>
        <!-- Raised arm with fist -->
        <g class="victory-arm">
          <line x1="100" y1="92" x2="86" y2="58" stroke="#10b981" stroke-width="6" stroke-linecap="round"/>
          <circle cx="84" cy="55" r="6" fill="#fcd9b3"/>
        </g>
        <!-- Other arm -->
        <line x1="100" y1="94" x2="116" y2="106" stroke="#10b981" stroke-width="6" stroke-linecap="round"/>
        <!-- Legs -->
        <line x1="96" y1="116" x2="92" y2="124" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
        <line x1="104" y1="116" x2="108" y2="124" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
      </g>

      <!-- Confetti -->
      ${confetti.join('\n')}
    </svg>
  `;
}

/**
 * YELLOW — climber sitting on the blue mat, dazed, stars in orbit
 */
function yellowScene() {
  return `
    <svg class="climber-svg climber-yellow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${blockGroup()}

      <!-- Blue crash mat -->
      <ellipse cx="100" cy="186" rx="84" ry="10" fill="#1e3a8a" opacity="0.55"/>
      <ellipse cx="100" cy="184" rx="80" ry="8" fill="#3b82f6" opacity="0.85"/>

      <!-- Climber sitting on mat -->
      <g class="climber-body">
        <!-- Body -->
        <ellipse cx="100" cy="160" rx="14" ry="10" fill="#f59e0b"/>
        <!-- Head -->
        <circle cx="100" cy="138" r="11" fill="#fcd9b3"/>
        <!-- Dazed eyes (X pattern) -->
        <path d="M93 136 L98 140 M98 136 L93 140" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M102 136 L107 140 M107 136 L102 140" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round"/>
        <!-- Mouth wavy -->
        <path d="M94 146 Q97 144 100 146 Q103 148 106 146" stroke="#3a2410" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <!-- Arms relaxed -->
        <line x1="88" y1="158" x2="78" y2="170" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <line x1="112" y1="158" x2="122" y2="170" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <!-- Legs forward -->
        <line x1="94" y1="168" x2="80" y2="178" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
        <line x1="106" y1="168" x2="120" y2="178" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
      </g>

      <!-- Stars orbiting -->
      <g>
        ${star(100, 138, 1, 'star-1')}
        ${star(100, 138, 1, 'star-2')}
        ${star(100, 138, 1, 'star-3')}
      </g>
    </svg>
  `;
}

function star(cx, cy, scale, cls) {
  const path = `M0,-7 L2,-2 L7,-1 L3,2 L4,7 L0,4 L-4,7 L-3,2 L-7,-1 L-2,-2 Z`;
  return `<g class="star ${cls}" transform="translate(${cx} ${cy})"><path d="${path}" fill="#fbbf24" stroke="#b45309" stroke-width="0.8" /></g>`;
}

/**
 * RED — climber walking away from the wall, frustrated, alert marks on hold
 */
function redScene() {
  return `
    <svg class="climber-svg climber-red" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${blockGroup()}

      <!-- Alert marks "!!" on starting hold -->
      <g class="alert-marks">
        <text x="74" y="146" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ef4444">!</text>
        <text x="80" y="146" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ef4444">!</text>
      </g>

      <!-- Climber walking away (back view), to the right -->
      <g class="climber-leaving" transform="translate(8 0)">
        <!-- Body -->
        <ellipse cx="120" cy="150" rx="11" ry="16" fill="#7f1d1d"/>
        <!-- Head (back of head) -->
        <circle cx="120" cy="128" r="10" fill="#3a2410"/>
        <!-- Hair line / back of neck -->
        <path d="M111 130 Q120 122 129 130" stroke="#1a1209" stroke-width="2" fill="none"/>
        <!-- Shoulder slump -->
        <line x1="111" y1="142" x2="105" y2="156" stroke="#7f1d1d" stroke-width="6" stroke-linecap="round"/>
        <line x1="129" y1="142" x2="135" y2="156" stroke="#7f1d1d" stroke-width="6" stroke-linecap="round"/>
        <!-- Legs walking -->
        <line x1="116" y1="164" x2="112" y2="180" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
        <line x1="124" y1="164" x2="132" y2="180" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
        <!-- Subtle frustration: hand on neck -->
        <line x1="129" y1="142" x2="124" y2="130" stroke="#7f1d1d" stroke-width="6" stroke-linecap="round"/>
      </g>
    </svg>
  `;
}
