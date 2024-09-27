import _ from 'lodash';
import m from 'mithril';

class Grid {
  constructor() {
    this.rowCount = 7;
    this.columnCount = this.rowCount;
    this.chipBaseWidth = 32;
    this.chipMargin = 10;
    this.chipFullWidth = this.chipBaseWidth + this.chipMargin;
    this.gridMinTranslateX = 0;
    this.gridMinTranslateY = 0;
    this.gridMaxTranslateX = this.chipFullWidth * (this.columnCount + 1);
    this.gridMaxTranslateY = this.chipFullWidth * (this.rowCount + 1);
    this.chipMap = {};
    _.times(this.columnCount, (c) => {
      this.chipMap[c] = {};
    });
  }

  getChip({ row, column }) {
    return this.chipMap[column][row];
  }

  findNextAvailableRow({ row, column }) {
    if (row === -1) {
      for (let r = 0; r < this.rowCount; r += 1) {
        if (this.getChip({ row: r, column })) {
          return r - 1 >= 0 ? r - 1 : null;
        }
      }
      return this.rowCount - 1;
    } else if (row === this.rowCount) {
      for (let r = this.rowCount - 1; r >= 0; r -= 1) {
        if (this.getChip({ row: r, column })) {
          return r + 1 < this.rowCount ? r + 1 : null;
        }
      }
      return 0;
    }
    return null;
  }

  findNextAvailableColumn({ row, column }) {
    if (column === -1) {
      for (let c = 0; c < this.columnCount; c += 1) {
        if (this.getChip({ row, column: c })) {
          return c - 1 >= 0 ? c - 1 : null;
        }
      }
      return this.columnCount - 1;
    } else if (column === this.columnCount) {
      for (let c = this.columnCount - 1; c >= 0; c -= 1) {
        if (this.getChip({ row, column: c })) {
          return c + 1 < this.columnCount ? c + 1 : null;
        }
      }
      return 0;
    }
    return null;
  }

  findNextAvailableSlot({ row = null, column = null }) {
    // If either X or Y is within the bounds of the grid, place the chip
    // accordingly
    if (column >= 0 && column < this.columnCount) {
      row = this.findNextAvailableRow({ row, column });
      if (row === null) {
        return false;
      }
      return { row, column };
    } else if (row >= 0 && row < this.rowCount) {
      column = this.findNextAvailableColumn({ row, column });
      if (column === null) {
        return false;
      }
      return { row, column };
    }
    return false;
  }

  placeChip({ row = null, column = null }) {
    const availableSlot = this.findNextAvailableSlot({ row, column });
    if (availableSlot) {
      this.chipMap[availableSlot.column][availableSlot.row] = game.currentPlayer;
    }
    return true;
  }
}
const grid = new Grid();

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
const game = new Game();

class GridComponent {
  oninit() {
    this.pendingChipX = grid.chipFullWidth;
    this.pendingChipY = 0;
    this.pendingChipMovePromise = Promise.resolve();
  }

  snapTo(value, snapIncrement) {
    return Math.abs(Math.round(value / snapIncrement) * snapIncrement);
  }

  getPendingChipCoords(event) {
    let newPendingChipX = event.pageX - event.currentTarget.offsetLeft - grid.chipFullWidth / 2;
    let newPendingChipY = event.pageY - event.currentTarget.offsetTop - grid.chipFullWidth / 2;
    newPendingChipX = this.snapTo(newPendingChipX, grid.chipFullWidth);
    newPendingChipY = this.snapTo(newPendingChipY, grid.chipFullWidth);
    return {
      x: newPendingChipX,
      y: newPendingChipY
    };
  }

  async movePendingChip(event) {
    if (this.placingChip) {
      return;
    }
    const pendingChipCoords = this.getPendingChipCoords(event);
    if (pendingChipCoords.x === this.pendingChipX && pendingChipCoords.y === this.pendingChipY) {
      event.redraw = false;
    }
    if (
      pendingChipCoords.x === 0 ||
      pendingChipCoords.x === grid.gridMaxTranslateX ||
      pendingChipCoords.y === 0 ||
      pendingChipCoords.y === grid.gridMaxTranslateY
    ) {
      this.pendingChipX = pendingChipCoords.x;
      this.pendingChipY = pendingChipCoords.y;
      this.movingPendingChip = true;
      await this.pendingChipMovePromise;
      this.pendingChipMovePromise = new Promise((resolve) => {
        clearTimeout(this.pendingChipMoveTimer);
        this.pendingChipMoveTimer = setTimeout(() => {
          this.movingPendingChip = false;
          resolve();
        }, 150);
      });
    }
  }

  async beginPlaceChip(event) {
    let currentPendingChipCoords = this.getPendingChipCoords(event);
    if (
      currentPendingChipCoords.x !== this.pendingChipX ||
      currentPendingChipCoords.y !== this.pendingChipY
    ) {
      this.movePendingChip(event);
      return;
    }
    await this.pendingChipMovePromise;
    // Treat the four corners of the grid as invalid
    let chipRow = this.pendingChipY / grid.chipFullWidth - 1;
    let chipColumn = this.pendingChipX / grid.chipFullWidth - 1;
    const availableSlot = grid.findNextAvailableSlot({
      row: chipRow,
      column: chipColumn
    });
    if (availableSlot) {
      this._origPendingChipX = this.pendingChipX;
      this._origPendingChipY = this.pendingChipY;
      this.placingChip = true;
      this.pendingChipX = grid.chipFullWidth * (availableSlot.column + 1);
      this.pendingChipY = grid.chipFullWidth * (availableSlot.row + 1);
      setTimeout(() => {
        this.pendingChipX = this._origPendingChipX;
        this.pendingChipY = this._origPendingChipY;
        this.disablePendingChipTransition = true;
        m.redraw();
        this.finishPlaceChip({
          row: chipRow,
          column: chipColumn
        });
      }, 750);
      m.redraw();
    }
  }

  finishPlaceChip({ row, column }) {
    grid.placeChip({ row, column });
    this.placingChip = false;
    game.takeTurn();
    m.redraw();
    this.disablePendingChipTransition = false;
    m.redraw();
  }

  getTransformString() {
    return `translate(${this.pendingChipX}px, ${this.pendingChipY}px)`;
  }

  view() {
    return m(
      'div.grid',
      {
        onmousemove: (event) => window.ontouchstart === undefined && this.movePendingChip(event),
        onmousedown: (event) => this.beginPlaceChip(event)
      },
      [
        m(
          'div.chip.pending',
          m(`div.chip-inner.${game.currentPlayer}`, {
            class: this.placingChip ? 'placing-chip' : '',
            style: {
              transform: this.getTransformString(),
              transition: this.disablePendingChipTransition ? 'none' : ''
            }
          })
        ),
        _.times(grid.columnCount, (c) => {
          return m(
            'div.grid-column',
            _.times(grid.rowCount, (r) => {
              const chip = grid.getChip({ row: r, column: c });
              if (chip) {
                return m('div.chip', m(`div.chip-inner.${chip}`));
              } else {
                return m('div.empty-chip-slot', m('div.empty-chip-slot-inner'));
              }
            })
          );
        })
      ]
    );
  }
}

class AppComponent {
  view() {
    return m('div.app', [m('h1', 'Multidimensional Connect Four'), m(GridComponent)]);
  }
}

m.mount(document.querySelector('main'), AppComponent);
