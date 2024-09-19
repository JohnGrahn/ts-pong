import { Ball } from './Ball';
import { Paddle } from './Paddle';

export class CollisionManager {
    private collisionCooldown: boolean = false;
    private cooldownTime: number = 500; // milliseconds

    constructor(private ball: Ball, private playerPaddle: Paddle, private aiPaddle: Paddle) {}

    checkCollisions(): 'none' | 'player' | 'ai' {
        if (this.collisionCooldown) {
            return 'none';
        }

        if (this.ball.checkPaddleCollision(this.playerPaddle) || 
            this.ball.checkPaddleCollision(this.aiPaddle)) {
            this.ball.reverseX();
            console.log('Paddle collision detected');
            this.triggerCooldown();
            return 'none'; // No scoring on paddle collision
        }

        if (this.ball.normalizedX - this.ball.radius / this.ball.getCanvasWidth() < 0) {
            console.log('AI scores');
            this.triggerCooldown();
            return 'ai';
        } else if (this.ball.normalizedX + this.ball.radius / this.ball.getCanvasWidth() > 1) {
            console.log('Player scores');
            this.triggerCooldown();
            return 'player';
        }

        return 'none';
    }

    private triggerCooldown() {
        this.collisionCooldown = true;
        setTimeout(() => {
            this.collisionCooldown = false;
        }, this.cooldownTime);
    }
}