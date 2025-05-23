import { GameState } from "../game/GameState.js";
import { Rules } from "../game/Rules.js";
import { BoardRenderer } from "../ui/BoardRenderer.js";
import { ModalManager } from "../ui/ModalManager.js";
import { GameLog } from "../ui/GameLog.js";
import { UIController } from "../ui/UIController.js";
import { MoveController } from "./MoveController.js";
import { InputHandler } from "./InputHandler.js";
import { squareToNotation } from "../utils/helpers.js";

export class GameController {
  constructor() {
    // Initialize UI components first
    this.uiController = new UIController(this);

    // Track game number here
    this.gameNumber = 1;

    // Now that UI is created, initialize other components
    this.gameState = null;
    this.boardRenderer = new BoardRenderer("board-container");
    this.modalManager = new ModalManager();
    this.gameLog = new GameLog("log");
    this.moveController = new MoveController(this);
    this.inputHandler = new InputHandler(this);

    this.selectedSquare = null;
    this.pendingPlacement = null;

    this.setupModalCallbacks();
    this.initializeGame();
  }

  setupModalCallbacks() {
    this.modalManager.onModalCancel = () => this.handleEscape();
  }

  initializeGame(boardSize = 5) {
    // Only increment game number if we're starting a new game (not the first one)
    if (this.gameState) {
      this.gameNumber++;
    }

    this.gameState = new GameState(boardSize);

    this.gameLog.startNewGame(this.gameNumber, boardSize);
    this.moveController.resetMoveState();
    this.selectedSquare = null;
    this.pendingPlacement = null;

    this.render();
  }

  render() {
    const callbacks = {
      onSquareClick: (row, col) =>
        this.inputHandler.handleSquareClick(row, col),
      isSelected: (row, col) => {
        return (
          this.selectedSquare &&
          this.selectedSquare.row === row &&
          this.selectedSquare.col === col
        );
      },
      isValidMove: (row, col) => {
        return this.moveController.validMoves.some(
          (m) => m.row === row && m.col === col
        );
      },
    };

    this.boardRenderer.render(this.gameState, callbacks);
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.uiController) {
      this.uiController.updateDisplay();
    }
  }

  handlePlacement(row, col) {
    console.log("handlePlacement called for", row, col);
    this.pendingPlacement = { row, col };

    const pieceOptions = [];
    const player = this.gameState.getCurrentPlayerObj();

    console.log(
      "Current player:",
      this.gameState.currentPlayer,
      "Pieces:",
      player
    );

    // Show available pieces for current player
    if (player.canPlaceFlat()) {
      pieceOptions.push({
        type: "flat",
        color: this.gameState.currentPlayer,
        count: `${player.flats} left`,
        enabled: true,
        showCount: true,
      });
      pieceOptions.push({
        type: "standing",
        color: this.gameState.currentPlayer,
        count: `(${player.flats})`,
        enabled: true,
        showCount: true,
      });
    }

    if (player.canPlaceCapstone()) {
      pieceOptions.push({
        type: "capstone",
        color: this.gameState.currentPlayer,
        count: `${player.capstones} left`,
        enabled: true,
        showCount: true,
      });
    }

    console.log("Piece options:", pieceOptions);

    const info = `${
      this.gameState.currentPlayer === "white" ? "White" : "Black"
    }'s turn`;

    this.modalManager.showPieceModal(pieceOptions, info, (type) => {
      this.executePlacement(type);
    });
  }

  executePlacement(pieceType) {
    if (!this.pendingPlacement) return;

    const { row, col } = this.pendingPlacement;

    if (this.gameState.placePiece(row, col, pieceType)) {
      // Create notation
      const notation = squareToNotation(row, col, this.gameState.boardSize);
      let moveNotation = notation;

      if (pieceType === "standing") moveNotation = "S" + notation;
      else if (pieceType === "capstone") moveNotation = "C" + notation;

      // Log the move
      this.gameLog.addEntry(`${this.gameState.currentPlayer}: ${moveNotation}`);

      // Check for winner
      const winner = Rules.checkWinner(this.gameState);
      if (winner) {
        this.gameState.setWinner(winner);
        this.endGame();
      } else if (this.gameState.isGameComplete()) {
        const flatWinner = Rules.checkFlatWin(this.gameState.board);
        this.gameState.setWinner(flatWinner);
        this.endGame();
      } else {
        // Switch turns
        this.gameState.switchTurn();
      }

      this.render();
    }

    this.pendingPlacement = null;
  }

  handleStackSelection(row, col) {
    const stack = this.gameState.board.getStack(row, col);
    const maxPieces = Math.min(stack.length, this.gameState.boardSize);

    this.selectedSquare = { row, col };

    this.modalManager.showStackModal(stack, maxPieces, (count) => {
      this.moveController.startStackMove(row, col, count);
      this.render();
    });
  }

  handleDropPosition(row, col) {
    const remaining = this.moveController.remainingPieces.length;

    // Check if we can continue moving
    let canContinue = false;
    if (this.moveController.dropPath.length > 0 && remaining > 1) {
      const validMoves = this.moveController.validMoves;
      canContinue = validMoves.length > 0;
    }

    if (!canContinue || remaining === 1) {
      // Must drop all remaining pieces
      this.moveController.dropPieces(row, col, remaining);
      this.render();
    } else {
      // Show drop dialog
      this.modalManager.showDropModal(remaining, remaining, (count) => {
        this.moveController.dropPieces(row, col, count);
        this.render();
      });
    }
  }

  handleEscape() {
    this.moveController.cancelMove();
    this.selectedSquare = null;
    this.pendingPlacement = null;
    this.modalManager.closeAllModals();
    this.render();
  }

  showNewGameDialog() {
    const boardSizes = [3, 4, 5, 6, 7, 8, 9];
    this.modalManager.showNewGameModal(
      boardSizes,
      this.gameState.boardSize,
      (size) => {
        this.initializeGame(size);
      }
    );
  }

  endGame() {
    const winner = this.gameState.winner;
    let winnerText;

    if (winner.player === "draw") {
      winnerText = "Draw";
    } else {
      const playerName =
        winner.player.charAt(0).toUpperCase() + winner.player.slice(1);
      if (winner.type === "road") {
        winnerText = `${playerName} by road`;
      } else {
        winnerText = `${playerName} by flats (${winner.count})`;
      }
    }

    this.gameLog.setGameWinner(
      this.gameNumber,
      this.gameState.boardSize,
      winnerText
    );

    this.render();
  }
}
