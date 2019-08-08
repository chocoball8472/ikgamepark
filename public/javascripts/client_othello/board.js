import {socket, util} from './main.js';
import Piece from './piece.js';

let modalText;

export default class Board
{
  constructor() {
    this.pieceTypes = [
      document.getElementById('empty'),
      document.getElementById('black'),
      document.getElementById('white')
    ];
    this.strTypes = ["空", "黒（先手）", "白（後手）"];
    this.createRows();
    this.my_name = document.getElementById('my_name');
    this.my_turn = document.getElementById('my_turn');
    this.my_maisu = document.getElementById('my_maisu');
    this.opp_name = document.getElementById('opp_name');
    this.opp_turn = document.getElementById('opp_turn');
    this.opp_maisu = document.getElementById('opp_maisu');
    this.current_turn = document.getElementById('current_turn');
    this.alert_display = document.getElementById('alert_display');
    this.alert_content = document.getElementById('alert_content');
    this.modalText = "マッチング中...";
    $(function() {
      $('#modal').on('shown.bs.modal', function(event) {
        $('#modal .modal-body h2').text(modalText);
      });
    });
  }

  serverConnect() {
    socket.on('wait', () => {
      this.showModal("マッチング中...");
    });

    socket.on('startInfo', () => {
      $('#modal').modal('hide');
      socket.emit('startAccept');
    });

    socket.on('start', (boardData, my_player, opp_player, turn, pathCount) => {
      this.showAlert("対戦開始");
      util.player = my_player;
      util.opponent = opp_player;
      this.update(boardData, my_player, opp_player, turn, pathCount);
      this.my_name.textContent = util.player.name;
      this.opp_name.textContent = util.opponent.name;
      this.my_turn.textContent = this.strTypes[util.player.turn];
      this.opp_turn.textContent = this.strTypes[util.opponent.turn];
    });

    socket.on('update', (boardData, player1, player2, turn, pathCount) => {
      this.update(boardData, player1, player2, turn, pathCount);
    });

    socket.on('end', (boardData, player1, player2, turn) => {
      this.showAlert("対戦終了");
      if(util.player.turn == player1.turn) {
        util.player = player1;
        util.opponent = player2;
      }else {
        util.player = player2;
        util.opponent = player1;
      }
      util.current_turn = turn;
      this.create(boardData, (cx, cy, board) => {
        return;
      });
      this.my_maisu.textContent = util.player.maisu;
      this.opp_maisu.textContent = util.opponent.maisu;
      if(util.player.maisu > util.opponent.maisu) {
        this.current_turn.textContent = "あなたの勝ちです。";
      }else if(util.player.maisu < util.opponent.maisu) {
        this.current_turn.textContent = "あなたの負けです。";
      }else if(util.player.maisu == util.opponent.maisu) {
        this.current_turn.textContent = "引き分けです。";
      }
      setTimeout(() => {
        location.href = '/home';
      }, 10000);
    });

    socket.on('leave', () => {
      this.showModal("相手プレイヤーが退出しました。");
      setTimeout(() => {
        location.href = '/home';
      }, 3000);
    });
  }

  createRows() {
    this.rows = [];
    for(let i = 1; i <= 8; i++) {
      this.rows.push(document.getElementById(`rows_${i}`));
    }
  }

  create(boardData, callback) {
    for(let y = 1; y <= 8; y++) {
      const row = this.rows[y - 1];
      while(row.firstChild) {
        row.removeChild(row.firstChild);
      }
      for(let x = 1; x <= 8; x++) {
        let pieceType = this.pieceTypes[boardData[y][x]];
        const piece = new Piece(pieceType, x, y);
        piece.addListener(boardData, callback);
        row.appendChild(piece.self);
      }
    }
  }

  update(boardData, player1, player2, turn, pathCount) {
    if(util.player.turn == player1.turn) {
      util.player = player1;
      util.opponent = player2;
    }else {
      util.player = player2;
      util.opponent = player1;
    }
    util.current_turn = turn;
    this.pathInfo(pathCount);
    this.create(boardData, (cx, cy, board) => {
      if(util.current_turn !== util.player.turn || board[cy][cx] !== 0) {
        return;
      }
      this.placeProcess(cx, cy, board);
    });
    this.my_maisu.textContent = util.player.maisu;
    this.opp_maisu.textContent = util.opponent.maisu;
    this.current_turn.textContent = `現在は　${this.strTypes[util.current_turn]}の番です。`;
    if(util.player.turn == util.current_turn) {
      this.pathCheck(boardData);
    }
  }

  placeProcess(cx, cy, board) {
    let flipDir = this.placeCheck(cx, cy, board)
    if(flipDir.length > 0) {
      this.doPlace(cx, cy, board, flipDir);
    }
  }

  placeCheck(cx, cy, board) {
    let flipDir = [];
    for(let dy = -1; dy <= 1; dy++) {
      for(let dx = -1; dx <= 1; dx++) {
        if(dy == 0 && dx == 0) {continue;}
        let n = 1;
        while(board[cy + dy * n][cx + dx * n] == 3 - util.current_turn) {
          n++;
        }
        if(n > 1 && board[cy + dy * n][cx + dx * n] == util.current_turn) {
          flipDir.push({dy: dy, dx: dx, n: n - 1});
        }
      }
    }
    return flipDir;
  }

  doPlace(cx, cy, board, flipDir) {
    for(let i = 0; i < flipDir.length; i++) {
      for(let j = 1; j <= flipDir[i].n; j++) {
        board[cy + flipDir[i].dy * j][cx + flipDir[i].dx * j] = util.current_turn;
      }
    }
    board[cy][cx] = util.current_turn;
    socket.emit('place', board);
  }

  pathCheck(board) {
    let count = 0;
    for(let y = 1; y <= 8; y++) {
      for(let x = 1; x <= 8; x++) {
        if(board[y][x] != 0) {continue;}
        if(this.placeCheck(x, y, board).length > 0) {
          count++;
        }
      }
    }
    if(!count) {
      socket.emit('path');
    }
  }

  pathInfo(pathCount) {
    if(pathCount > 0) {
      this.showAlert(`${this.strTypes[3 - util.current_turn]}のパスが選択されました。`);
    }
  }

  showAlert(text) {
    while(this.alert_display.firstChild) {
      this.alert_display.removeChild(this.alert_display.firstChild);
    }
    const alert_copy = this.alert_content.cloneNode(true);
    alert_copy.firstChild.textContent = text;
    this.alert_display.appendChild(alert_copy);
    setTimeout(() => {
      while(this.alert_display.firstChild) {
        this.alert_display.removeChild(this.alert_display.firstChild);
      }
    }, 5000);
  }

  showModal(text) {
    modalText = text;
    $('#modal').modal({
      backdrop: 'static'
    });
  }
}
