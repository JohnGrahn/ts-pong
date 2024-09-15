import { Ball } from './Ball';
import { Paddle } from './Paddle';

export class CollisionManager {
    constructor(private ball: Ball, private playerPaddle: Paddle, private aiPaddle: Paddle) {}

    checkCollisions(): 'none' | 'player' | 'ai' {
        if (this.ball.checkPaddleCollision(this.playerPaddle) || 
            this.ball.checkPaddleCollision(this.aiPaddle)) {
            this.ball.reverseX();
        }

        if (this.ball.ballX - this.ball.radius < 0) {
            return 'ai';
        } else if (this.ball.ballX + this.ball.radius > this.playerPaddle.getCanvasWidth()) {
            return 'player';
        }

        return 'none';
    }
}