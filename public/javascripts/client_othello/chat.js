import {socket, util} from './main.js';

export default class Chat
{
  constructor() {
    this.self = document.getElementById('chat');
    this.chat_body = document.getElementById('chat_body');
    this.opp_log = document.getElementById('opp_log');
    this.my_log = document.getElementById('my_log');
    this.text_area = document.getElementById('text_area');
    this.chat_button = document.getElementById('chat_button');
    this.chat_button.addEventListener('click', event => {
      if(this.text_area.value === "") {return;}
      socket.emit('submit', this.text_area.value);
      this.text_area.value = "";
    });
  }

  serverConnect() {
    socket.on('receive', (text, turn) => {
      let log;
      const p = document.createElement('p');
      if(turn == util.player.turn) {
        log = this.my_log.cloneNode(true);
        p.classList.add("border", "border-success", "rounded", "py-1", "px-2", "float-right");
        p.style.backgroundColor = "#98FB98";
      }else {
        log = this.opp_log.cloneNode(true);
        p.classList.add("border", "border-success", "rounded", "bg-white", "py-1", "px-2", "float-left");
      }
      const rep = text.replace(/\r?\n/g, "<br>");
      p.innerHTML = rep;
      log.appendChild(p);
      this.chat_body.appendChild(log);
      this.self.scrollTop = this.chat_body.scrollHeight;
    });
  }
}
