function initFireworks() {
  const canvas = document.getElementById("fireworks");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const gravity = 0.06;
  const rockets = [];
  const particles = [];

  function randomColor() {
    return `hsl(${Math.random() * 360}, 100%, 60%)`;
  }

  // ==== ROCKET ====
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
      ctx.fillRect(this.x, this.y, 2, 10);
    }
  }

  // ==== PARTICLE ====
  class Particle {
    constructor(x, y, vx, vy, color, shape) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.alpha = 1;
      this.color = color;
      this.shape = shape;
    }

    update() {
      this.vy += gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.015;
      return this.alpha > 0;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;

      if (this.shape === "circle") {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (this.shape === "heart") drawHeart(this.x, this.y, 4);
      if (this.shape === "flower") drawFlower(this.x, this.y, 6);
      if (this.shape === "butterfly") drawButterfly(this.x, this.y, 5);

      ctx.restore();
    }
  }

  function drawHeart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s, y - s, x - s * 2, y + s, x, y + s * 2);
    ctx.bezierCurveTo(x + s * 2, y + s, x + s, y - s, x, y);
    ctx.fill();
  }

  function drawFlower(x, y, r) {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawButterfly(x, y, s) {
    ctx.beginPath();
    ctx.ellipse(x - s, y, s, s * 0.6, 0, 0, Math.PI * 2);
    ctx.ellipse(x + s, y, s, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function explode(x, y) {
    const count = 140;
    const shapes = ["circle", "heart", "flower", "butterfly"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particles.push(
        new Particle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          randomColor(),
          shape
        )
      );
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rockets.forEach((r, i) => (!r.update() ? rockets.splice(i, 1) : r.draw()));
    particles.forEach((p, i) => (!p.update() ? particles.splice(i, 1) : p.draw()));

    requestAnimationFrame(animate);
  }
  animate();

  setInterval(() => rockets.push(new Rocket()), 800);
}
