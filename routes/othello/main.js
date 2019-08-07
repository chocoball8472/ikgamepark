const express = require('express');
const router = express.Router();
const io = require('../../socket_api').io;
const Game = require('./game.js');

const game = new Game();
game.startUp(io);

router.get('/', function(req, res, next) {
  res.render('othello', {
    title: "オセロオンライン",
    username: req.session.name,
  });
});

module.exports = router;
