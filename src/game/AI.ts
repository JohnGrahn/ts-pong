import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Game } from './Game';

export class AI {
  private speed: number = 0;

  constructor(private paddle: Paddle, private ball: Ball, private game: Game) {
    this.updateSpeed();
  }

  updateSpeed() {
    this.speed = this.game.canvasHeight * 0.005; // 0.5% of canvas height
  }

  update() {
    const paddleCenter = this.paddle.y + this.paddle.height / 2;
    const targetY = this.ball.ballY;
    
    if (paddleCenter < targetY - this.game.canvasHeight * 0.05) {
      this.paddle.setY(this.paddle.y + this.speed);
    } else if (paddleCenter > targetY + this.game.canvasHeight * 0.05) {
      this.paddle.setY(this.paddle.y - this.speed);
    }
  }
}
