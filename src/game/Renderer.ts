import { Game } from './Game';

export class Renderer {
    constructor(private game: Game) {}

    draw(): void {
        const ctx = this.game.getCtx();
        const canvas = this.game.getCanvas();

        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw game objects
        ctx.fillStyle = 'white';
        console.log('Drawing player paddle');
        this.game.getPlayerPaddle().draw(ctx);
        console.log('Drawing opponent paddle');
        this.game.getOpponentPaddle().draw(ctx);
        console.log('Drawing ball');
        this.game.getBall().draw(ctx);

        // Draw center line
        this.drawCenterLine();

        // Draw scores
        this.drawScores();

        // Draw countdown if counting down
        if (this.game.getCountdownStatus()) {
            this.drawCountdown(this.game.getCountdownTimer());
        }

        // Draw game-over screen if the game is not running
        if (!this.game.getGameRunningStatus()) {
            const scores = this.game.getScoreManager().getScores();
            const winner = scores.player > scores.ai ? 'Player' : 'AI';
            this.drawGameOverScreen(winner, scores.player, scores.ai);
        }
    }

    private drawCenterLine(): void {
        const ctx = this.game.getCtx();
        const canvas = this.game.getCanvas();

        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    private drawScores(): void {
        const ctx = this.game.getCtx();
        const canvas = this.game.getCanvas();
        const scores = this.game.getScoreManager().getScores();

        ctx.font = '32px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`${scores.player}`, canvas.width * 0.25, 50);
        ctx.fillText(`${scores.ai}`, canvas.width * 0.75, 50);
    }

    drawGameOverScreen(winner: string, playerScore: number, aiScore: number): void {
        const ctx = this.game.getCtx();
        const canvas = this.game.getCanvas();

        // Clear the canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set up text styles
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw "Game Over" text
        ctx.font = '48px Arial';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60);

        // Draw winner text
        ctx.font = '36px Arial';
        ctx.fillText(`${winner} wins!`, canvas.width / 2, canvas.height / 2);

        // Draw score text
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${playerScore} - ${aiScore}`, canvas.width / 2, canvas.height / 2 + 60);

        // Draw instruction text
        ctx.font = '18px Arial';
        ctx.fillText('Click anywhere to return to the main menu', canvas.width / 2, canvas.height / 2 + 120);
    }

    drawCountdown(countdown: number): void {
        const ctx = this.game.getCtx();
        const canvas = this.game.getCanvas();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '64px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);

        if (this.game.getIsMultiplayer()) {
            const playerNumber = this.game.getPlayerNumber();
            const playerText = `You are Player ${playerNumber} (${playerNumber === 1 ? 'Left' : 'Right'})`;
            ctx.font = '32px Arial';
            ctx.fillText(playerText, canvas.width / 2, canvas.height / 2 + 80);
        }
    }
}