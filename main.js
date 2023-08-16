const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// canvas settings
console.log(ctx);
ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;
ctx.lineCap = "round";

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.speedX;
    this.speedY;
    this.speedModifer = Math.random() * 5 + 1;
    this.history = [{ x: this.x, y: this.y }];
    this.maxLength = Math.floor(Math.random() * 200 + 10);
    this.angle = 0;
    this.timer = this.maxLength * 2;
    this.colors = [
      "#4c026b",
      "#730d9e",
      "#9622c7",
      "#b44ae0",
      "#d56dff",
      "#e78cff",
    ];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
  }
  draw(context) {
    context.beginPath();
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.strokeStyle = this.color;
    context.stroke();
  }
  update() {
    this.timer--;

    if (this.timer >= 1) {
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;
      this.angle = this.effect.flowField[index];

      this.speedX = Math.cos(this.angle);
      this.speedY = Math.sin(this.angle);
      this.x += this.speedX * this.speedModifer;
      this.y += this.speedY * this.speedModifer;

      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }
  reset() {
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.history = [{ x: this.x, y: this.y }];
    this.timer = this.maxLength * 2;
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 2000;
    this.cellSize = 30;
    this.rows;
    this.cols;
    this.flowField = [];
    this.curve = 4;
    this.zoom = 0.04;
    this.debug = true;
    this.init();

    window.addEventListener("keydown", (e) => {
      if (e.key === "d") {
        this.debug = !this.debug;
      }
    });
    window.addEventListener("resize", (event) => {
      this.resize(event.target.innerWidth, event.target.innerHeight);
    });
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.init();
  }
  init() {
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.flowField = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let angle =
          (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
        this.flowField.push(angle);
      }
    }

    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }
  drawGrid(context) {
    context.save();
    context.strokeStyle = "white";
    context.lineWidth = 0.3;
    for (let c = 0; c < this.cols; c++) {
      context.beginPath();
      context.moveTo(c * this.cellSize, 0);
      context.lineTo(c * this.cellSize, this.height);
      context.stroke();
    }
    for (let r = 0; r < this.rows; r++) {
      context.beginPath();
      context.moveTo(0, r * this.cellSize);
      context.lineTo(this.width, r * this.cellSize);
      context.stroke();
    }
    context.restore();
  }
  render(ctx) {
    if (this.debug) this.drawGrid(ctx);
    this.particles.forEach((particle) => {
      particle.draw(ctx);
      particle.update();
    });
  }
}

const effect = new Effect(canvas);
effect.render(ctx);
console.log(effect);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.render(ctx);
  requestAnimationFrame(animate);
}

animate();
