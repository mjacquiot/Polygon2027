/**
 * POLYGON 2027 — Contrôleur Principal
 * Navigation par liste latérale épurée & défilement des candidats à la molette
 */

class PolygonApp {
  constructor() {
    this.axes = [];
    this.allCandidates = [];
    this.selectedCandidates = []; // Array of candidate IDs
    this.viewMode = 'synthesis'; // 'synthesis' (8) | 'expert' (18)
    this.interactMode = 'single'; // 'single' | 'compare' | 'matching'

    this.palette = ['#2563EB', '#059669', '#7C3AED', '#D97706'];

    // Profil utilisateur pour le mode Matching et superposition
    this.userProfile = {
      id: 'user-profile',
      name: 'Mon Profil',
      role: 'Profil Citoyen',
      color: '#2563EB',
      scores: {},
      isUser: true,
      img: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23EFF6FF' stroke='%232563EB' stroke-width='6'/><path d='M50 48a16 16 0 1 0 0-32 16 16 0 0 0 0 32zm0 8c-18 0-32 10-32 22h64c0-12-14-22-32-22z' fill='%232563EB'/></svg>"
    };

    this.affinities = {}; // candId -> similarity score (0..100)
    this.rankings = [];

    this.radar = null;
    this.lastWheelTime = 0;
    this.init();
  }

  async init() {
    this.loadData();
    this.initRadar();
    this.initUserProfile();
    this.renderCandidatesList();
    this.renderDrawerSliders();
    this.setupListeners();
    this.setupWheelScroll();
    this.updateUI();
  }

  loadData() {
    if (window.POLYGON_DATA && window.POLYGON_DATA.axes && window.POLYGON_DATA.candidates) {
      this.axes = window.POLYGON_DATA.axes;
      this.allCandidates = window.POLYGON_DATA.candidates;
    } else {
      console.warn('Fallback local');
      this.loadFallbackData();
    }

    if (this.allCandidates.length > 0) {
      this.selectedCandidates = [this.allCandidates[0].id];
    }
  }

  loadFallbackData() {
    this.axes = [
      { id: "S1", name: "Économie", is_synthesis: true, pole_a: "Hausse salaires & pouvoir d'achat", pole_b: "Alléger charges des entreprises" },
      { id: "S2", name: "Budget & Dette", is_synthesis: true, pole_a: "Réduire dette et dépenses", pole_b: "Financer urgences par déficit" }
    ];
    this.allCandidates = [
      { id: "edouard-philippe", name: "Édouard Philippe", role: "Horizons", scores: { S1: 65, S2: -85 }, img: "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/abaca_993338_013.jpg?h=58c8a5e7&itok=O_Ho7LKJ" }
    ];
  }

  initRadar() {
    this.radar = new BipolarRadar('radar-canvas');
    this.radar.onScoreChange = (axisId, score) => {
      this.onUserVertexDrag(axisId, score);
    };
  }

  initUserProfile() {
    this.axes.forEach(a => {
      this.userProfile.scores[a.id] = 0; // Défaut au centre (Équilibre)
    });
    this.radar.setUserProfile(this.userProfile);
  }

  getActiveAxes() {
    if (this.viewMode === 'synthesis') {
      return this.axes.filter(a => a.is_synthesis);
    }
    return this.axes;
  }

  getAllSelectableCandidates() {
    return [this.userProfile, ...this.allCandidates];
  }

  updateUI() {
    const activeAxes = this.getActiveAxes();
    this.radar.setAxes(activeAxes);

    const allSelectable = this.getAllSelectableCandidates();
    const activeCandidates = allSelectable.filter(c => 
      this.selectedCandidates.includes(c.id)
    );
    this.radar.setCandidates(activeCandidates);

    // Mise à jour de la carte flottante discrète
    const floatingCard = document.getElementById('floating-card');
    const floatingAvatar = document.getElementById('floating-avatar');
    const floatingName = document.getElementById('floating-name');
    const floatingSub = document.getElementById('floating-sub');

    if (this.interactMode === 'matching') {
      if (floatingCard) floatingCard.style.display = 'none';
      const dock = document.getElementById('matching-dock');
      if (dock) dock.style.display = 'flex';
      this.updateMatchingRankings();
    } else {
      const dock = document.getElementById('matching-dock');
      if (dock) dock.style.display = 'none';
      if (floatingCard && activeCandidates.length > 0) {
        floatingCard.style.display = 'flex';
        const cand = activeCandidates[0];
        if (activeCandidates.length === 1) {
          floatingAvatar.src = cand.img;
          floatingName.textContent = cand.name;
          floatingSub.textContent = cand.role || 'Programme 2027';
        } else {
          floatingAvatar.src = cand.img;
          floatingName.textContent = `${activeCandidates.length} Profils Superposés`;
          floatingSub.textContent = activeCandidates.map(c => c.name.split(' ').pop()).join(' • ');
        }
      }
    }

    // Mise à jour visuelle des sélections dans la barre latérale gauche
    this.updateSidebarSelection();
  }

