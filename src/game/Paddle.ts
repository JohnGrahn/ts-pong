import { Game } from './Game';

export class Paddle {
  private speed!: number;
  public normalizedY: number;

  constructor(
    public normalizedX: number,
    normalizedY: number,
    public normalizedWidth: number,
    public normalizedHeight: number,
    private game: Game
  ) {
    this.updateSpeed();
    this.normalizedY = normalizedY;
    this.setNormalizedY(normalizedY);
  }

  updateSize(normalizedWidth: number, normalizedHeight: number) {
    this.normalizedWidth = normalizedWidth;
    this.normalizedHeight = normalizedHeight;
    this.updateSpeed();
  }

  updateSpeed() {
    this.speed = 0.01; // 1% of the field per frame
  }

  setNormalizedY(normalizedY: number) {
    this.normalizedY = Math.max(0, Math.min(normalizedY, 1 - this.normalizedHeight));
  }

  setY(y: number) {
    this.setNormalizedY(y / this.game.canvasHeight);
  }

  setPosition(normalizedX: number, normalizedY: number) {
    this.normalizedX = normalizedX;
    this.setNormalizedY(normalizedY);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const x = this.normalizedX * this.game.canvasWidth;
    const y = this.normalizedY * this.game.canvasHeight;
    const width = this.normalizedWidth * this.game.canvasWidth;
    const height = this.normalizedHeight * this.game.canvasHeight;
    console.log(`Drawing paddle at (${x}, ${y}) with size ${width}x${height}`);
    ctx.fillRect(x, y, width, height);
  }

  moveUp() {
    this.setNormalizedY(this.normalizedY - this.speed);
  }

  moveDown() {
    this.setNormalizedY(this.normalizedY + this.speed);
  }

  public get x(): number {
    return this.normalizedX * this.game.canvasWidth;
  }

  public get y(): number {
    return this.normalizedY * this.game.canvasHeight;
  }

  public get width(): number {
    return this.normalizedWidth * this.game.canvasWidth;
  }

  public get height(): number {
    return this.normalizedHeight * this.game.canvasHeight;
  }
}
