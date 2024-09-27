import m from 'mithril';
import Game from '../models/game.js';
import Grid from '../models/grid.js';
import GridComponent from './grid.js';

class AppComponent {
  oninit() {
    this.game = new Game();
    this.grid = new Grid();
  }
  view() {
    return m('div.app', [
      m('h1', 'Multidimensional Connect Four'),
      m(GridComponent, { game: this.game, grid: this.grid })
    ]);
  }
}

export default AppComponent;
