import { Paddle } from './Paddle';
import { Game } from './Game';

export class Ball {
  private dx: number = 0;
  private dy: number = 0;
  private baseSpeed: number;
  public normalizedX: number;
  public normalizedY: number;

  constructor(
    private x: number,
    private y: number,
    public radius: number,
    private game: Game
  ) {
    this.baseSpeed = 0.005; // 0.5% of the field per frame
    this.normalizedX = x / game.canvasWidth;
    this.normalizedY = y / game.canvasHeight;
    this.resetSpeed();
  }

  updateSize(width: number, height: number) {
    this.radius = Math.min(width, height) / 2;
    this.resetSpeed();
  }

  resetSpeed() {
    this.dx = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
    this.dy = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
  }

  reset() {
    this.normalizedX = 0.5;
    this.normalizedY = 0.5;
    this.resetSpeed();
  }

  update() {
    this.normalizedX += this.dx;
    this.normalizedY += this.dy;

    if (this.normalizedY < 0 || this.normalizedY > 1) {
      this.dy = -this.dy;
    }

    this.x = this.normalizedX * this.game.canvasWidth;
    this.y = this.normalizedY * this.game.canvasHeight;
  }

  checkPaddleCollision(paddle: Paddle): boolean {
    const paddleNormalizedX = paddle.x / this.game.canvasWidth;
    const paddleNormalizedY = paddle.y / this.game.canvasHeight;
    const paddleNormalizedWidth = paddle.width / this.game.canvasWidth;
    const paddleNormalizedHeight = paddle.height / this.game.canvasHeight;

    return (
      this.normalizedX - this.radius / this.game.canvasWidth < paddleNormalizedX + paddleNormalizedWidth &&
      this.normalizedX + this.radius / this.game.canvasWidth > paddleNormalizedX &&
      this.normalizedY - this.radius / this.game.canvasHeight < paddleNormalizedY + paddleNormalizedHeight &&
      this.normalizedY + this.radius / this.game.canvasHeight > paddleNormalizedY
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

  public get ballX(): number {
    return this.x;
  }

  public reverseY() {
    this.dy = -this.dy;
  }

  public reverseX() {
    this.dx = -this.dx;
  }

  public setNormalizedPosition(x: number, y: number) {
    this.normalizedX = x;
    this.normalizedY = y;
    this.x = this.normalizedX * this.game.canvasWidth;
    this.y = this.normalizedY * this.game.canvasHeight;
  }

  public getCanvasWidth(): number {
    return this.game.canvasWidth;
  }

  public getCanvasHeight(): number {
    return this.game.canvasHeight;
  }
}
