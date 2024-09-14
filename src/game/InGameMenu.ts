import { Game } from './Game';

export class InGameMenu {
  private menuElement: HTMLDivElement;
  private pauseMenuElement: HTMLDivElement;

  constructor(private game: Game) {
    this.menuElement = document.createElement('div');
    this.menuElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
    `;

    const pauseButton = this.createButton('Pause');
    pauseButton.addEventListener('click', () => this.game.togglePause());

    const endGameButton = this.createButton('End Game');
    endGameButton.addEventListener('click', () => this.game.endGame());

    const fullscreenButton = this.createButton('Fullscreen');
    fullscreenButton.addEventListener('click', () => this.game.toggleFullscreen());

    this.menuElement.appendChild(pauseButton);
    this.menuElement.appendChild(endGameButton);
    this.menuElement.appendChild(fullscreenButton);

    document.body.appendChild(this.menuElement);

    this.pauseMenuElement = document.createElement('div');
    this.pauseMenuElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      display: none;
      z-index: 1001;
    `;

    const resumeButton = this.createButton('Resume');
    resumeButton.addEventListener('click', () => this.game.togglePause());

    this.pauseMenuElement.appendChild(resumeButton);
    document.body.appendChild(this.pauseMenuElement);
  }

  private createButton(text: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      font-size: 16px;
      padding: 5px 10px;
      cursor: pointer;
    `;
    return button;
  }

  show() {
    this.menuElement.style.display = 'flex';
  }

  hide() {
    this.menuElement.style.display = 'none';
  }

  showPauseMenu() {
    this.pauseMenuElement.style.display = 'block';
    this.menuElement.style.display = 'none';
  }

  hidePauseMenu() {
    this.pauseMenuElement.style.display = 'none';
    this.menuElement.style.display = 'flex';
  }
}