var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.name) {
    res.redirect('/home');
  }else {
    res.redirect('/login');
    //res.redirect('/othello');
  }
});

module.exports = router;
