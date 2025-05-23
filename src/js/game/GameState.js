import { Board } from "./Board.js";
import { Player } from "./Player.js";
import { Piece } from "./Piece.js";
import { PLAYERS } from "../utils/constants.js";
import { getOpponentColor } from "../utils/helpers.js";

export class GameState {
  constructor(boardSize = 5) {
    this.boardSize = boardSize;
    this.board = new Board(boardSize);
    this.players = {
      white: new Player(PLAYERS.WHITE, boardSize),
      black: new Player(PLAYERS.BLACK, boardSize),
    };
    this.currentPlayer = PLAYERS.WHITE;
    this.moveHistory = [];
    this.gameOver = false;
    this.winner = null;
  }

  getCurrentPlayerObj() {
    return this.players[this.currentPlayer];
  }

  getOpponentPlayerObj() {
    return this.players[getOpponentColor(this.currentPlayer)];
  }

  placePiece(row, col, pieceType) {
    // Simplified - always place current player's piece
    const piece = new Piece(pieceType, this.currentPlayer);

    if (this.board.placePiece(row, col, piece)) {
      // Update piece counts
      const player = this.getCurrentPlayerObj();
      if (pieceType === "capstone") {
        player.useCapstone();
      } else {
        player.useFlat();
      }

      // Record move
      this.moveHistory.push({
        player: this.currentPlayer,
        type: "place",
        pieceType: pieceType,
        position: { row, col },
      });

      return true;
    }

    return false;
  }

  switchTurn() {
    // Simplified - just switch players
    this.currentPlayer = getOpponentColor(this.currentPlayer);
  }

  isGameComplete() {
    return (
      this.gameOver ||
      this.board.isFull() ||
      this.players.white.hasNoPieces() ||
      this.players.black.hasNoPieces()
    );
  }

  setWinner(winner) {
    this.gameOver = true;
    this.winner = winner;
  }
}
