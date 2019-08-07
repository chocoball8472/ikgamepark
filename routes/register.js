const express = require('express');
const router = express.Router();
const client = require('../pgConnect.js');

const query = {
  text: 'INSERT INTO usertb(name, password) VALUES($1, $2)',
  values: [],
};

router.get('/', (req, res) => {
  res.render('register', {
    title: "新規登録",
    alertDisplay: "",
  });
});

router.post('/', (req, res) => {
  query.values = [req.body['username'], req.body['password']];
  client.query(query)
  .then(r => {
    res.redirect('/login');
  })
  .catch(e => {
    res.render('register', {
      title: "新規登録",
      alertDisplay: "ユーザーネームかパスワードが無効です",
    });
  });
});

module.exports = router;
