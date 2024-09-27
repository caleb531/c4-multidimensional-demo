class Game {
  constructor() {
    this.players = ['red', 'blue'];
    this.currentPlayer = this.players[0];
  }
  takeTurn() {
    this.currentPlayer =
      this.players[(this.players.indexOf(this.currentPlayer) + 1) % this.players.length];
  }
}

export default Game;