  updateSidebarSelection() {
    document.querySelectorAll('.cand-item').forEach(item => {
      const id = item.dataset.id;
      const isSelected = this.selectedCandidates.includes(id);
      item.classList.toggle('active', isSelected);
      const dot = item.querySelector('.cand-item-dot');
      if (dot) {
        if (isSelected) {
          const colorIdx = this.selectedCandidates.indexOf(id);
          dot.style.backgroundColor = this.palette[colorIdx % this.palette.length];
        } else {
          dot.style.backgroundColor = 'transparent';
        }
      }

      // Afficher l'affinité si calculée
      const affBadge = item.querySelector('.cand-item-affinity');
      if (affBadge && typeof this.affinities[id] === 'number') {
        const aff = this.affinities[id];
        affBadge.textContent = `${aff}%`;
        affBadge.style.display = 'inline-block';
        affBadge.classList.toggle('high', aff >= 70);
        affBadge.classList.toggle('mid', aff >= 50 && aff < 70);
      }
    });
  }

  renderCandidatesList() {
    const container = document.getElementById('candidates-list');
    if (!container) return;
    container.innerHTML = '';

    // 1. Mon Profil (épinglé au sommet de la liste)
    const isUserSelected = this.selectedCandidates.includes(this.userProfile.id);
    const userItem = document.createElement('div');
    userItem.className = `cand-item user-item ${isUserSelected ? 'active' : ''}`;
    userItem.dataset.id = this.userProfile.id;
    userItem.title = "Votre profil citoyen — Cliquez pour afficher seul ou superposer";

    const userColorIdx = this.selectedCandidates.indexOf(this.userProfile.id);
    const userDotColor = (userColorIdx > -1) ? this.palette[userColorIdx % this.palette.length] : 'transparent';

    userItem.innerHTML = `
      <span class="cand-item-dot" style="background-color: ${userDotColor};"></span>
      <img class="cand-item-avatar" src="${this.userProfile.img}" alt="Mon Profil">
      <span class="cand-item-name" style="font-weight: 700; color: #2563EB;">Mon Profil</span>
      <span style="font-size: 9.5px; font-weight: 700; color: #2563EB; background: #dbeafe; padding: 2px 6px; border-radius: 4px;">Citoyen</span>
    `;

    userItem.addEventListener('click', () => {
      this.handleCandidateClick(this.userProfile.id);
    });

    container.appendChild(userItem);

    // Séparateur de section
    const divider = document.createElement('div');
    divider.className = 'candidates-divider';
    divider.textContent = `Candidats (${this.allCandidates.length})`;
    container.appendChild(divider);

    // 2. Liste de tous les candidats officiels
    this.allCandidates.forEach(cand => {
      const isSelected = this.selectedCandidates.includes(cand.id);
      const item = document.createElement('div');
      item.className = `cand-item ${isSelected ? 'active' : ''}`;
      item.dataset.id = cand.id;

      const aff = typeof this.affinities[cand.id] === 'number' ? this.affinities[cand.id] : null;
      const affClass = aff !== null ? (aff >= 70 ? 'high' : (aff >= 50 ? 'mid' : '')) : '';

      const candColorIdx = this.selectedCandidates.indexOf(cand.id);
      const dotColor = (candColorIdx > -1) ? this.palette[candColorIdx % this.palette.length] : 'transparent';

      item.innerHTML = `
        <span class="cand-item-dot" style="background-color: ${dotColor};"></span>
        <img class="cand-item-avatar" src="${cand.img}" alt="${cand.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=F1F5F9&color=0F172A'">
        <span class="cand-item-name">${cand.name}</span>
        <span class="cand-item-affinity ${affClass}" style="display: ${aff !== null ? 'inline-block' : 'none'};">${aff !== null ? aff + '%' : ''}</span>
      `;

      item.addEventListener('click', () => {
        this.handleCandidateClick(cand.id);
      });

      container.appendChild(item);
    });
  }

