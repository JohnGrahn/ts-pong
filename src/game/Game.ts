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

    this.playerPaddle = new Paddle(30, this.canvas.height / 2 - 40, 10, 80);
    this.aiPaddle = new Paddle(this.canvas.width - 40, this.canvas.height / 2 - 40, 10, 80);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10);
    this.ai = new AI(this.aiPaddle, this.ball);

    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
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
    this.ball.update(this.canvas.width, this.canvas.height);
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
