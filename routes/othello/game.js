const World = require('./world.js');

module.exports = class Game
{
  constructor() {
    this.worldList = [];
    this.player_count = 0;
    this.world_count = 0;
  }

  startUp(io) {
    io.on('connection', socket => {
      let my_world;
      let my_player;
      let opp_player;

      socket.on('entry', name => {
        this.player_count++;
        if(this.worldList.length <= 0) {
          this.world_count++;
          my_world = this.createWorld(this.worldList);
          my_player = my_world.createPlayer(name);
          socket.join(my_world.name);
        }else {
          let flag = true;
          this.worldList.some(world => {
            if(world === undefined) {return;}
            if(world.player_count < 3) {
              my_world = world;
              my_player = my_world.createPlayer(name);
              socket.join(my_world.name);
              flag = false;
              return true;
            }
          });
          if(flag) {
            this.world_count++;
            my_world = this.createWorld(this.worldList);
            my_player = my_world.createPlayer(name);
            socket.join(my_world.name);
          }
        }

        if(my_world.player_count == 3) {
          my_world.start(my_player);
          io.to(my_world.name).emit('startInfo');
        }else if(my_world.player_count < 3) {
          socket.emit('wait');
        }
      });

      socket.on('startAccept', () => {
        opp_player = my_world.getOpponent(my_player);
        socket.emit('start', my_world.board, my_player, opp_player, my_world.turn, my_world.pathCount);
      });

      socket.on('place', boardData => {
        my_world.board = boardData;
        if(my_world.pathCount > 0) {
          my_world.pathCount = 0;
        }
        my_world.scanBoard(my_player, opp_player);
        if(my_player.maisu + opp_player.maisu >= 64) {
          io.to(my_world.name).emit('end', my_world.board, my_world.playerList[1], my_world.playerList[2], my_world.turn);
          return;
        }
        this.update(io, my_world);
      });

      socket.on('path', () => {
        my_world.pathCount++;
        if(my_world.pathCount == 2) {
          io.to(my_world.name).emit('end', my_world.board, my_world.playerList[1], my_world.playerList[2], my_world.turn);
          return;
        }
        this.update(io, my_world);
      });

      socket.on('submit', text => {
        io.to(my_world.name).emit('receive', text, my_player.turn);
      });

      socket.on('disconnect', () => {
        this.playerDisconnect(my_world, my_player);
        io.to(my_world.name).emit('leave');
      });
    });
  }

  createWorld(worldList) {
    for(let i = 0; i < worldList.length; i++) {
      if(worldList[i] === undefined) {
        let world = new World("world" + (i + 1));
        worldList[i] = world;
        return world;
      }
    }
    let world = new World("World" + (worldList.length + 1));
    worldList.push(world);
    return world;
  }

  deleteWorld(my_world) {
    this.worldList.some((world, index, array) => {
      if(world.name === my_world.name) {
        delete array[index];
        return true;
      }
    });
  }

  playerDisconnect(my_world, my_player) {
    my_world.leavePlayer(my_player.turn);
    if(my_world.playerList.length <= 1) {
      this.deleteWorld(my_world);
      return;
    }
  }

  update(io, my_world) {
    my_world.turn = 3 - my_world.turn;
    io.to(my_world.name).emit('update',
                              my_world.board,
                              my_world.playerList[1],
                              my_world.playerList[2],
                              my_world.turn,
                              my_world.pathCount);
  }
}