  handleCandidateClick(candId) {
    if (this.interactMode === 'matching') {
      if (candId === this.userProfile.id) {
        return; // Déjà sur Mon Profil en mode sculpteur
      }
      // Cliquer sur un candidat quitte le mode matching direct et bascule en solo pour l'analyser
      this.setInteractMode('single');
      this.selectedCandidates = [candId];
    } else if (this.interactMode === 'compare') {
      // Mode Superposition : toggle dans la superposition (jusqu'à 4 profils simultanés, y compris Mon Profil !)
      const idx = this.selectedCandidates.indexOf(candId);
      if (idx > -1) {
        if (this.selectedCandidates.length > 1) {
          this.selectedCandidates.splice(idx, 1);
        }
      } else {
        if (this.selectedCandidates.length < 4) {
          this.selectedCandidates.push(candId);
        } else {
          this.selectedCandidates.shift();
          this.selectedCandidates.push(candId);
        }
      }
    } else {
      // Mode Solo : sélectionne uniquement ce candidat ou Mon Profil
      this.selectedCandidates = [candId];
    }

    this.updateUI();
    this.scrollActiveCandidateIntoView(candId);
  }

  scrollActiveCandidateIntoView(candId) {
    const item = document.querySelector(`.cand-item[data-id="${candId}"]`);
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Défilement fluide des candidats au scroll de la molette sur le polygone
   */
  setupWheelScroll() {
    const arena = document.getElementById('radar-arena');
    if (!arena) return;

    arena.addEventListener('wheel', (e) => {
      // Si en mode matching, laisser l'utilisateur sculpter les points au drag
      if (this.interactMode === 'matching') return;

      // Empêcher le scroll de la page entière
      e.preventDefault();

      const now = Date.now();
      // Throttle à 240ms pour un passage net et fluide sans défilement frénétique
      if (now - this.lastWheelTime < 240) return;

      if (Math.abs(e.deltaY) > 8) {
        this.lastWheelTime = now;
        if (e.deltaY > 0) {
          this.cycleCandidate(1); // Molette vers le bas -> candidat suivant
        } else {
          this.cycleCandidate(-1); // Molette vers le haut -> candidat précédent
        }
      }
    }, { passive: false });
  }

  cycleCandidate(direction) {
    const allSelectable = this.getAllSelectableCandidates();
    if (!allSelectable.length) return;

    const currentId = this.selectedCandidates[0] || allSelectable[0].id;
    let idx = allSelectable.findIndex(c => c.id === currentId);

    if (idx === -1) idx = 0;
    let nextIdx = (idx + direction + allSelectable.length) % allSelectable.length;

    const nextCand = allSelectable[nextIdx];
    this.selectedCandidates = [nextCand.id];
    
    // Si on était en compare avec 1 seul, repasser en single
    if (this.interactMode === 'compare') {
      this.interactMode = 'single';
      const btnSingle = document.getElementById('btn-mode-single');
      const btnCompare = document.getElementById('btn-mode-compare');
      if (btnSingle) btnSingle.classList.add('active');
      if (btnCompare) btnCompare.classList.remove('active');
    }

    this.updateUI();
    this.scrollActiveCandidateIntoView(nextCand.id);
  }

  setInteractMode(mode) {
    this.interactMode = mode;

    const btnSingle = document.getElementById('btn-mode-single');
    const btnCompare = document.getElementById('btn-mode-compare');
    const btnMatching = document.getElementById('btn-mode-matching');

    if (btnSingle) btnSingle.classList.toggle('active', mode === 'single');
    if (btnCompare) btnCompare.classList.toggle('active', mode === 'compare');
    if (btnMatching) btnMatching.classList.toggle('active', mode === 'matching');

    this.radar.setMatchingMode(mode === 'matching');

    if (mode === 'matching') {
      // En mode matching, focaliser sur Mon Profil
      if (!this.selectedCandidates.includes(this.userProfile.id)) {
        this.selectedCandidates = [this.userProfile.id];
      }
    } else if (mode === 'single' && this.selectedCandidates.length > 1) {
      this.selectedCandidates = [this.selectedCandidates[0]];
    } else if (mode === 'compare' && this.selectedCandidates.length < 2) {
      const all = this.getAllSelectableCandidates();
      this.selectedCandidates = [this.userProfile.id, all[1].id];
    }

    this.updateUI();
  }

  /**
   * Calcul et affichage de TOUTE la liste des candidats classés par affinité
   */
  updateMatchingRankings() {
    const container = document.getElementById('matching-pills');
    if (!container) return;

    const activeAxes = this.getActiveAxes();
    const rankings = [];

    this.allCandidates.forEach(cand => {
      let sumSqDiff = 0;
      let count = 0;

      activeAxes.forEach(axis => {
        const userScore = this.userProfile.scores[axis.id] || 0;
        const candScore = cand.scores && typeof cand.scores[axis.id] === 'number' ? cand.scores[axis.id] : 0;
        const diff = userScore - candScore;
        sumSqDiff += diff * diff;
        count++;
      });

      const maxPossibleDist = Math.sqrt(count * 40000);
      const dist = Math.sqrt(sumSqDiff);
      const similarity = Math.max(0, Math.round((1 - dist / maxPossibleDist) * 100));

      this.affinities[cand.id] = similarity;
      rankings.push({
        candidate: cand,
        similarity: similarity
      });
    });

    rankings.sort((a, b) => b.similarity - a.similarity);
    this.rankings = rankings;

    container.innerHTML = '';

    // Affichage exhaustif de TOUS les 12 candidats classés de 1 à 12
    rankings.forEach((item, idx) => {
      const pill = document.createElement('div');
      const aff = item.similarity;
      const matchClass = aff >= 70 ? 'top-match' : (aff >= 50 ? 'mid-match' : 'low-match');
      pill.className = `matching-rank-pill ${matchClass}`;
      pill.title = `${item.candidate.name} (${item.candidate.role}) — Cliquez pour superposer avec Mon Profil`;

      pill.innerHTML = `
        <span class="rank-num">#${idx + 1}</span>
        <img src="${item.candidate.img}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">
        <span>${item.candidate.name.split(' ').pop()}</span>
        <strong>${aff}%</strong>
      `;

      // Clic sur un pill : active la superposition immédiate avec Mon Profil !
      pill.addEventListener('click', () => {
        this.interactMode = 'compare';
        const btnSingle = document.getElementById('btn-mode-single');
        const btnCompare = document.getElementById('btn-mode-compare');
        const btnMatching = document.getElementById('btn-mode-matching');
        if (btnSingle) btnSingle.classList.remove('active');
        if (btnCompare) btnCompare.classList.add('active');
        if (btnMatching) btnMatching.classList.remove('active');
        this.radar.setMatchingMode(false);
        this.selectedCandidates = [this.userProfile.id, item.candidate.id];
        this.updateUI();
      });

      container.appendChild(pill);
    });

    // Mettre à jour en temps réel les badges d'affinité dans la liste latérale gauche
    this.updateSidebarSelection();
  }

  onUserVertexDrag(axisId, score) {
    const slider = document.getElementById(`slider-${axisId}`);
    if (slider) {
      slider.value = score;
      const valLabel = document.getElementById(`slider-val-${axisId}`);
      if (valLabel) valLabel.textContent = `${score > 0 ? '+' : ''}${score}%`;
      const axis = this.axes.find(a => a.id === axisId);
      if (axis && this.radar) {
        const tier = this.radar.getTierInfo(axis, score);
        const hintEl = document.getElementById(`slider-hint-${axisId}`);
        const badgeEl = document.getElementById(`slider-badge-${axisId}`);
        if (tier && hintEl) {
          hintEl.textContent = tier.desc;
          if (badgeEl) badgeEl.innerHTML = `<span class="tier-pill ${tier.badgeClass}">${tier.label}</span>`;
        } else if (hintEl) {
          hintEl.textContent = axis.desc || '';
          if (badgeEl) badgeEl.innerHTML = '';
        }
      }
    }
    this.updateMatchingRankings();
  }

  renderDrawerSliders() {
    const grid = document.getElementById('slider-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const activeAxes = this.getActiveAxes();

    activeAxes.forEach(axis => {
      const item = document.createElement('div');
      item.className = 'slider-item';

      const currentVal = (this.userProfile && typeof this.userProfile.scores[axis.id] === 'number')
        ? this.userProfile.scores[axis.id]
        : 0;

      const initialTier = this.radar ? this.radar.getTierInfo(axis, currentVal) : null;
      const initialDesc = initialTier ? initialTier.desc : (axis.desc || '');
      const initialBadge = initialTier ? `<span class="tier-pill ${initialTier.badgeClass}">${initialTier.label}</span>` : '';

      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 600;">
          <span>${axis.name}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span id="slider-badge-${axis.id}">${initialBadge}</span>
            <span id="slider-val-${axis.id}" style="font-family: var(--font-mono); color: var(--cand-blue); font-size: 11px;">${currentVal > 0 ? '+' : ''}${currentVal}%</span>
          </div>
        </div>
        <div class="slider-labels">
          <span>${axis.pole_a}</span>
          <span>${axis.pole_b}</span>
        </div>
        <input type="range" class="slider-input" id="slider-${axis.id}" min="-100" max="100" value="${currentVal}">
        <div class="slider-tier-hint" id="slider-hint-${axis.id}">${initialDesc}</div>
      `;

      const input = item.querySelector('input');
      const valLabel = item.querySelector(`#slider-val-${axis.id}`);
      const hintEl = item.querySelector(`#slider-hint-${axis.id}`);
      const badgeEl = item.querySelector(`#slider-badge-${axis.id}`);

      input.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        valLabel.textContent = `${val > 0 ? '+' : ''}${val}%`;
        this.userProfile.scores[axis.id] = val;
        if (this.radar) {
          this.radar.displayScores[this.userProfile.id][axis.id] = val;
          const tier = this.radar.getTierInfo(axis, val);
          if (tier && hintEl) {
            hintEl.textContent = tier.desc;
            if (badgeEl) badgeEl.innerHTML = `<span class="tier-pill ${tier.badgeClass}">${tier.label}</span>`;
          } else if (hintEl) {
            hintEl.textContent = axis.desc || '';
            if (badgeEl) badgeEl.innerHTML = '';
          }
        }
        this.updateMatchingRankings();
      });

      grid.appendChild(item);
    });
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const tabSynthesis = document.getElementById('tab-synthesis');
    const tabExpert = document.getElementById('tab-expert');
    const floatingToggle = document.getElementById('floating-toggle-view');

    if (tabSynthesis && tabExpert) {
      tabSynthesis.classList.toggle('active', mode === 'synthesis');
      tabExpert.classList.toggle('active', mode === 'expert');
    }

    if (floatingToggle) {
      floatingToggle.textContent = (mode === 'synthesis')
        ? '🔬 Passer au Mode Détaillé (18 axes) ➔'
        : '🎯 Revenir au Mode Synthèse (8 axes) ➔';
    }

    this.renderDrawerSliders();
    this.updateUI();
  }

