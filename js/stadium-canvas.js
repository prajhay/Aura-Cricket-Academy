/* ==========================================================
   AURA CRICKET ACADEMY - STADIUM CANVAS VISUAL ENGINE
   Floodlights, Volumetric Beams, Bokeh Dust & 3D Cricket Ball
   ========================================================== */

(function () {
  const canvas = document.getElementById('stadium-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null };
  let animId;

  // Resize handler
  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    initParticles();
  }

  // Atmospheric Stadium Dust & Crowd Bokeh Particles
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // initial spread
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 20;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedY = Math.random() * 0.7 + 0.25;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = Math.random() > 0.4 ? 'rgba(0, 242, 254,' : (Math.random() > 0.5 ? 'rgba(255, 215, 0,' : 'rgba(255, 255, 255,');
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseAngle = Math.random() * Math.PI * 2;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.pulseAngle += this.pulseSpeed;

      // Mouse gentle repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.x += (dx / dist) * 1.5;
          this.y += (dy / dist) * 1.5;
        }
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      const currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulseAngle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${currentOpacity})`;
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = this.color.includes('242') ? '#00f2fe' : '#ffd700';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 14000);
    const particleCount = Math.min(Math.max(count, 50), 120);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw Dynamic Volumetric Stadium Floodlight Beams
  let beamAngle = 0;
  function drawStadiumBeams() {
    beamAngle += 0.008;

    const lights = [
      { x: width * 0.08, y: 0, targetX: width * 0.45 + Math.sin(beamAngle) * 60, targetY: height * 0.8 },
      { x: width * 0.92, y: 0, targetX: width * 0.55 - Math.sin(beamAngle) * 60, targetY: height * 0.8 },
      { x: 0, y: height * 0.3, targetX: width * 0.5 + Math.cos(beamAngle) * 50, targetY: height * 0.9 },
      { x: width, y: height * 0.3, targetX: width * 0.5 - Math.cos(beamAngle) * 50, targetY: height * 0.9 }
    ];

    lights.forEach(light => {
      const grad = ctx.createRadialGradient(light.x, light.y, 10, light.targetX, light.targetY, 650);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.28)');
      grad.addColorStop(0.3, 'rgba(30, 64, 175, 0.12)');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(light.x - 30, light.y);
      ctx.lineTo(light.targetX - 250, light.targetY);
      ctx.lineTo(light.targetX + 250, light.targetY);
      ctx.lineTo(light.x + 30, light.y);
      ctx.closePath();
      ctx.fill();

      // Bright Lamp Flare Source
      ctx.beginPath();
      ctx.arc(light.x, light.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();
      ctx.restore();
    });
  }

  // Animated Travelling Fast Bowling Cricket Ball
  let ballState = {
    x: -80,
    y: 200,
    vx: 5.5,
    vy: 1.2,
    angle: 0,
    rotSpeed: 0.15,
    radius: 22
  };

  function drawTravellingBall() {
    ballState.x += ballState.vx;
    ballState.y += Math.sin(ballState.x * 0.008) * 2;
    ballState.angle += ballState.rotSpeed;

    // Reset ball once off screen
    if (ballState.x > width + 100) {
      ballState.x = -80;
      ballState.y = Math.random() * (height * 0.5) + 120;
    }

    ctx.save();
    ctx.translate(ballState.x, ballState.y);
    ctx.rotate(ballState.angle);

    // Glowing motion trail
    ctx.shadowBlur = 25;
    ctx.shadowColor = 'rgba(255, 75, 75, 0.7)';

    // Ball Sphere
    const ballGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, ballState.radius);
    ballGrad.addColorStop(0, '#ff4d4d');
    ballGrad.addColorStop(0.5, '#b91c1c');
    ballGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = ballGrad;

    ctx.beginPath();
    ctx.arc(0, 0, ballState.radius, 0, Math.PI * 2);
    ctx.fill();

    // White Stitched Seam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.ellipse(0, 0, ballState.radius - 1, (ballState.radius - 1) * 0.35, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    drawStadiumBeams();

    // Draw Particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawTravellingBall();

    animId = requestAnimationFrame(animate);
  }

  // Mouse Listener for Spotlight & Particles
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Sync CSS mouse spotlight
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);

  // Initialize
  resize();
  animate();
})();
