import { Game } from '../game/Game';

export class InGameMenu {
  private menuElement: HTMLDivElement;
  private pauseMenuElement: HTMLDivElement;
  private isMenuVisible: boolean = false;

  constructor(private game: Game) {
    this.menuElement = document.createElement('div');
    this.menuElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      z-index: 1000;
    `;

    const toggleButton = this.createButton('≡');
    toggleButton.style.fontSize = '24px';
    toggleButton.addEventListener('click', () => this.toggleMenu());

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'none';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '5px';

    const pauseButton = this.createButton('⏸️');
    pauseButton.addEventListener('click', () => this.game.togglePause());

    const endGameButton = this.createButton('🏁');
    endGameButton.addEventListener('click', () => this.game.endGame());

    const fullscreenButton = this.createButton('⛶');
    fullscreenButton.addEventListener('click', () => this.game.toggleFullscreen());

    buttonContainer.appendChild(pauseButton);
    buttonContainer.appendChild(endGameButton);
    buttonContainer.appendChild(fullscreenButton);

    this.menuElement.appendChild(toggleButton);
    this.menuElement.appendChild(buttonContainer);

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
      min-width: 200px;
      min-height: 100px;
    `;

    const resumeButton = this.createButton('Resume');
    resumeButton.style.width = 'auto';
    resumeButton.style.height = 'auto';
    resumeButton.style.padding = '10px 20px';
    resumeButton.addEventListener('click', () => this.game.togglePause());

    this.pauseMenuElement.appendChild(resumeButton);
    document.body.appendChild(this.pauseMenuElement);
  }

  private createButton(text: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      font-size: 16px;
      padding: 5px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.7);
      border: none;
      border-radius: 5px;
    `;
    return button;
  }

  public toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
    const buttonContainer = this.menuElement.querySelector('div');
    if (buttonContainer) {
      buttonContainer.style.display = this.isMenuVisible ? 'flex' : 'none';
    }
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