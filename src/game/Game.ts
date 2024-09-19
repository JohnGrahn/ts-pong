import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { AI } from './AI';
import { Menu } from '../components/Menu';
import { InGameMenu } from '../components/InGameMenu';
import { ScoreManager } from './ScoreManager';
import { CollisionManager } from './CollisionManager';
import { Renderer } from './Renderer';
import { io, Socket } from 'socket.io-client';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerPaddle: Paddle;
  private opponentPaddle: Paddle;
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
  private countdownTimer: number = 5;
  private isCountingDown: boolean = false;
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private isMultiplayer: boolean = false;
  private playerId: number = 0;
  private controlledPaddle: Paddle;
  private isScoring: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Set initial canvas size to window dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const paddleNormalizedWidth = 0.02;
    const paddleNormalizedHeight = 0.15;

    this.playerPaddle = new Paddle(paddleNormalizedWidth, 0.5 - paddleNormalizedHeight / 2, paddleNormalizedWidth, paddleNormalizedHeight, this);
    this.opponentPaddle = new Paddle(1 - paddleNormalizedWidth * 2, 0.5 - paddleNormalizedHeight / 2, paddleNormalizedWidth, paddleNormalizedHeight, this);
    this.ball = new Ball(0.5, 0.5, 0.01, this);
    this.ai = new AI(this.opponentPaddle, this.ball, this);

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

    this.scoreManager = new ScoreManager();
    this.collisionManager = new CollisionManager(this.ball, this.playerPaddle, this.opponentPaddle);
    this.renderer = new Renderer(this);

    this.resizeCanvas(); // Initial call to ensure correct setup on load
    this.updateGameObjects();
    this.inGameMenu = new InGameMenu(this);

    this.controlledPaddle = this.playerPaddle;
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

    // Force a redraw
    this.draw();
  }

  private updateGameObjects() {
    const paddleNormalizedWidth = 0.02; 
    const paddleNormalizedHeight = 0.15; 
    const ballNormalizedRadius = 0.01; 

    this.playerPaddle.updateSize(paddleNormalizedWidth, paddleNormalizedHeight);
    this.playerPaddle.setPosition(paddleNormalizedWidth, 0.5 - paddleNormalizedHeight / 2);

    this.opponentPaddle.updateSize(paddleNormalizedWidth, paddleNormalizedHeight);
    this.opponentPaddle.setPosition(1 - paddleNormalizedWidth * 2, 0.5 - paddleNormalizedHeight / 2);

    this.ball.updateSize(ballNormalizedRadius * 2, ballNormalizedRadius * 2);
    this.ball.radius = ballNormalizedRadius * Math.min(this.canvasWidth, this.canvasHeight);
    this.ball.reset();

    this.ai.updateSpeed();
  }

  private handleMouseMove(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    const normalizedY = mouseY / this.canvasHeight;
    this.controlledPaddle.setNormalizedY(normalizedY - this.controlledPaddle.normalizedHeight / 2);

    if (this.isMultiplayer && this.socket && this.roomId) {
      this.socket.emit('paddleMove', {
        roomId: this.roomId,
        playerId: this.playerId,
        normalizedY: this.controlledPaddle.normalizedY,
      });
    }
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const touchY = touch.clientY - rect.top;
    const normalizedY = touchY / this.canvasHeight;
    this.controlledPaddle.setNormalizedY(normalizedY - this.controlledPaddle.normalizedHeight / 2);

    if (this.isMultiplayer && this.socket && this.roomId) {
      this.socket.emit('paddleMove', {
        roomId: this.roomId,
        playerId: this.playerId,
        normalizedY: this.controlledPaddle.normalizedY,
      });
    }
  }

  startGame() {
    if (!this.isGameRunning) {
      this.resetGame();
      this.updateGameObjects();
      if (!this.isMultiplayer) {
        this.ai = new AI(this.opponentPaddle, this.ball, this);
      }
      this.isGameRunning = true;
      this.isPaused = false;
      this.canvas.style.display = 'block';
      this.requestLandscapeOrientation();
      this.inGameMenu.show();
      this.startCountdown();
      this.draw(); // Force an initial draw
    }
  }

  private startCountdown() {
    this.isCountingDown = true;
    this.countdownTimer = 5;
    this.gameLoop();
    this.updateCountdown();
  }

  private updateCountdown() {
    if (this.countdownTimer > 0) {
      setTimeout(() => {
        this.countdownTimer--;
        this.updateCountdown();
      }, 1000);
    } else {
      this.isCountingDown = false;
    }
  }

  private gameLoop() {
    if (this.isGameRunning) {
      if (!this.isPaused) {
        if (!this.isCountingDown) {
          this.update();
        }
        this.draw();
      }
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  private update() {
    if (!this.isMultiplayer) {
        this.ball.update();
        this.ai.update();
    } else {
        // In multiplayer, only update the ball position if we're player 1
        if (this.playerId === 1) {
            this.ball.update();
            if (this.socket && this.roomId) {
                this.socket.emit('ballMove', {
                    roomId: this.roomId,
                    x: this.ball.normalizedX,
                    y: this.ball.normalizedY,
                });
            }
        }
    }

    // Only Player 1 should handle collision detection
    if (this.playerId === 1 && !this.isScoring) {
        const collisionResult = this.collisionManager.checkCollisions();
        if (collisionResult !== 'none') {
            console.log(`Collision detected: ${collisionResult}`);
            this.isScoring = true;
            if (this.isMultiplayer && this.socket && this.roomId) {
                // In multiplayer, only Player 1 sends collision events to the server
                this.socket.emit('collision', {
                    roomId: this.roomId,
                    scorer: collisionResult
                });
            } else {
                // In single player, update score locally
                this.scoreManager.incrementScore(collisionResult);
            }
            
            if (this.scoreManager.isGameOver()) {
                this.endGame();
            } else {
                this.ball.reset();
                if (this.isMultiplayer && this.socket && this.roomId && this.playerId === 1) {
                    this.socket.emit('ballReset', {
                        roomId: this.roomId,
                        x: this.ball.normalizedX,
                        y: this.ball.normalizedY,
                    });
                }
                // Reset the scoring flag after a short delay
                setTimeout(() => {
                    this.isScoring = false;
                }, 1000);
            }
        }
    }
}

  private draw() {
    this.renderer.draw();
    console.log('Game draw called');
  }

  private requestLandscapeOrientation() {
    if (screen.orientation && 'lock' in screen.orientation && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      screen.orientation.lock('landscape').catch((err: Error) => {
        console.warn('Failed to lock orientation:', err);
      });
    } else {
      console.warn('Screen orientation lock API is not available or the page is not in a secure context.');
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
    this.resetToSinglePlayer();
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
    this.canvas.addEventListener('click', this.handleGameOverInteraction);
    this.canvas.addEventListener('touchstart', this.handleGameOverInteraction);
  }

  private handleGameOverInteraction = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    this.canvas.removeEventListener('click', this.handleGameOverInteraction);
    this.canvas.removeEventListener('touchstart', this.handleGameOverInteraction);
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
    const paddleNormalizedWidth = 0.02;
    const paddleNormalizedHeight = 0.15;
    this.playerPaddle.setPosition(paddleNormalizedWidth, 0.5 - paddleNormalizedHeight / 2);
    this.opponentPaddle.setPosition(1 - paddleNormalizedWidth * 2, 0.5 - paddleNormalizedHeight / 2);
    this.updateGameObjects();
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

  public getOpponentPaddle(): Paddle {
    return this.opponentPaddle;
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

  public getCountdownStatus(): boolean {
    return this.isCountingDown;
  }

  public getCountdownTimer(): number {
    return this.countdownTimer;
  }

  public startMultiplayerGame() {
    this.isMultiplayer = true;
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
    this.socket.emit('joinGame', {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight
    });
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('waitingForOpponent', () => {
      console.log('Waiting for an opponent...');
      // Show waiting message on the screen
    });

    this.socket.on('gameStart', (data: { roomId: string; players: string[] }) => {
      this.roomId = data.roomId;
      this.playerId = this.socket!.id === data.players[0] ? 1 : 2;
      if (this.playerId === 2) {
        this.controlledPaddle = this.opponentPaddle;
      }
      this.startGame();
    });

    this.socket.on('opponentPaddleMove', (data: { normalizedY: number }) => {
      const paddleToMove = this.playerId === 1 ? this.opponentPaddle : this.playerPaddle;
      paddleToMove.setNormalizedY(data.normalizedY);
    });

    this.socket.on('ballUpdate', (data: { x: number; y: number }) => {
      if (this.playerId === 2) {
        this.ball.setNormalizedPosition(data.x, data.y);
      }
    });

    this.socket.on('ballReset', (data: { x: number; y: number }) => {
      if (this.playerId === 2) {
        this.ball.setNormalizedPosition(data.x, data.y);
      }
    });

    this.socket.on('scoreUpdate', (data: { player1: number; player2: number }) => {
      this.scoreManager.setScores(data.player1, data.player2);
      if (this.scoreManager.isGameOver()) {
        this.endGame();
      }
    });

    this.socket.on('gameOver', (data: { winner: string; scores: { player1: number; player2: number } }) => {
      this.endGame();
      // Optionally display the winner and final scores
    });

    this.socket.on('opponentDisconnected', () => {
      console.log('Opponent disconnected');
      this.endGame();
      // Show a message to the player about the disconnection
    });
  }

  resetToSinglePlayer() {
    this.isMultiplayer = false;
    this.socket?.disconnect();
    this.socket = null;
    this.roomId = null;
    this.playerId = 0;
    this.controlledPaddle = this.playerPaddle;
    this.resetGame();
    this.ai = new AI(this.opponentPaddle, this.ball, this);
  }
}
