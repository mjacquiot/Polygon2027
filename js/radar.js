/**
 * POLYGON 2027 — Moteur Mathématique du Radar Bipolaire
 * Axes diamétraux continus : Pôle A (-100) <---> Neutre (0) au centre <---> Pôle B (+100)
 * Tracé sur 2N rayons : plonge au centre (0) quand un pôle n'est pas soutenu,
 * éliminant toute fausse passerelle entre pôles non reliés.
 * Zéro troncature de texte, équité bilatérale des intitulés, zéro rayon parasite au centre.
 */

class BipolarRadar {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      padding: 135, // Espace suffisant pour les libellés complets multi-lignes
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
    }, options);

    this.axes = [];
    this.candidates = [];
    this.userProfile = null;
    this.isMatchingMode = false;

    // Morphing interpolation
    this.displayScores = {}; // candidateId -> { axisId -> currentScore }

    this.palette = ['#2563EB', '#059669', '#7C3AED', '#D97706'];
    this.hatchPattern = null;

    // Interaction
    this.hoveredThemeIdx = -1;
    this.hoveredPoleSide = null; // 'A' | 'B'
    this.draggingAxisId = null;
    this.onScoreChange = null;

    this.setupEvents();
    this.resize();
    this.startLoop();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // Radius ajusté pour laisser la place aux libellés (avec marge supplémentaire pour étagement radial)
    const isDetailed = this.axes.length > 8;
    const basePadding = isDetailed ? 160 : 125;
    const dynPadding = this.width < 900 ? (basePadding - 25) : basePadding;
    this.radius = Math.max(95, Math.min(this.width, this.height) / 2 - dynPadding);
  }

  setAxes(axes) {
    this.axes = axes;
    this.resize();
    this.initScoresCache();
  }

  setCandidates(candidates) {
    this.candidates = candidates;
    this.initScoresCache();
  }

  setUserProfile(profile) {
    this.userProfile = profile;
    this.initScoresCache();
  }

  setMatchingMode(enabled) {
    this.isMatchingMode = enabled;
  }

  initScoresCache() {
    const all = [...this.candidates];
    if (this.userProfile && !all.some(c => c.id === this.userProfile.id)) {
      all.push(this.userProfile);
    }

    all.forEach(c => {
      if (!this.displayScores[c.id]) {
        this.displayScores[c.id] = {};
      }
      this.axes.forEach(a => {
        const target = (c.scores && typeof c.scores[a.id] === 'number') ? c.scores[a.id] : 0;
        if (typeof this.displayScores[c.id][a.id] !== 'number') {
          this.displayScores[c.id][a.id] = target;
        }
      });
    });
  }

  /**
   * Angle de la droite diamétrale pour le thème k (k = 0..N-1)
   * Réparti sur 180° pour que chaque thème ait sa droite propre.
   */
  getAxisAngle(k) {
    const n = this.axes.length;
    return -Math.PI / 2 + (k * Math.PI) / n;
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resize());

    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handlePointerDown = (pos) => {
      if (!this.isMatchingMode || !this.userProfile) return;
      const nearest = this.getNearestSpoke(pos.x, pos.y);
      if (nearest && nearest.dist < 36) {
        this.draggingAxisId = nearest.axis.id;
        const score = this.updateUserScore(nearest.axis, nearest.themeIdx, pos.x, pos.y);
        this.updateTooltip(nearest.axis, nearest.poleSide, pos, score);
      }
    };

    const handlePointerMove = (pos) => {
      if (this.draggingAxisId) {
        const idx = this.axes.findIndex(a => a.id === this.draggingAxisId);
        if (idx !== -1) {
          const score = this.updateUserScore(this.axes[idx], idx, pos.x, pos.y);
          const poleSide = score >= 0 ? 'B' : 'A';
          this.hoveredThemeIdx = idx;
          this.hoveredPoleSide = poleSide;
          this.updateTooltip(this.axes[idx], poleSide, pos, score);
        }
      } else {
        const nearestPoint = this.getNearestVertex(pos.x, pos.y);
        const nearestSpoke = this.getNearestSpoke(pos.x, pos.y);

        if (nearestPoint && nearestPoint.dist < 26) {
          // Survol précis d'un sommet
          this.hoveredThemeIdx = nearestPoint.themeIdx;
          this.hoveredPoleSide = nearestPoint.poleSide;
          this.canvas.style.cursor = 'pointer';
          this.updateTooltip(nearestPoint.axis, nearestPoint.poleSide, pos, nearestPoint.rawScore);
        } else if (nearestSpoke && nearestSpoke.dist < 26) {
          // Survol de l'axe diamétral : affiche la tendance en direct selon la position du curseur
          this.hoveredThemeIdx = nearestSpoke.themeIdx;
          this.hoveredPoleSide = nearestSpoke.poleSide;
          this.canvas.style.cursor = this.isMatchingMode ? 'grab' : 'crosshair';
          this.updateTooltip(nearestSpoke.axis, nearestSpoke.poleSide, pos, nearestSpoke.projectedScore);
        } else {
          this.hoveredThemeIdx = -1;
          this.hoveredPoleSide = null;
          this.canvas.style.cursor = 'default';
          this.hideTooltip();
        }
      }
    };

    const handlePointerUp = () => {
      this.draggingAxisId = null;
      if (this.canvas) {
        this.canvas.style.cursor = this.isMatchingMode ? 'grab' : 'default';
      }
    };

    this.canvas.addEventListener('mousedown', (e) => handlePointerDown(getCanvasPos(e)));
    window.addEventListener('mousemove', (e) => handlePointerMove(getCanvasPos(e)));
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', (e) => handlePointerDown(getCanvasPos(e)), { passive: true });
    window.addEventListener('touchmove', (e) => handlePointerMove(getCanvasPos(e)), { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  }

  getNearestSpoke(x, y) {
    if (!this.axes.length) return null;
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    const distToCenter = Math.sqrt(dx * dx + dy * dy);
    if (distToCenter > this.radius + 80) return null;

    let bestTheme = null;
    let bestIdx = -1;
    let bestSide = 'B';
    let minPerpDist = Infinity;
    let bestProjScore = 0;

    this.axes.forEach((axis, k) => {
      const phi = this.getAxisAngle(k);
      const ux = Math.cos(phi);
      const uy = Math.sin(phi);

      const proj = dx * ux + dy * uy;
      const perpDist = Math.sqrt(Math.max(0, distToCenter * distToCenter - proj * proj));

      if (perpDist < minPerpDist) {
        minPerpDist = perpDist;
        bestTheme = axis;
        bestIdx = k;
        bestSide = proj >= 0 ? 'B' : 'A';
        bestProjScore = Math.max(-100, Math.min(100, Math.round((proj / this.radius) * 100)));
      }
    });

    return {
      axis: bestTheme,
      themeIdx: bestIdx,
      poleSide: bestSide,
      dist: minPerpDist,
      projectedScore: bestProjScore
    };
  }

  getNearestVertex(x, y) {
    const mainCand = this.candidates[0] || this.userProfile;
    if (!mainCand || !this.axes.length) return null;
    const scores = this.displayScores[mainCand.id];
    if (!scores) return null;

    let bestPoint = null;
    let minDist = Infinity;

    this.axes.forEach((axis, k) => {
      const rawScore = typeof scores[axis.id] === 'number' ? scores[axis.id] : 0;
      if (Math.abs(rawScore) <= 3) return;
      const phi = this.getAxisAngle(k);
      const isB = rawScore >= 0;
      const ptAngle = isB ? phi : phi + Math.PI;
      const dist = (Math.abs(rawScore) / 100) * this.radius;
      const px = this.centerX + Math.cos(ptAngle) * dist;
      const py = this.centerY + Math.sin(ptAngle) * dist;

      const d = Math.hypot(x - px, y - py);
      if (d < minDist) {
        minDist = d;
        bestPoint = {
          axis,
          themeIdx: k,
          poleSide: isB ? 'B' : 'A',
          rawScore,
          dist: d,
          x: px,
          y: py
        };
      }
    });

    return bestPoint;
  }

  updateUserScore(axis, k, x, y) {
    const phi = this.getAxisAngle(k);
    const ux = Math.cos(phi);
    const uy = Math.sin(phi);

    const dx = x - this.centerX;
    const dy = y - this.centerY;

    const proj = dx * ux + dy * uy;
    let score = Math.round((proj / this.radius) * 100);
    score = Math.max(-100, Math.min(100, score));

    if (this.userProfile && this.userProfile.scores) {
      this.userProfile.scores[axis.id] = score;
      if (this.displayScores[this.userProfile.id]) {
        this.displayScores[this.userProfile.id][axis.id] = score;
      }
      if (typeof this.onScoreChange === 'function') {
        this.onScoreChange(axis.id, score);
      }
    }
    return score;
  }

  startLoop() {
    const render = () => {
      this.updateMorphing();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updateMorphing() {
    const all = [...this.candidates];
    if (this.userProfile && !all.some(c => c.id === this.userProfile.id)) {
      all.push(this.userProfile);
    }

    all.forEach(c => {
      if (!this.displayScores[c.id]) this.displayScores[c.id] = {};
      this.axes.forEach(a => {
        const target = (c.scores && typeof c.scores[a.id] === 'number') ? c.scores[a.id] : 0;
        const cur = this.displayScores[c.id][a.id] || 0;
        this.displayScores[c.id][a.id] += (target - cur) * 0.16;
      });
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (!this.axes.length) return;

    this.drawConcentricRings();
    this.drawDiameterLines();

    // Rendu des polygones des candidats
    if (!this.isMatchingMode) {
      this.candidates.forEach((cand, i) => {
        const color = this.palette[i % this.palette.length];
        this.drawCandidatePolygon(cand, color, i === 0 && this.candidates.length === 1);
      });
    }

    // Rendu du polygone Mon Profil
    if (this.isMatchingMode && this.userProfile) {
      this.drawCandidatePolygon(this.userProfile, '#2563EB', true, true);
    }

    this.drawLabels();
  }

  drawConcentricRings() {
    const ctx = this.ctx;
    const rings = [0.25, 0.50, 0.75, 1.00];

    rings.forEach((ratio, idx) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.radius * ratio, 0, Math.PI * 2);

      ctx.strokeStyle = (idx === 3) ? '#cbd5e1' : '#f1f5f9';
      ctx.lineWidth = 1;
      if (idx === 1) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#e2e8f0';
      }
      ctx.stroke();

      if (idx === 1 || idx === 3) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = `500 9px ${this.options.monoFont}`;
        ctx.textAlign = 'center';
        ctx.fillText(`${ratio * 100}%`, this.centerX, this.centerY - this.radius * ratio - 3);
      }
      ctx.restore();
    });

    // Point Neutre Central
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = `600 10px ${this.options.monoFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('Neutre (0)', this.centerX, this.centerY + 16);
  }

  drawDiameterLines() {
    const ctx = this.ctx;

    this.axes.forEach((axis, k) => {
      const phi = this.getAxisAngle(k);
      const ux = Math.cos(phi);
      const uy = Math.sin(phi);

      const xA = this.centerX - ux * this.radius;
      const yA = this.centerY - uy * this.radius;
      const xB = this.centerX + ux * this.radius;
      const yB = this.centerY + uy * this.radius;

      ctx.beginPath();
      ctx.moveTo(xA, yA);
      ctx.lineTo(xB, yB);

      const isHover = (this.hoveredThemeIdx === k);
      ctx.strokeStyle = isHover ? '#3b82f6' : '#e2e8f0';
      ctx.lineWidth = isHover ? 2 : 1;
      ctx.stroke();
    });
  }

  /**
   * Tracé du polygone par Cycle Thématique Naturel :
   * Chaque axe k est relié séquentiellement à ses deux axes voisins (k-1 et k+1).
   * L'ordre des liaisons respecte strictement la continuité des piliers politiques :
   * Économie -> Finances -> Écologie -> Souveraineté -> Frontières -> Ordre -> Société -> Institutions -> Économie.
   * Lorsqu'un candidat oscille entre Pôle A et Pôle B, le trait traverse naturellement
   * le centre pour rejoindre la rive opposée, formant une signature géométrique honnête et vivante.
   */
  drawCandidatePolygon(cand, color, isMain = false, isInteractive = false) {
    const ctx = this.ctx;
    const scores = this.displayScores[cand.id];
    if (!scores) return;

    const N = this.axes.length;
    if (N < 3) return;

    // 1. Calculer les coordonnées de chaque thème dans l'ORDRE THÉMATIQUE FIXE (k = 0..N-1)
    const themePoints = [];
    for (let k = 0; k < N; k++) {
      const axis = this.axes[k];
      const rawScore = typeof scores[axis.id] === 'number' ? scores[axis.id] : 0;
      const phi = this.getAxisAngle(k);
      const isB = rawScore >= 0;
      const ptAngle = isB ? phi : phi + Math.PI;
      const dist = (Math.abs(rawScore) / 100) * this.radius;

      themePoints.push({
        axis: axis,
        themeIdx: k,
        rawScore: rawScore,
        ptAngle: ptAngle,
        dist: dist,
        x: this.centerX + Math.cos(ptAngle) * dist,
        y: this.centerY + Math.sin(ptAngle) * dist,
        isActive: Math.abs(rawScore) > 3
      });
    }

    // 2. Remplissage facetté triangulaire (Centre -> P_k -> P_{k+1})
    // Crée de superbes reflets translucides géométriques (effet cristal) lors des croisements
    ctx.save();
    for (let k = 0; k < N; k++) {
      const p1 = themePoints[k];
      const p2 = themePoints[(k + 1) % N];

      ctx.beginPath();
      ctx.moveTo(this.centerX, this.centerY);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();

      ctx.fillStyle = this.hexToRgba(color, isMain ? 0.18 : 0.10);
      ctx.fill();
    }

    // Voile d'ensemble pour unifier la surface des aires
    ctx.beginPath();
    themePoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = this.hexToRgba(color, isMain ? 0.10 : 0.05);
    ctx.fill();
    ctx.restore();

    // 3. Sommets : points uniquement (sans aucune barre de liaison ni badge permanent)
    themePoints.forEach(p => {
      if (p.isActive) {
        ctx.save();
        const isHovered = (this.hoveredThemeIdx === p.themeIdx);
        const rDot = isHovered ? 7.5 : (isInteractive ? 6 : (isMain ? 5 : 4));

        ctx.beginPath();
        ctx.arc(p.x, p.y, rDot, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = color;
        ctx.lineWidth = isHovered ? 3.5 : 2.5;
        ctx.fill();
        ctx.stroke();

        // Afficher le détail du % UNIQUEMENT au survol du point
        if (isHovered) {
          const badge = `${p.rawScore > 0 ? '+' : ''}${Math.round(p.rawScore)}%`;
          ctx.font = `700 11px ${this.options.monoFont}`;
          const tw = ctx.measureText(badge).width;
          const offX = Math.cos(p.ptAngle) * 20;
          const offY = Math.sin(p.ptAngle) * 20;
          const bx = p.x + offX;
          const by = p.y + offY;

          // Bulle sombre élégante avec ombre portée
          ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(bx - tw / 2 - 7, by - 11, tw + 14, 22, 6);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badge, bx, by);
        }
        ctx.restore();
      }
    });
  }

  /**
   * Affichage équitable et lisible des libellés aux deux extrémités
   * Anti-collision par étagement radial automatique en mode détaillé (18 axes).
   * Libellés courts (1-2 mots), typographie nette, équilibre bilatéral.
   */
  drawLabels() {
    const ctx = this.ctx;
    const isDetailed = this.axes.length > 8;

    this.axes.forEach((axis, k) => {
      const phi = this.getAxisAngle(k);
      const ux = Math.cos(phi);
      const uy = Math.sin(phi);

      const isHover = (this.hoveredThemeIdx === k);

      // En mode détaillé (18 axes, 10° d'écart), alternance de rayon intérieur (14px) et extérieur déporté (58px)
      // pour séparer physiquement les textes voisins et éliminer toute collision de libellés.
      const isStaggered = isDetailed && (k % 2 === 1);
      const offset = isStaggered ? 58 : 14;

      // Tracé d'une fine tige repère vers l'étage extérieur pour relier visuellement le pôle au rayon
      if (isStaggered) {
        ctx.save();
        ctx.strokeStyle = isHover ? '#3b82f6' : '#cbd5e1';
        ctx.lineWidth = isHover ? 1.5 : 1;

        // Guide Pôle B
        ctx.beginPath();
        ctx.moveTo(this.centerX + ux * this.radius, this.centerY + uy * this.radius);
        ctx.lineTo(this.centerX + ux * (this.radius + 44), this.centerY + uy * (this.radius + 44));
        ctx.stroke();

        // Repère Pôle B
        ctx.beginPath();
        ctx.arc(this.centerX + ux * (this.radius + 44), this.centerY + uy * (this.radius + 44), 1.5, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? '#2563eb' : '#94a3b8';
        ctx.fill();

        // Guide Pôle A
        ctx.beginPath();
        ctx.moveTo(this.centerX - ux * this.radius, this.centerY - uy * this.radius);
        ctx.lineTo(this.centerX - ux * (this.radius + 44), this.centerY - uy * (this.radius + 44));
        ctx.stroke();

        // Repère Pôle A
        ctx.beginPath();
        ctx.arc(this.centerX - ux * (this.radius + 44), this.centerY - uy * (this.radius + 44), 1.5, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? '#2563eb' : '#94a3b8';
        ctx.fill();

        ctx.restore();
      }

      // Pôle B (Extrémité positive)
      const xB = this.centerX + ux * (this.radius + offset);
      const yB = this.centerY + uy * (this.radius + offset);
      this.drawFullBipolarLabel(ctx, axis.name, axis.pole_b, xB, yB, ux, uy, isHover, isDetailed);

      // Pôle A (Extrémité opposée négative)
      const xA = this.centerX - ux * (this.radius + offset);
      const yA = this.centerY - uy * (this.radius + offset);
      this.drawFullBipolarLabel(ctx, axis.name, axis.pole_a, xA, yA, -ux, -uy, isHover, isDetailed);
    });
  }

  /**
   * Dessine un libellé de pôle propre, sans chevauchement :
   * - En mode Synthèse ET en mode Détaillé : grand thème visible en majuscules + sous-thème clarifié en 3-4 mots.
   * - Alignement géométrique strict, anti-collision par étagement et calcul automatique de hauteur.
   */
  drawFullBipolarLabel(ctx, themeName, poleText, x, y, ux, uy, isHover, isDetailed) {
    ctx.save();
    let align = 'center';
    if (ux > 0.35) align = 'left';
    else if (ux < -0.35) align = 'right';

    let baseline = 'middle';
    if (uy > 0.28) baseline = 'top';
    else if (uy < -0.28) baseline = 'bottom';

    ctx.textAlign = align;
    ctx.textBaseline = 'top';

    const maxChars = isDetailed ? 18 : 22;
    const lines = this.wrapTextLines(poleText, maxChars);

    const themeFontSize = isDetailed ? 8.5 : 9.5;
    const themeLineHeight = isDetailed ? 10.5 : 12.5;
    const poleFontSize = isDetailed ? 9.5 : 11;
    const poleLineHeight = isDetailed ? 11.5 : 13.5;
    const gap = isDetailed ? 2 : 3;

    const totalHeight = themeLineHeight + gap + (lines.length * poleLineHeight);

    let startY = y;
    if (baseline === 'bottom') {
      startY = y - totalHeight;
    } else if (baseline === 'middle') {
      startY = y - (totalHeight / 2);
    } // if 'top', startY = y

    // 1. Grand Thème (en majuscules, toujours présent en Synthèse et Détaillé)
    ctx.font = `700 ${themeFontSize}px ${this.options.fontFamily}`;
    ctx.fillStyle = isHover ? '#2563eb' : '#64748b';
    ctx.fillText(themeName.toUpperCase(), x, startY);

    // 2. Sous-thème (précision 3-4 mots)
    const textStartY = startY + themeLineHeight + gap;
    ctx.font = isHover ? `700 ${poleFontSize + 0.5}px ${this.options.fontFamily}` : `600 ${poleFontSize}px ${this.options.fontFamily}`;
    ctx.fillStyle = isHover ? '#1e40af' : '#0f172a';

    lines.forEach((line, idx) => {
      ctx.fillText(line, x, textStartY + (idx * poleLineHeight));
    });

    ctx.restore();
  }

  wrapTextLines(str, maxCharsPerLine = 22) {
    if (!str) return [];
    if (str.length <= maxCharsPerLine) return [str];

    const words = str.split(' ');
    const lines = [];
    let curLine = '';

    words.forEach(w => {
      if ((curLine + ' ' + w).trim().length <= maxCharsPerLine) {
        curLine = (curLine + ' ' + w).trim();
      } else {
        if (curLine) lines.push(curLine);
        curLine = w;
      }
    });
    if (curLine) lines.push(curLine);
    return lines;
  }

  getTierInfo(axis, score) {
    if (!axis || !axis.tiers) return null;
    const abs = Math.abs(score);
    if (abs <= 5) {
      return {
        label: "Équilibre / Neutre",
        badgeClass: "tier-neutral",
        desc: axis.tiers.neutral || "Position d'équilibre ou de compromis entre les deux pôles."
      };
    }

    const isB = score > 0;
    const list = isB ? axis.tiers.pole_b : axis.tiers.pole_a;
    if (!list || !list.length) return null;

    let tier = list[0];
    let badgeClass = 'tier-modere';
    if (abs > 66) {
      tier = list[2] || list[list.length - 1];
      badgeClass = 'tier-rupture';
    } else if (abs > 33) {
      tier = list[1] || list[0];
      badgeClass = 'tier-affirme';
    }

    const poleName = isB ? axis.pole_b : axis.pole_a;
    return {
      label: tier.label,
      badgeClass: badgeClass,
      desc: tier.desc,
      poleName: poleName
    };
  }

  updateTooltip(axis, poleSide, pos, liveScore = null) {
    const tooltip = document.getElementById('radar-tooltip');
    if (!tooltip || !axis) return;

    let score;
    if (typeof liveScore === 'number') {
      score = liveScore;
    } else {
      const mainCand = this.candidates[0] || this.userProfile;
      score = (mainCand && mainCand.scores && typeof mainCand.scores[axis.id] === 'number')
        ? mainCand.scores[axis.id]
        : (this.userProfile ? this.userProfile.scores[axis.id] : 0);
    }

    let orientation = 'Équilibre / Neutre (0%)';
    if (score > 5) orientation = `+${Math.round(score)}% vers ${axis.pole_b}`;
    else if (score < -5) orientation = `${Math.round(score)}% vers ${axis.pole_a}`;

    const catBadge = axis.category ? `<span class="tooltip-cat">[${axis.category}]</span>` : '';
    const tierInfo = this.getTierInfo(axis, score);

    let tierHtml = '';
    if (tierInfo) {
      tierHtml = `
        <div class="tooltip-tier-card">
          <div class="tooltip-tier-header">
            <span class="tooltip-tier-badge ${tierInfo.badgeClass}">${tierInfo.label}</span>
            <span class="tooltip-tier-score">${Math.abs(Math.round(score))}%</span>
          </div>
          <div class="tooltip-tier-desc">${tierInfo.desc}</div>
        </div>
      `;
    }

    tooltip.innerHTML = `
      <div class="tooltip-title">${axis.name} ${catBadge}</div>
      <div class="tooltip-score">${orientation}</div>
      ${tierHtml}
      <div class="tooltip-poles">
        <span>◀ ${axis.pole_a}</span>
        <span>${axis.pole_b} ▶</span>
      </div>
      ${(!tierInfo && axis.desc) ? `<div class="tooltip-desc">${axis.desc}</div>` : ''}
    `;

    // Positionnement dynamique sans sortir des bords de l'écran
    const ttHalfWidth = 155;
    let left = pos.x;
    let top = pos.y - 15;

    if (left < ttHalfWidth + 10) left = ttHalfWidth + 10;
    else if (left > this.width - ttHalfWidth - 10) left = this.width - ttHalfWidth - 10;

    if (top < 140) top = pos.y + 25; // Si trop haut, afficher sous le curseur

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('visible');
  }

  hideTooltip() {
    const tooltip = document.getElementById('radar-tooltip');
    if (tooltip) tooltip.classList.remove('visible');
  }

  hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  exportToPNG() {
    const exportCanvas = document.createElement('canvas');
    const expW = 1500;
    const expH = 1500;
    exportCanvas.width = expW;
    exportCanvas.height = expH;
    const expCtx = exportCanvas.getContext('2d');

    expCtx.fillStyle = '#FFFFFF';
    expCtx.fillRect(0, 0, expW, expH);

    expCtx.font = "bold 32px 'Space Grotesk'";
    expCtx.fillStyle = '#0F172A';
    expCtx.textAlign = 'left';
    expCtx.fillText('POLYGON 2027', 70, 75);

    expCtx.font = "14px 'JetBrains Mono'";
    expCtx.fillStyle = '#2563EB';
    expCtx.fillText('MODÉLISATION VECTORIELLE DES PROGRAMMES (NEUTRE AU CENTRE)', 70, 102);

    expCtx.drawImage(this.canvas, 50, 120, 1400, 1400);

    expCtx.font = "12px 'JetBrains Mono'";
    expCtx.fillStyle = '#94A3B8';
    expCtx.textAlign = 'center';
    expCtx.fillText('POLYGON 2027 • Données comparateur IFRAP & Déclarations officielles', expW / 2, expH - 40);

    return exportCanvas.toDataURL('image/png');
  }
}
