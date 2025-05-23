export class BoardRenderer {
  constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.boardElement = null;
  }

  render(gameState, callbacks = {}) {
      if (!this.boardElement) {
          this.createBoardElement();
      }

      this.boardElement.innerHTML = '';
      this.boardElement.style.gridTemplateColumns = `repeat(${gameState.boardSize}, 1fr)`;
      
      for (let row = 0; row < gameState.boardSize; row++) {
          for (let col = 0; col < gameState.boardSize; col++) {
              const square = this.createSquareElement(row, col, gameState, callbacks);
              this.boardElement.appendChild(square);
          }
      }
      
      // Highlight winning road if game is over
      if (gameState.winner && gameState.winner.road) {
          this.highlightWinningRoad(gameState.winner.road, gameState.boardSize);
      }
  }

  createBoardElement() {
      this.boardElement = document.createElement('div');
      this.boardElement.id = 'board';
      this.boardElement.className = 'board';
      this.container.appendChild(this.boardElement);
  }

  createSquareElement(row, col, gameState, callbacks) {
      const square = document.createElement('div');
      square.className = 'square';
      square.dataset.row = row;
      square.dataset.col = col;
      
      if (callbacks.onSquareClick) {
          square.onclick = () => callbacks.onSquareClick(row, col);
      }
      
      // Add special classes
      if (callbacks.isSelected && callbacks.isSelected(row, col)) {
          square.classList.add('selected');
      }
      
      if (callbacks.isValidMove && callbacks.isValidMove(row, col)) {
          square.classList.add('valid-move');
      }
      
      // Render pieces in the stack
      const stack = gameState.board.getStack(row, col);
      if (stack && stack.length > 0) {
          stack.forEach(piece => {
              const pieceEl = this.createPieceElement(piece);
              square.appendChild(pieceEl);
          });
          
          // Show stack count
          if (stack.length > 1) {
              const count = document.createElement('div');
              count.className = 'stack-count';
              count.textContent = stack.length;
              square.appendChild(count);
          }
      }
      
      return square;
  }

  createPieceElement(piece) {
      const pieceEl = document.createElement('div');
      pieceEl.className = `piece ${piece.type} ${piece.color}`;
      return pieceEl;
  }

  highlightWinningRoad(road, boardSize) {
      road.forEach(({row, col}) => {
          const square = this.boardElement.children[row * boardSize + col];
          square.classList.add('winning-road');
      });
  }

  highlightSquares(squares, className) {
      squares.forEach(({row, col}) => {
          const square = this.getSquareElement(row, col);
          if (square) square.classList.add(className);
      });
  }

  clearHighlights(className) {
      this.boardElement.querySelectorAll(`.${className}`).forEach(el => {
          el.classList.remove(className);
      });
  }

  getSquareElement(row, col) {
      return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }
}