import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { AI } from './AI';
import { Menu } from '../components/Menu';
import { InGameMenu } from '../components/InGameMenu';
import { ScoreManager } from './ScoreManager';
import { CollisionManager } from './CollisionManager';
import { Renderer } from './Renderer';

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
  private inGameMenu: InGameMenu;
  private isPaused: boolean = false;
  private isFullscreen: boolean = false;
  private scoreManager: ScoreManager;
  private collisionManager: CollisionManager;
  private renderer: Renderer;

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
    this.inGameMenu = new InGameMenu(this);

    this.scoreManager = new ScoreManager();
    this.collisionManager = new CollisionManager(this.ball, this.playerPaddle, this.aiPaddle);
    this.renderer = new Renderer(this);
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
      this.resetGame();
      this.isGameRunning = true;
      this.isPaused = false;
      this.canvas.style.display = 'block';
      this.requestLandscapeOrientation();
      this.inGameMenu.show();
      this.gameLoop();
    }
  }

  private gameLoop() {
    if (this.isGameRunning) {
      if (!this.isPaused) {
        this.update();
        this.draw();
      }
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  private update() {
    this.ball.update();
    this.ai.update();
    const collisionResult = this.collisionManager.checkCollisions();
    if (collisionResult !== 'none') {
      const isGameOver = this.scoreManager.updateScore(collisionResult);
      if (isGameOver) {
        this.endGame();
      } else {
        this.ball.reset();
      }
    }
  }

  private draw() {
    this.renderer.draw();
  }

  private requestLandscapeOrientation() {
    if (screen.orientation && 'lock' in screen.orientation) {
      screen.orientation.lock('landscape').catch((err: Error) => {
        console.error('Failed to lock orientation:', err);
      });
    }
  }

  public requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }
  }

  showMenu() {
    this.isGameRunning = false;
    this.inGameMenu.hide();
    this.menu.show();
    this.canvas.style.display = 'none';
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.inGameMenu.showPauseMenu();
    } else {
      this.inGameMenu.hidePauseMenu();
    }
  }

  endGame() {
    this.isGameRunning = false;
    this.inGameMenu.hide();
    const scores = this.scoreManager.getScores();
    const winner = scores.player > scores.ai ? 'Player' : 'AI';
    this.showGameOverScreen(winner, scores.player, scores.ai);
  }

  private showGameOverScreen(winner: string, playerScore: number, aiScore: number) {
    this.isPaused = true;
    this.isGameRunning = false;
    this.canvas.style.display = 'block';
    this.renderer.drawGameOverScreen(winner, playerScore, aiScore);
    this.canvas.addEventListener('click', this.handleGameOverClick, { once: true });
  }

  private handleGameOverClick = () => {
    this.resetGame();
    this.showMenu();
  };

  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.requestFullscreen();
    } else {
      this.exitFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  private exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  private resetGame() {
    this.scoreManager.reset();
    this.ball.reset();
    this.playerPaddle.setPosition(30, this.canvas.height / 2 - 40);
    this.aiPaddle.setPosition(this.canvas.width - 40, this.canvas.height / 2 - 40);
  }

  public getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getPlayerPaddle(): Paddle {
    return this.playerPaddle;
  }

  public getAiPaddle(): Paddle {
    return this.aiPaddle;
  }

  public getBall(): Ball {
    return this.ball;
  }

  public getScoreManager(): ScoreManager {
    return this.scoreManager;
  }

  public toggleMenu() {
    this.inGameMenu.toggleMenu();
  }

  

  public getGameRunningStatus(): boolean {
    return this.isGameRunning;
  }
}
