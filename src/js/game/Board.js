import { isValidSquare } from '../utils/helpers.js';

export class Board {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill(null).map(() => 
            Array(size).fill(null).map(() => [])
        );
    }

    getStack(row, col) {
        if (!isValidSquare(row, col, this.size)) return null;
        return this.grid[row][col];
    }

    getTopPiece(row, col) {
        const stack = this.getStack(row, col);
        return stack && stack.length > 0 ? stack[stack.length - 1] : null;
    }

    isSquareEmpty(row, col) {
        const stack = this.getStack(row, col);
        return stack && stack.length === 0;
    }

    placePiece(row, col, piece) {
        const stack = this.getStack(row, col);
        if (stack && stack.length === 0) {
            stack.push(piece);
            return true;
        }
        return false;
    }

    addToStack(row, col, pieces) {
        const stack = this.getStack(row, col);
        if (stack) {
            stack.push(...pieces);
            return true;
        }
        return false;
    }

    removeFromStack(row, col, count) {
        const stack = this.getStack(row, col);
        if (stack && stack.length >= count) {
            return stack.splice(-count);
        }
        return [];
    }

    isFull() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.isSquareEmpty(row, col)) return false;
            }
        }
        return true;
    }

    clone() {
        const newBoard = new Board(this.size);
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                newBoard.grid[row][col] = this.grid[row][col].map(p => p.clone());
            }
        }
        return newBoard;
    }
}