  setupListeners() {
    // Switcher Synthèse / Détaillé
    const tabSynthesis = document.getElementById('tab-synthesis');
    const tabExpert = document.getElementById('tab-expert');
    const floatingToggle = document.getElementById('floating-toggle-view');

    if (tabSynthesis) {
      tabSynthesis.addEventListener('click', () => this.setViewMode('synthesis'));
    }
    if (tabExpert) {
      tabExpert.addEventListener('click', () => this.setViewMode('expert'));
    }
    if (floatingToggle) {
      floatingToggle.addEventListener('click', () => {
        this.setViewMode(this.viewMode === 'synthesis' ? 'expert' : 'synthesis');
      });
    }

    // Modes
    const btnSingle = document.getElementById('btn-mode-single');
    const btnCompare = document.getElementById('btn-mode-compare');
    const btnMatching = document.getElementById('btn-mode-matching');

    if (btnSingle) btnSingle.addEventListener('click', () => this.setInteractMode('single'));
    if (btnCompare) btnCompare.addEventListener('click', () => this.setInteractMode('compare'));
    if (btnMatching) btnMatching.addEventListener('click', () => this.setInteractMode('matching'));

    // Toggle drawer sliders
    const toggleSlidersBtn = document.getElementById('toggle-sliders-btn');
    const drawer = document.getElementById('slider-drawer');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    if (toggleSlidersBtn && drawer) {
      toggleSlidersBtn.addEventListener('click', () => drawer.classList.toggle('open'));
    }
    if (closeDrawerBtn && drawer) {
      closeDrawerBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }

    // Export PNG
    const exportBtn = document.getElementById('export-btn');
    const modal = document.getElementById('export-modal');
    const modalClose = document.getElementById('modal-close');
    const downloadBtn = document.getElementById('download-png-btn');
    const previewImg = document.getElementById('export-preview-img');

    if (exportBtn && modal) {
      exportBtn.addEventListener('click', () => {
        const dataUrl = this.radar.exportToPNG();
        if (previewImg) previewImg.src = dataUrl;
        modal.classList.add('open');
      });

      if (modalClose) {
        modalClose.addEventListener('click', () => modal.classList.remove('open'));
      }

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });

      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          const dataUrl = this.radar.exportToPNG();
          const link = document.createElement('a');
          link.download = `POLYGON_2027_${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        });
      }
    }
  }
}

// Lancement au chargement
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PolygonApp();
});
