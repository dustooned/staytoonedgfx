// confetti.js — canvas burst on chapter completion
// Call window.triggerConfetti() to fire.

(function () {

  const COLORS  = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c','#ffffff'];
  const COUNT   = 90;
  const GRAVITY = 0.35;
  const DECAY   = 0.97;

  window.triggerConfetti = function () {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position:      'fixed',
      top:           '0',
      left:          '0',
      width:         '100%',
      height:        '100%',
      pointerEvents: 'none',
      zIndex:        '99999',
    });
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const particles = Array.from({ length: COUNT }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height * 0.4,
      vx:   (Math.random() - 0.5) * 7,
      vy:   (Math.random() * -6) - 2,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:  Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      alpha: 1,
    }));

    let raf;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;

      for (const p of particles) {
        p.vy  += GRAVITY;
        p.vx  *= DECAY;
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.spin;
        p.alpha = Math.max(0, p.alpha - 0.008);

        if (p.alpha <= 0) continue;
        alive = true;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        ctx.restore();
      }

      if (alive) {
        raf = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    }

    raf = requestAnimationFrame(draw);

    // Safety cleanup after 6s regardless
    setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 6000);
  };

})();
