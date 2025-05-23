export class UIController {
  constructor(gameController) {
    this.gameController = gameController;
    this.setupUI();
    this.attachEventListeners(); // Add this line
  }

  setupUI() {
    this.createGameHeader();
    this.createTurnIndicator();
    this.createBoardContainer();
    this.createSidebar();
    this.updateDisplay();
  }

  createGameHeader() {
    const header = document.createElement("div");
    header.className = "game-header";
    header.innerHTML = "<h1>Stak</h1>";
    document.querySelector(".main-area").prepend(header);
  }

  createTurnIndicator() {
    const wrapper = document.querySelector(".board-wrapper");
    const indicator = document.createElement("div");
    indicator.className = "turn-indicator";
    indicator.innerHTML = `
          <div id="player1" class="player-turn active">
              <div class="player-indicator"></div>
              <div>
                  <div style="font-weight: 600;">White</div>
                  <div class="player-pieces">
                      <span id="white-flats">21</span>F • <span id="white-capstones">1</span>C
                  </div>
              </div>
          </div>
          <div id="player2" class="player-turn">
              <div class="player-indicator black"></div>
              <div>
                  <div style="font-weight: 600;">Black</div>
                  <div class="player-pieces">
                      <span id="black-flats">21</span>F • <span id="black-capstones">1</span>C
                  </div>
              </div>
          </div>
      `;
    wrapper.prepend(indicator);
  }

  createBoardContainer() {
    const wrapper = document.querySelector(".board-wrapper");
    const container = document.createElement("div");
    container.className = "board-container";
    container.innerHTML = `
          <div class="status-messages">
              <div id="first-turn-notice" class="first-turn-notice" style="display: none;">
                  First turn: Place your opponent's flat stone
              </div>
              <div id="win-message" class="win-message" style="display: none;"></div>
          </div>
          <div id="board-container"></div>
      `;
    wrapper.appendChild(container);
  }

  createSidebar() {
    const sidebar = document.querySelector(".sidebar");

    // Game actions
    const actions = document.createElement("div");
    actions.className = "game-actions";
    actions.innerHTML = `
          <button class="new-game-button" id="newGameBtn">New Game</button>
      `;
    sidebar.appendChild(actions);

    // Game log
    const log = document.createElement("div");
    log.className = "game-log";
    log.innerHTML = `
          <h3>Move History</h3>
          <div class="log-entries" id="log"></div>
      `;
    sidebar.appendChild(log);
  }

  attachEventListeners() {
    // Attach event listeners after elements are created
    const newGameBtn = document.getElementById("newGameBtn");
    if (newGameBtn) {
      newGameBtn.addEventListener("click", () => {
        console.log("New Game button clicked");
        this.gameController.showNewGameDialog();
      });
    }
  }

  updateDisplay() {
    const gameState = this.gameController.gameState;

    // Only update if gameState exists
    if (!gameState) return;

    // Update piece counts
    this.updatePieceCounts(gameState);

    // Update player indicators
    this.updatePlayerIndicators(gameState);

    // Update status messages
    this.updateStatusMessages(gameState);
  }

  updatePieceCounts(gameState) {
    const white = gameState.players.white;
    const black = gameState.players.black;

    document.getElementById("white-flats").textContent = white.flats;
    document.getElementById("white-capstones").textContent = white.capstones;
    document.getElementById("black-flats").textContent = black.flats;
    document.getElementById("black-capstones").textContent = black.capstones;
  }

  updatePlayerIndicators(gameState) {
    document
      .getElementById("player1")
      .classList.toggle("active", gameState.currentPlayer === "white");
    document
      .getElementById("player2")
      .classList.toggle("active", gameState.currentPlayer === "black");
  }

  updateStatusMessages(gameState) {
    const firstTurnNotice = document.getElementById("first-turn-notice");
    const winMessage = document.getElementById("win-message");

    // Always hide first turn notice since we removed that rule
    firstTurnNotice.style.display = "none";

    if (gameState.winner) {
      winMessage.style.display = "block";
      winMessage.textContent = this.getWinMessage(gameState.winner);
    } else {
      winMessage.style.display = "none";
    }
  }

  getWinMessage(winner) {
    if (winner.player === "draw") {
      return "It's a draw!";
    } else if (winner.type === "road") {
      return `${
        winner.player.charAt(0).toUpperCase() + winner.player.slice(1)
      } wins by road!`;
    } else {
      return `${
        winner.player.charAt(0).toUpperCase() + winner.player.slice(1)
      } wins by flat count (${winner.count})!`;
    }
  }
}
