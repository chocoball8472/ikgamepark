module.exports = class World
{
  constructor(name) {
    this.name = name;
    this.playerList = [null];
    this.board = [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,2,1,0,0,0,0],
      [0,0,0,0,1,2,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ];
    /*this.board = [
      [0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,2,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ];*/
    this.turn;
    this.pathCount;
  }

  createPlayer(name) {
    let player = {
      name: name,
      turn: 0,
      maisu: 2,
    };
    this.playerList.push(player);
    return player;
  }

  leavePlayer(turn) {
    this.playerList.some((player, index, array) => {
      if(index == 0) {return;}
      if(player.turn == turn) {
        array.splice(index, 1);
        return true;
      }
    });
  }

  get player_count() {
    return this.playerList.length;
  }

  start(my_player) {
    this.playerShuffle();
    this.turn = 1;
    this.pathCount = 0;
  }

  playerShuffle() {
    const j = this.rand(2, 1);
    [this.playerList[1], this.playerList[j]] = [this.playerList[j], this.playerList[1]];
    for(let i = 1; i <= 2; i++) {
      this.playerList[i].turn = i;
    }
  }

  getOpponent(my_player) {
    let opp_player;
    for(let i = 1; i <= 2; i++) {
      const player = this.playerList[i];
      if(my_player.turn !== player.turn) {
        opp_player = player;
      }
    }
    return opp_player;
  }

  scanBoard(my_player, opp_player) {
    my_player.maisu = 0;
    opp_player.maisu = 0;
    for(let y = 1; y <= 8; y++) {
      for(let x = 1; x <= 8; x++) {
        if(this.board[y][x] == 0) {
          continue;
        }else if(this.board[y][x] == my_player.turn) {
          my_player.maisu++;
        }else if(this.board[y][x] == opp_player.turn) {
          opp_player.maisu++;
        }
      }
    }
  }

  rand(max, min) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  }
}
