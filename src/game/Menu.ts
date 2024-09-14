import { Game } from './Game';

export class Menu {
  private menuElement: HTMLDivElement;

  constructor(private game: Game) {
    this.menuElement = document.createElement('div');
    this.menuElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 24px;
      z-index: 1000;
    `;

    const title = document.createElement('h1');
    title.textContent = 'Pong AI Game';
    this.menuElement.appendChild(title);

    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    playButton.style.cssText = `
      font-size: 20px;
      padding: 10px 20px;
      margin-top: 20px;
      cursor: pointer;
    `;
    playButton.addEventListener('click', () => this.startGame());
    this.menuElement.appendChild(playButton);

    document.body.appendChild(this.menuElement);
  }

  show() {
    this.menuElement.style.display = 'flex';
  }

  hide() {
    this.menuElement.style.display = 'none';
  }

  private startGame() {
    this.hide();
    this.game.start();
  }
}