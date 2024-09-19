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

    setScores(player1: number, player2: number): void {
        this.playerScore = player1;
        this.aiScore = player2;
    }

    setMaxScore(maxScore: number): void {
        this.maxScore = maxScore;
    }

    incrementScore(scorer: 'player' | 'ai'): void {
        if (scorer === 'player') {
            this.playerScore++;
        } else {
            this.aiScore++;
        }
        console.log(`Score updated: Player ${this.playerScore} - AI ${this.aiScore}`);
    }
}