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
        this.game.getPlayerPaddle().draw(ctx);
        this.game.getAiPaddle().draw(ctx);
        this.game.getBall().draw(ctx);

        // Draw center line
        this.drawCenterLine();

        // Draw scores
        this.drawScores();
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
}