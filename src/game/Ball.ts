import { Paddle } from './Paddle';
import { Game } from './Game';

export class Ball {
  private dx: number = 0;
  private dy: number = 0;
  private baseSpeed: number;
  private width: number;
  private height: number;

  constructor(
    private x: number,
    private y: number,
    public radius: number,
    private game: Game
  ) {
    this.width = radius * 2;
    this.height = radius * 2;
    this.baseSpeed = Math.min(this.game.canvasWidth, this.game.canvasHeight) * 0.005;
    this.resetSpeed();
  }

  updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.radius = Math.min(width, height) / 2;
    this.baseSpeed = this.game.canvasWidth * 0.005; // Update speed when resizing
    this.resetSpeed();
  }

  resetSpeed() {
    this.dx = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
    this.dy = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
  }

  reset() {
    this.x = this.game.canvasWidth / 2 - this.width / 2;
    this.y = this.game.canvasHeight / 2 - this.height / 2;
    this.resetSpeed();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.y - this.radius < 0 || this.y + this.radius > this.game.canvasHeight) {
      this.dy = -this.dy;
    }

    if (this.x - this.radius < 0 || this.x + this.radius > this.game.canvasWidth) {
      this.reset();
    }
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

  public get ballY(): number {
    return this.y;
  }
}
