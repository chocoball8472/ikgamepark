import Chat from './chat.js';
import Board from './board.js';

export const socket = io();
export const util = {
  player: null,
  opponent: null,
  current_turn: null
};

const board = new Board();
const chat = new Chat();

socket.on('connect', () => {
  socket.emit('entry', my_name);
});

board.serverConnect();
chat.serverConnect();
