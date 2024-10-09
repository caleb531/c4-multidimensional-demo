import clsx from 'clsx';
import m from 'mithril';
import Game from '../models/game.js';
import Grid from '../models/grid.js';
import DashboardComponent from './dashboard.jsx';
import GridComponent from './grid.jsx';

class AppComponent {
  oninit() {
    this.grid = new Grid();
    this.game = new Game({ grid: this.grid });
  }
  view() {
    return m('div.app', [
      m(
        '.game',
        {
          class: clsx({
            'in-progress': this.game.inProgress
          })
        },
        [
          m('h1', 'Multidimensional Connect Four'),
          m(DashboardComponent, { game: this.game }),
          m(GridComponent, { grid: this.grid, game: this.game })
        ]
      )
    ]);
  }
}

export default AppComponent;
