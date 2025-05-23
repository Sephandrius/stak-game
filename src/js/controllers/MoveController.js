import { DIRECTIONS, DIRECTION_SYMBOLS } from '../utils/constants.js';
import { squareToNotation } from '../utils/helpers.js';
import { Rules } from '../game/Rules.js';

export class MoveController {
    constructor(gameController) {
        this.gameController = gameController;
        this.resetMoveState();
    }

    resetMoveState() {
        this.movingStack = false;
        this.stackToMove = [];
        this.stackOrigin = null;
        this.validMoves = [];
        this.dropPath = [];
        this.remainingPieces = [];
        this.currentDropTarget = null;
    }

    startStackMove(row, col, pieceCount) {
        const gameState = this.gameController.gameState;
        const stack = gameState.board.getStack(row, col);
        
        // Pick up pieces from the stack
        this.stackToMove = gameState.board.removeFromStack(row, col, pieceCount);
        this.remainingPieces = [...this.stackToMove];
        this.stackOrigin = { row, col };
        this.dropPath = [this.stackOrigin];
        this.movingStack = true;
        
        // Calculate initial valid moves
        this.updateValidMoves();
    }

    updateValidMoves() {
        this.validMoves = [];
        const lastPos = this.dropPath[this.dropPath.length - 1];
        
        if (this.dropPath.length === 1) {
            // First move - can go in any direction
            for (const [dr, dc] of Object.values(DIRECTIONS)) {
                const nr = lastPos.row + dr;
                const nc = lastPos.col + dc;
                if (this.canMoveToPosition(nr, nc)) {
                    this.validMoves.push({ row: nr, col: nc });
                }
            }
        } else {
            // Continue in same direction
            const prevPos = this.dropPath[this.dropPath.length - 2];
            const dr = lastPos.row - prevPos.row;
            const dc = lastPos.col - prevPos.col;
            const nr = lastPos.row + dr;
            const nc = lastPos.col + dc;
            
            if (this.canMoveToPosition(nr, nc)) {
                this.validMoves.push({ row: nr, col: nc });
            }
        }
    }

    canMoveToPosition(row, col) {
        const gameState = this.gameController.gameState;
        const board = gameState.board;
        
        // Check if position is valid
        if (row < 0 || row >= board.size || col < 0 || col >= board.size) {
            return false;
        }
        
        // Check if we can move to this square
        const topMovingPiece = this.remainingPieces[this.remainingPieces.length - 1];
        const isLastMove = this.remainingPieces.length === 1;
        
        return Rules.canMoveToSquare(board, row, col, topMovingPiece, isLastMove);
    }

    dropPieces(row, col, count) {
        const gameState = this.gameController.gameState;
        const toDrop = this.remainingPieces.splice(0, count);
        const targetStack = gameState.board.getStack(row, col);
        
        // Check if capstone is flattening a wall
        if (toDrop.length === 1 && toDrop[0].isCapstone() && 
            targetStack.length > 0 && targetStack[targetStack.length - 1].isStanding()) {
            targetStack[targetStack.length - 1].flatten();
        }
        
        // Add pieces to target
        gameState.board.addToStack(row, col, toDrop);
        this.dropPath.push({ row, col });
        
        // If no more pieces, complete the move
        if (this.remainingPieces.length === 0) {
            this.completeMove();
        } else {
            // Update valid moves for next drop
            this.updateValidMoves();
        }
    }

    completeMove() {
        const gameState = this.gameController.gameState;
        
        // Create move notation
        const notation = this.createMoveNotation();
        
        // Record the move
        gameState.moveHistory.push({
            player: gameState.currentPlayer,
            type: 'move',
            from: this.stackOrigin,
            path: this.dropPath,
            pieces: this.stackToMove.length,
            notation: notation
        });
        
        // Log the move
        this.gameController.gameLog.addEntry(
            `${gameState.currentPlayer}: ${notation}`
        );
        
        // Reset move state
        this.resetMoveState();
        
        // Check for winner
        const winner = Rules.checkWinner(gameState);
        if (winner) {
            gameState.setWinner(winner);
            this.gameController.endGame();
        } else if (gameState.isGameComplete()) {
            const flatWinner = Rules.checkFlatWin(gameState.board);
            gameState.setWinner(flatWinner);
            this.gameController.endGame();
        } else {
            // Switch turns
            gameState.switchTurn();
            this.gameController.updateDisplay();
        }
    }

    createMoveNotation() {
        const start = squareToNotation(
            this.stackOrigin.row, 
            this.stackOrigin.col, 
            this.gameController.gameState.boardSize
        );
        
        let notation = this.stackToMove.length + start;
        
        // Add direction symbols
        for (let i = 1; i < this.dropPath.length; i++) {
            const dr = this.dropPath[i].row - this.dropPath[i-1].row;
            const dc = this.dropPath[i].col - this.dropPath[i-1].col;
            notation += DIRECTION_SYMBOLS[`${dr},${dc}`];
        }
        
        return notation;
    }

    cancelMove() {
        // Return picked up pieces
        if (this.stackToMove.length > 0 && this.stackOrigin) {
            const gameState = this.gameController.gameState;
            gameState.board.addToStack(
                this.stackOrigin.row, 
                this.stackOrigin.col, 
                this.stackToMove
            );
        }
        
        // Return any remaining pieces
        if (this.remainingPieces.length > 0 && this.dropPath.length > 0) {
            const lastDrop = this.dropPath[this.dropPath.length - 1];
            const gameState = this.gameController.gameState;
            gameState.board.addToStack(
                lastDrop.row, 
                lastDrop.col, 
                this.remainingPieces
            );
        }
        
        this.resetMoveState();
    }
}