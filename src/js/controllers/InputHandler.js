export class InputHandler {
  constructor(gameController) {
    this.gameController = gameController;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.gameController.handleEscape();
      }
    });
  }

  handleSquareClick(row, col) {
    console.log("Square clicked:", row, col);
    const gameState = this.gameController.gameState;
    const moveController = this.gameController.moveController;

    // If game is over, do nothing
    if (gameState.gameOver) {
      console.log("Game is over, ignoring click");
      return;
    }

    // If in the middle of moving a stack
    if (moveController.movingStack) {
      console.log("Moving stack mode");
      if (
        moveController.validMoves.some((m) => m.row === row && m.col === col)
      ) {
        this.gameController.handleDropPosition(row, col);
      }
      return;
    }

    // Normal square click
    const stack = gameState.board.getStack(row, col);
    console.log("Stack at position:", stack);

    if (stack.length === 0) {
      // Empty square - place a piece
      console.log("Empty square, placing piece");
      this.gameController.handlePlacement(row, col);
    } else {
      // Stack exists - check if player can move it
      const topPiece = stack[stack.length - 1];
      if (topPiece.color === gameState.currentPlayer) {
        console.log("Player owns stack, selecting for movement");
        this.gameController.handleStackSelection(row, col);
      } else {
        console.log("Player does not own this stack");
      }
    }
  }
}
