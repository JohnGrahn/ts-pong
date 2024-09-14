import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { AI } from './AI';
import { Menu } from './Menu';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerPaddle: Paddle;
  private aiPaddle: Paddle;
  private ball: Ball;
  private ai: AI;
  private orientationMessage: HTMLDivElement;
  private menu: Menu;
  private isGameRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Set initial canvas size to window dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.playerPaddle = new Paddle(30, this.canvas.height / 2 - 40, 10, 80, this);
    this.aiPaddle = new Paddle(this.canvas.width - 40, this.canvas.height / 2 - 40, 10, 80, this);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10, this);
    this.ai = new AI(this.aiPaddle, this.ball, this);

    this.orientationMessage = document.createElement('div');
    this.orientationMessage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 24px;
      z-index: 2000;
    `;

    // Create a new element for the text with a semi-opaque background
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
      background-color: rgba(0, 0, 0, 0.7);
      padding: 20px;
      border-radius: 10px;
    `;
    textContainer.textContent = 'Please rotate your device to landscape mode for the best experience.';

    // Append the text container to the orientation message
    this.orientationMessage.appendChild(textContainer);
    document.body.appendChild(this.orientationMessage);

    this.menu = new Menu(this);

    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resizeCanvas(), 100);
    });

    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchstart', this.handleTouchMove.bind(this));

    this.resizeCanvas(); // Initial call to ensure correct setup on load
  }

  public get canvasWidth(): number {
    return this.canvas.width;
  }

  public get canvasHeight(): number {
    return this.canvas.height;
  }

  private resizeCanvas() {
    // Update canvas dimensions to match window dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Show/hide orientation message
    if (window.innerWidth < window.innerHeight) {
      this.orientationMessage.style.display = 'flex';
    } else {
      this.orientationMessage.style.display = 'none';
    }

    // Update game objects with new sizes and positions
    this.updateGameObjects();
  }

  private updateGameObjects() {
    // Calculate sizes and positions based on canvas dimensions
    const paddleWidth = this.canvasWidth * 0.02; 
    const paddleHeight = this.canvasHeight * 0.15; 
    const ballRadius = this.canvasWidth * 0.01; 

    this.playerPaddle.updateSize(paddleWidth, paddleHeight);
    this.playerPaddle.setPosition(paddleWidth, (this.canvasHeight - paddleHeight) / 2);

    this.aiPaddle.updateSize(paddleWidth, paddleHeight);
    this.aiPaddle.setPosition(this.canvasWidth - paddleWidth * 2, (this.canvasHeight - paddleHeight) / 2);

    this.ball.updateSize(ballRadius * 2, ballRadius * 2); // Update ball dimensions
    this.ball.radius = ballRadius; // Update ball radius directly
    this.ball.reset();

    this.ai.updateSpeed();
  }

  private handleMouseMove(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    this.playerPaddle.setY(mouseY - this.playerPaddle.height / 2);
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const touchY = touch.clientY - rect.top;
    this.playerPaddle.setY(touchY - this.playerPaddle.height / 2);
  }

  start() {
    if (!this.isGameRunning) {
      this.isGameRunning = true;
      this.requestLandscapeOrientation();
      this.gameLoop();
    }
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

  private requestLandscapeOrientation() {
    if (screen.orientation && 'lock' in screen.orientation) {
      screen.orientation.lock('landscape').catch((err: Error) => {
        console.error('Failed to lock orientation:', err);
      });
    }
  }

  showMenu() {
    this.isGameRunning = false;
    this.menu.show();
  }
}