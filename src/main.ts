import { Game } from './game/Game';
import { io } from 'socket.io-client';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const game = new Game(canvas);

game.showMenu();

// Make the io function available globally
(window as any).io = io;