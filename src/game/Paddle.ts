export class Paddle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  setY(y: number) {
    this.y = Math.max(0, Math.min(y, 400 - this.height));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
