const express = require('express');
const router = express.Router();
const client = require('../pgConnect.js');

const query = {
  text: 'SELECT name, password FROM usertb WHERE name = $1 AND password = $2',
  values: [],
};

router.get('/', (req, res) => {
  res.render('login', {
    title: "ログイン",
    alertDisplay: "",
  });
});

router.post('/', (req, res) => {
  query.values = [req.body['username'], req.body['password']];
  client.query(query)
  .then(r => {
    if(r.rows[0]) {
      req.session.name = r.rows[0].name;
      res.redirect('/home');
    }else {
      res.render('login', {
        title: "login",
        alertDisplay: "ユーザーネームかパスワードが一致しません",
      });
    }
  })
  .catch(e => {
    res.render('login', {
      title: "login",
      alertDisplay: "ユーザーネームかパスワードが一致しません",
    });
  });
});

module.exports = router;
