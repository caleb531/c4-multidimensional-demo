import _ from 'lodash';
import Chip from './chip.js';
import GridConnection from './grid-connection.js';

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
    this.lastPlacedChip = null;
  }

  reset() {
    _.times(this.columnCount, (c) => {
      Object.keys(this.chipMap[c]).forEach((r) => {
        delete this.chipMap[c][r];
      });
    });
  }

  getChip({ row, column }) {
    return this.chipMap[column][row];
  }

  getNextAvailableRow({ row, column }) {
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

  getNextAvailableColumn({ row, column }) {
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

  getNextAvailableSlot({ row = null, column = null }) {
    // If either X or Y is within the bounds of the grid, place the chip
    // accordingly
    if (column >= 0 && column < this.columnCount) {
      row = this.getNextAvailableRow({ row, column });
      if (row === null) {
        return false;
      }
      return { row, column };
    } else if (row >= 0 && row < this.rowCount) {
      column = this.getNextAvailableColumn({ row, column });
      if (column === null) {
        return false;
      }
      return { row, column };
    }
    return false;
  }

  placeChip({ row = null, column = null, player = null }) {
    const availableSlot = this.getNextAvailableSlot({ row, column });
    if (availableSlot) {
      const newChip = new Chip({
        row: availableSlot.row,
        column: availableSlot.column,
        player
      });
      this.chipMap[availableSlot.column][availableSlot.row] = newChip;
      this.lastPlacedChip = newChip;
    }
    return true;
  }

  // Find same-color neighbors connected to the given chip in the given direction
  getSubConnection(baseChip, direction) {
    let neighbor = baseChip;
    const subConnection = new GridConnection();
    while (true) {
      const nextColumn = neighbor.column + direction.x;
      // Stop if the left/right edge of the grid has been reached
      if (this.chipMap[nextColumn] === undefined) {
        break;
      }
      const nextRow = neighbor.row + direction.y;
      const nextNeighbor = this.chipMap[nextColumn][nextRow];
      // Stop if the top/bottom edge of the grid has been reached or if the
      // neighboring slot is empty
      if (nextNeighbor === undefined) {
        if (nextRow >= 0 && nextRow < this.rowCount) {
          subConnection.emptySlotCount += 1;
        }
        break;
      }
      // Stop if this neighbor is not the same color as the original chip
      if (nextNeighbor.player !== baseChip.player) {
        break;
      }
      // Assume at this point that this neighbor chip is connected to the original
      // chip in the given direction
      neighbor = nextNeighbor;
      subConnection.addChip(nextNeighbor);
    }
    return subConnection;
  }

  // Add a sub-connection (in the given direction) to a larger connection
  addSubConnection(connection, baseChip, direction) {
    const subConnection = this.getSubConnection(baseChip, direction);
    connection.addConnection(subConnection);
  }

  // Get all connections of four chips (including connections of four within
  // larger connections) which the last placed chip is apart of
  getConnections({ baseChip, minConnectionSize }) {
    const connections = [];
    GridConnection.directions.forEach((direction) => {
      const connection = new GridConnection({ chips: [baseChip] });
      // Check for connected neighbors in this direction
      this.addSubConnection(connection, baseChip, direction);
      // Check for connected neighbors in the opposite direction
      this.addSubConnection(connection, baseChip, {
        x: -direction.x,
        y: -direction.y
      });
      if (connection.length >= minConnectionSize) {
        connections.push(connection);
      }
    });
    return connections;
  }
}

export default Grid;
