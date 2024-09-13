import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { AI } from './AI';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerPaddle: Paddle;
  private aiPaddle: Paddle;
  private ball: Ball;
  private ai: AI;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = 800;
    this.canvas.height = 400;

    this.playerPaddle = new Paddle(30, this.canvas.height / 2 - 40, 10, 80, this);
    this.aiPaddle = new Paddle(this.canvas.width - 40, this.canvas.height / 2 - 40, 10, 80, this);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10, this);
    this.ai = new AI(this.aiPaddle, this.ball, this);

    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  public get canvasWidth(): number {
    return this.canvas.width;
  }

  public get canvasHeight(): number {
    return this.canvas.height;
  }

  private resizeCanvas() {
    const containerWidth = this.canvas.parentElement?.clientWidth || window.innerWidth;
    const containerHeight = this.canvas.parentElement?.clientHeight || window.innerHeight;
    const aspectRatio = 16 / 9;

    if (containerWidth / containerHeight > aspectRatio) {
      this.canvas.height = containerHeight;
      this.canvas.width = containerHeight * aspectRatio;
    } else {
      this.canvas.width = containerWidth;
      this.canvas.height = containerWidth / aspectRatio;
    }

    // Update game objects with new sizes
    this.updateGameObjects();
  }

  private updateGameObjects() {
    const paddleWidth = this.canvasWidth * 0.02;
    const paddleHeight = this.canvasHeight * 0.15;

    this.playerPaddle.updateSize(paddleWidth, paddleHeight);
    this.playerPaddle.setPosition(paddleWidth, (this.canvasHeight - paddleHeight) / 2);

    this.aiPaddle.updateSize(paddleWidth, paddleHeight);
    this.aiPaddle.setPosition(this.canvasWidth - paddleWidth * 2, (this.canvasHeight - paddleHeight) / 2);

    this.ball.updateSize(this.canvasWidth * 0.02, this.canvasWidth * 0.02);
    this.ball.reset();

    this.ai.updateSpeed();
  }

  private handleMouseMove(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    this.playerPaddle.setY(mouseY - this.playerPaddle.height / 2);
  }

  start() {
    this.gameLoop();
  }

  private gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update() {
    this.ball.update();
    this.ai.update();
    this.checkCollisions();
  }

  private checkCollisions() {
    if (this.ball.checkPaddleCollision(this.playerPaddle) || 
        this.ball.checkPaddleCollision(this.aiPaddle)) {
      this.ball.reverseX();
    }
  }

  private draw() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'white';
    this.playerPaddle.draw(this.ctx);
    this.aiPaddle.draw(this.ctx);
    this.ball.draw(this.ctx);

    // Draw center line
    this.ctx.setLineDash([5, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.strokeStyle = 'white';
    this.ctx.stroke();
  }
}
