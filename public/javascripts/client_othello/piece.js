export default class Piece
{
  constructor(pieceType, x, y) {
    this.self = pieceType.cloneNode(true);
    this.x = x;
    this.y = y;
    //this.addListener();
  }

  addListener(boardData, callback) {
    this.self.addEventListener('click', event => {
      callback(this.x, this.y, boardData);
    });

    this.self.addEventListener('touchend', event => {
      callback(this.x, this.y, boardData);
    });
  }
}
