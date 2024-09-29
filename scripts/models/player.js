class Player {
  constructor({ color, score = 0 }) {
    // The player's chip color (supported colors are black, blue, and red)
    this.color = color;
    // The player's total number of wins across all games
    this.score = score;
  }
}

export default Player;
