/**
 * POLYGON 2027 — Fond Vectoriel Discret (Thème Blanc Suisse)
 * Grille de points légers réagissant subtilement à la souris
 */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    radius: 160,
  };

  const GRID_SIZE = 55;
  let points = [];

  function initGrid() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    points = [];

    const cols = Math.ceil(width / GRID_SIZE) + 2;
    const rows = Math.ceil(height / GRID_SIZE) + 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        points.push({
          baseX: (i - 1) * GRID_SIZE,
          baseY: (j - 1) * GRID_SIZE,
          x: (i - 1) * GRID_SIZE,
          y: (j - 1) * GRID_SIZE,
          vx: 0,
          vy: 0,
        });
      }
    }
  }

  window.addEventListener('resize', initGrid);

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  function animate() {
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#e2e8f0';

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const dx = mouse.x - p.baseX;
      const dy = mouse.y - p.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius) * 12;
        const angle = Math.atan2(dy, dx);
        p.vx += -Math.cos(angle) * force * 0.15;
        p.vy += -Math.sin(angle) * force * 0.15;
      }

      p.vx += (p.baseX - p.x) * 0.08;
      p.vy += (p.baseY - p.y) * 0.08;
      p.vx *= 0.78;
      p.vy *= 0.78;

      p.x += p.vx;
      p.y += p.vy;

      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }

    requestAnimationFrame(animate);
  }

  initGrid();
  animate();
})();
