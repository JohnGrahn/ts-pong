import { Paddle } from './Paddle';

export class Ball {
  private dx: number = 5;
  private dy: number = 5;

  constructor(
    public x: number,
    public y: number,
    public radius: number
  ) {}

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.dx;
    this.y += this.dy;

    if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
      this.dy = -this.dy;
    }

    if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
      this.reset(canvasWidth, canvasHeight);
    }
  }

  reset(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
    this.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
  }

  reverseX() {
    this.dx = -this.dx;
  }

  checkPaddleCollision(paddle: Paddle): boolean {
    return (
      this.x - this.radius < paddle.x + paddle.width &&
      this.x + this.radius > paddle.x &&
      this.y - this.radius < paddle.y + paddle.height &&
      this.y + this.radius > paddle.y
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}
