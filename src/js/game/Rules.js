import { DIRECTIONS, PIECE_TYPES } from "../utils/constants.js";
import { isValidSquare } from "../utils/helpers.js";

export class Rules {
  static canPlacePiece(gameState, row, col) {
    return gameState.board.isSquareEmpty(row, col);
  }

  static canMoveToSquare(board, row, col, movingPiece, isLastMove = false) {
    if (!isValidSquare(row, col, board.size)) return false;

    const topPiece = board.getTopPiece(row, col);
    if (!topPiece) return true; // Empty square

    // Cannot move onto or through capstones
    if (topPiece.isCapstone()) return false;

    // For standing stones, check if we can flatten them
    if (topPiece.isStanding()) {
      // If the moving piece is a capstone, it can flatten on the last move
      if (movingPiece.isCapstone() && isLastMove) return true;
      // Otherwise, cannot move onto walls
      return false;
    }

    return true;
  }

  static getValidMoves(board, fromRow, fromCol, direction = null) {
    const validMoves = [];
    const dirs = direction ? [direction] : Object.values(DIRECTIONS);

    for (const [dr, dc] of dirs) {
      const nr = fromRow + dr;
      const nc = fromCol + dc;
      if (isValidSquare(nr, nc, board.size)) {
        validMoves.push({ row: nr, col: nc });
      }
    }

    return validMoves;
  }

  static findRoad(board, color) {
    const size = board.size;

    // Check horizontal roads (left to right)
    for (let row = 0; row < size; row++) {
      if (this.isControlled(board, row, 0, color)) {
        const road = this.dfs(board, row, 0, color, "horizontal", new Set());
        if (road) return road;
      }
    }

    // Check vertical roads (top to bottom)
    for (let col = 0; col < size; col++) {
      if (this.isControlled(board, 0, col, color)) {
        const road = this.dfs(board, 0, col, color, "vertical", new Set());
        if (road) return road;
      }
    }

    return null;
  }

  static dfs(board, row, col, color, direction, visited) {
    const key = `${row},${col}`;
    if (visited.has(key)) return null;
    visited.add(key);

    // Check if we've reached the opposite side
    if (direction === "horizontal" && col === board.size - 1) {
      return [{ row, col }];
    }
    if (direction === "vertical" && row === board.size - 1) {
      return [{ row, col }];
    }

    // Try all orthogonal directions
    for (const [dr, dc] of Object.values(DIRECTIONS)) {
      const nr = row + dr;
      const nc = col + dc;

      if (isValidSquare(nr, nc, board.size)) {
        if (this.isControlled(board, nr, nc, color)) {
          const path = this.dfs(board, nr, nc, color, direction, visited);
          if (path) {
            return [{ row, col }, ...path];
          }
        }
      }
    }

    return null;
  }

  static isControlled(board, row, col, color) {
    const topPiece = board.getTopPiece(row, col);
    return (
      topPiece &&
      topPiece.color === color &&
      (topPiece.isFlat() || topPiece.isCapstone())
    );
  }

  static checkFlatWin(board) {
    let whiteFlats = 0;
    let blackFlats = 0;

    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        const topPiece = board.getTopPiece(row, col);
        if (topPiece && (topPiece.isFlat() || topPiece.isCapstone())) {
          if (topPiece.color === "white") whiteFlats++;
          else blackFlats++;
        }
      }
    }

    if (whiteFlats > blackFlats)
      return { player: "white", type: "flats", count: whiteFlats };
    if (blackFlats > whiteFlats)
      return { player: "black", type: "flats", count: blackFlats };
    return { player: "draw", type: "flats" };
  }

  static checkWinner(gameState) {
    // Check both players for roads
    const whiteRoad = this.findRoad(gameState.board, "white");
    const blackRoad = this.findRoad(gameState.board, "black");

    // If both players have roads, the player who just moved wins
    if (whiteRoad && blackRoad) {
      // The current player hasn't switched yet, so they made the winning move
      return {
        player: gameState.currentPlayer,
        type: "road",
        road: gameState.currentPlayer === "white" ? whiteRoad : blackRoad,
      };
    }

    // Otherwise, check individual roads
    if (whiteRoad) return { player: "white", type: "road", road: whiteRoad };
    if (blackRoad) return { player: "black", type: "road", road: blackRoad };

    // Check for flat win if game is complete
    if (gameState.isGameComplete()) {
      return this.checkFlatWin(gameState.board);
    }

    return null;
  }
}
