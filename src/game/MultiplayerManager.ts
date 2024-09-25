import { io, Socket } from 'socket.io-client';
import { Game } from './Game';
import { AI } from './AI'; // Ensure AI is imported if used here

export class MultiplayerManager {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public startMultiplayerGame() {
    this.game.setIsMultiplayer(true); // Use public setter
    this.socket = io(window.location.origin);
    this.setupSocketListeners();
    this.socket.emit('joinGame');
  }

  public resetToSinglePlayer() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = null;
    this.roomId = null;
    this.game.setIsMultiplayer(false);
    this.game.setControlledPaddle(this.game.getPlayerPaddle()); // Use public setter
    this.game.resetGame();
    this.game.setAI(new AI(this.game.getOpponentPaddle(), this.game.getBall(), this.game)); // Use public setter
  }

  // New methods to emit events
  public emitPaddleMove(playerId: number, normalizedY: number): void {
    if (this.socket && this.roomId) {
      this.socket.emit('paddleMove', {
        roomId: this.roomId,
        playerId,
        normalizedY,
      });
    }
  }

  public emitBallMove(x: number, y: number): void {
    if (this.socket && this.roomId) {
      this.socket.emit('ballMove', {
        roomId: this.roomId,
        x,
        y,
      });
    }
  }

  public emitCollision(scorer: string): void {
    if (this.socket && this.roomId) {
      this.socket.emit('collision', {
        roomId: this.roomId,
        scorer,
      });
    }
  }

  public emitBallReset(x: number, y: number): void {
    if (this.socket && this.roomId) {
      this.socket.emit('ballReset', {
        roomId: this.roomId,
        x,
        y,
      });
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('waitingForOpponent', () => {
      console.log('Waiting for an opponent...');
      this.showWaitingScreen();
    });

    this.socket.on('gameStart', (data: { roomId: string; players: string[] }) => {
      console.log('Game starting:', data);
      this.hideWaitingScreen();
      this.roomId = data.roomId;
      const playerId = this.socket!.id === data.players[0] ? 1 : 2;
      this.game['playerId'] = playerId; // Update the playerId in the Game instance
      const controlledPaddle = playerId === 1 ? this.game.getPlayerPaddle() : this.game.getOpponentPaddle();
      this.game.setControlledPaddle(controlledPaddle);
      this.game.startGame();
    });

    this.socket.on('opponentPaddleMove', (data: { normalizedY: number }) => {
      const paddleToMove = this.game['playerId'] === 1 ? this.game.getOpponentPaddle() : this.game.getPlayerPaddle();
      paddleToMove.setNormalizedY(data.normalizedY);
    });

    this.socket.on('ballUpdate', (data: { x: number; y: number }) => {
      if (this.game['playerId'] === 2) {
        this.game.getBall().setNormalizedPosition(data.x, data.y);
      }
    });

    this.socket.on('ballReset', (data: { x: number; y: number }) => {
      this.game.getBall().setNormalizedPosition(data.x, data.y);
    });

    this.socket.on('scoreUpdate', (data: { player1: number; player2: number }) => {
      this.game.getScoreManager().setScores(data.player1, data.player2);
      if (this.game.getScoreManager().isGameOver()) {
        this.game.endGame();
      }
    });

    this.socket.on('opponentDisconnected', () => {
      console.log('Opponent disconnected');
      this.game.endGame();
      // Optionally show a disconnection message to the player
    });
  }

  private showWaitingScreen() {
    const waitingScreen = document.createElement('div');
    waitingScreen.style.cssText = `
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
      font-size: 24px;
      z-index: 2000;
    `;
    waitingScreen.textContent = 'Waiting for an opponent...';
    waitingScreen.id = 'waiting-screen';
    document.body.appendChild(waitingScreen);
  }

  private hideWaitingScreen() {
    const waitingScreen = document.getElementById('waiting-screen');
    if (waitingScreen) {
      waitingScreen.remove();
    }
  }
}