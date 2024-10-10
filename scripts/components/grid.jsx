import clsx from 'clsx';
import _ from 'lodash';
import m from 'mithril';
import { toMS } from '../utils';

class GridComponent {
  oninit({ attrs: { game, grid } }) {
    this.game = game;
    this.grid = grid;
    this.pendingChipX = this.grid.chipFullWidth;
    this.pendingChipY = 0;
    this.pendingChipMovePromise = Promise.resolve();
    const rootStyles = getComputedStyle(document.documentElement);
    this.chipMoveTransitionDuration = toMS(
      rootStyles.getPropertyValue('--chip-move-transition-duration')
    );
    this.chipPlaceTransitionDuration = toMS(
      rootStyles.getPropertyValue('--chip-place-transition-duration')
    );
  }

  snapTo(value, snapIncrement) {
    return Math.abs(Math.round(value / snapIncrement) * snapIncrement);
  }

  getPendingChipCoords(event) {
    let newPendingChipX =
      event.pageX - event.currentTarget.offsetLeft - this.grid.chipFullWidth / 2;
    let newPendingChipY = event.pageY - event.currentTarget.offsetTop - this.grid.chipFullWidth / 2;
    newPendingChipX = this.snapTo(newPendingChipX, this.grid.chipFullWidth);
    newPendingChipY = this.snapTo(newPendingChipY, this.grid.chipFullWidth);
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
      pendingChipCoords.x === this.grid.gridMaxTranslateX ||
      pendingChipCoords.y === 0 ||
      pendingChipCoords.y === this.grid.gridMaxTranslateY
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
        }, this.chipMoveTransitionDuration);
      });
    }
  }

  async beginPlaceChip(event) {
    if (!this.game.inProgress) {
      return;
    }
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
    let chipRow = this.pendingChipY / this.grid.chipFullWidth - 1;
    let chipColumn = this.pendingChipX / this.grid.chipFullWidth - 1;
    const availableSlot = this.grid.getNextAvailableSlot({
      row: chipRow,
      column: chipColumn
    });
    if (availableSlot) {
      this._origPendingChipX = this.pendingChipX;
      this._origPendingChipY = this.pendingChipY;
      this.placingChip = true;
      this.pendingChipX = this.grid.chipFullWidth * (availableSlot.column + 1);
      this.pendingChipY = this.grid.chipFullWidth * (availableSlot.row + 1);
      setTimeout(() => {
        this.pendingChipX = this._origPendingChipX;
        this.pendingChipY = this._origPendingChipY;
        this.disablePendingChipTransition = true;
        m.redraw();
        this.finishPlaceChip({
          row: chipRow,
          column: chipColumn,
          player: this.game.currentPlayer
        });
      }, this.chipPlaceTransitionDuration);
      m.redraw();
    }
  }

  finishPlaceChip({ row, column, player }) {
    this.grid.placeChip({ row, column, player });
    this.placingChip = false;
    this.game.takeTurn();
    m.redraw();
    this.disablePendingChipTransition = false;
    this.game.checkForWin();
    m.redraw();
  }

  getTransformString() {
    return `translate(${this.pendingChipX}px, ${this.pendingChipY}px)`;
  }

  view() {
    return (
      <div
        className="grid"
        onmousemove={(event) => window.ontouchstart === undefined && this.movePendingChip(event)}
        onmousedown={(event) => this.beginPlaceChip(event)}
      >
        {this.game.inProgress ? (
          <div className="chip pending">
            <div
              className={clsx('chip-inner', this.game.currentPlayer.color, {
                'placing-chip': this.placingChip
              })}
              style={{
                transform: this.getTransformString(),
                transition: this.disablePendingChipTransition ? 'none' : ''
              }}
            />
          </div>
        ) : null}
        {_.times(this.grid.columnCount, (c) => {
          return (
            <div className="grid-column">
              {_.times(this.grid.rowCount, (r) => {
                const chip = this.grid.getChip({ row: r, column: c });
                if (chip) {
                  return (
                    <div className={clsx('chip', { winning: chip.winning })}>
                      <div className={`chip-inner ${chip.player.color}`} />
                    </div>
                  );
                } else {
                  return (
                    <div className="empty-chip-slot">
                      <div className="empty-chip-slot-inner" />
                    </div>
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

export default GridComponent;
