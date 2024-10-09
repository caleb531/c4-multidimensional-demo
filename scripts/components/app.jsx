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
    return (
      <div className="app">
        <div className={clsx('game', {
          'in-progress': this.game.inProgress
        })}>
          <h1>Multidimensional Connect Four</h1>
          <DashboardComponent game={this.game} />
          <GridComponent grid={this.grid} game={this.game} />
        </div>
      </div>
    );
  }
}

export default AppComponent;
