function initFireworks() {
  const canvas = document.getElementById("fireworks");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const gravity = 0.06;
  const rockets = [];
  const particles = [];

  const MAX_ROCKETS = 5;
  const MAX_PARTICLES = 900;
  const TARGET_FPS = 40;
  const FRAME_TIME = 1000 / TARGET_FPS;

  let lastTime = 0;
  let rafId = null;
  let rocketTimer = null;
  let running = true;

 function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();


  function randomColor() {
    return `hsl(${Math.random() * 360}, 100%, 60%)`;
  }

  class Rocket {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height;
      this.vy = -(Math.random() * 5 + 7);
      this.targetY = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
      this.color = randomColor();
    }

    update() {
      this.y += this.vy;
      this.vy += gravity * 0.2;

      if (this.y <= this.targetY) {
        explode(this.x, this.y);
        return false;
      }
      return true;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, 2, 8);
    }
  }

  class Particle {
    constructor(x, y, vx, vy, color) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.alpha = 1;
      this.color = color;
    }

    update() {
      this.vy += gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.02;
      return this.alpha > 0;
    }

    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, 2, 2);
      ctx.globalAlpha = 1;
    }
  }

  function explode(x, y) {
    const count = 900;
    for (let i = 0; i < count; i++) {
      if (particles.length > MAX_PARTICLES) break;

      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 3 + 1;
      particles.push(
        new Particle(
          x,
          y,
          Math.cos(a) * s,
          Math.sin(a) * s,
          randomColor()
        )
      );
    }
  }

  function animate(time) {
    if (!running) return;

    if (time - lastTime < FRAME_TIME) {
      rafId = requestAnimationFrame(animate);
      return;
    }
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = rockets.length - 1; i >= 0; i--) {
      if (!rockets[i].update()) rockets.splice(i, 1);
      else rockets[i].draw();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].update()) particles.splice(i, 1);
      else particles[i].draw();
    }

    rafId = requestAnimationFrame(animate);
  }

  rocketTimer = setInterval(() => {
    if (rockets.length < MAX_ROCKETS) {
      rockets.push(new Rocket());
    }
  }, 900);

  rafId = requestAnimationFrame(animate);

  // ⏸ Pause khi tab ẩn
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) rafId = requestAnimationFrame(animate);
  });

  // 🔥 Cleanup cho SPA
  return function cleanup() {
    running = false;
    cancelAnimationFrame(rafId);
    clearInterval(rocketTimer);
    rockets.length = 0;
    particles.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
