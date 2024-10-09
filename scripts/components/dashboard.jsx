import m from 'mithril';

class DashboardComponent {
  oninit({ attrs: { game } }) {
    this.game = game;
  }

  view() {
    return m('div.dashboard', [
      m(
        'button',
        {
          onclick: () => {
            this.game.startGame();
          }
        },
        this.game.winner ? 'Play Again' : this.game.inProgress ? 'Start Over' : 'Start Game'
      )
    ]);
  }
}

export default DashboardComponent;
