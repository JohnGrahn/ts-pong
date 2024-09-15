export class ScoreManager {
    private playerScore: number = 0;
    private aiScore: number = 0;
    private maxScore: number = 5;

    updateScore(player: 'player' | 'ai'): boolean {
        if (player === 'player') {
            this.playerScore++;
        } else {
            this.aiScore++;
        }
        return this.isGameOver();
    }

    isGameOver(): boolean {
        return this.playerScore >= this.maxScore || this.aiScore >= this.maxScore;
    }

    getScores(): { player: number, ai: number } {
        return { player: this.playerScore, ai: this.aiScore };
    }

    reset(): void {
        this.playerScore = 0;
        this.aiScore = 0;
    }
}