import Player from './player.js';

class Game {
  constructor({
    grid,
    players = [new Player({ color: 'red' }), new Player({ color: 'blue' })]
  } = {}) {
    this.grid = grid;
    this.players = players;
    this.inProgress = false;
    this.winner = null;
    this.currentPlayer = null;
    this.initialPlayer = null;
  }

  startGame() {
    this.grid.reset();
    this.inProgress = true;
    // For the initial game, the first player starts the first turn, but for
    // subsequent games, the player who has the first turn alternates
    this.initialPlayer =
      this.players[(this.players.indexOf(this.initialPlayer) + 1) % this.players.length];
    this.currentPlayer = this.initialPlayer;
    this.winner = null;
  }

  endGame() {
    this.inProgress = false;
  }

  takeTurn() {
    this.currentPlayer =
      this.players[(this.players.indexOf(this.currentPlayer) + 1) % this.players.length];
  }

  // Determine if a player won the game with four chips in a row (horizontally,
  // vertically, or diagonally)
  checkForWin() {
    if (!this.grid.lastPlacedChip) {
      return;
    }
    const connections = this.grid.getConnections({
      baseChip: this.grid.lastPlacedChip,
      minConnectionSize: Game.winningConnectionSize
    });
    if (connections.length > 0) {
      // Mark chips in only the first winning connection, and only mark the
      // first four chips of this connection (since only a connect-four is
      // needed to win
      connections[0].length = Game.winningConnectionSize;
      connections[0].forEach((chip) => {
        chip.winning = true;
      });
      this.winner = this.grid.lastPlacedChip.player;
      this.winner.score += 1;
      this.endGame();
    }
  }
}
Game.winningConnectionSize = 4;

export default Game;
