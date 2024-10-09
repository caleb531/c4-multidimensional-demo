class DashboardComponent {
  oninit({ attrs: { game } }) {
    this.game = game;
  }

  view() {
    return (
      <div className="dashboard">
        <button
          onclick={() => {
            this.game.startGame();
          }}
        >
          {this.game.winner ? 'Play Again' : this.game.inProgress ? 'Start Over' : 'Start Game'}
        </button>
      </div>
    );
  }
}

export default DashboardComponent;
