import _ from 'lodash';

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

  placeChip({ row = null, column = null, player = null }) {
    const availableSlot = this.findNextAvailableSlot({ row, column });
    if (availableSlot) {
      this.chipMap[availableSlot.column][availableSlot.row] = player;
    }
    return true;
  }
}

export default Grid;
