import { Game } from './Game';

export class Paddle {
  private speed!: number;

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    private game: Game
  ) {
    this.updateSpeed();
  }

  updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.updateSpeed();
  }

  updateSpeed() {
    this.speed = this.game.canvasHeight * 0.01; // 1% of canvas height
  }

  setY(y: number) {
    this.y = Math.max(0, Math.min(y, this.game.canvasHeight - this.height));
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  moveUp() {
    this.setY(this.y - this.speed);
  }

  moveDown() {
    this.setY(this.y + this.speed);
  }
}
