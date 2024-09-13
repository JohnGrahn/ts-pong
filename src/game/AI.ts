import { Paddle } from './Paddle';
import { Ball } from './Ball';

export class AI {
  private speed: number = 3;

  constructor(private paddle: Paddle, private ball: Ball) {}

  update() {
    const paddleCenter = this.paddle.y + this.paddle.height / 2;
    if (paddleCenter < this.ball.y - 35) {
      this.paddle.setY(this.paddle.y + this.speed);
    } else if (paddleCenter > this.ball.y + 35) {
      this.paddle.setY(this.paddle.y - this.speed);
    }
  }
}
