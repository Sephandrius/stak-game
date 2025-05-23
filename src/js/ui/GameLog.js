export class GameLog {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.games = new Map(); // Use Map to store games by number
    this.currentGameNumber = null;
  }

  addEntry(message) {
    if (this.currentGameNumber && this.games.has(this.currentGameNumber)) {
      this.games.get(this.currentGameNumber).moves.push(message);
      this.render();
    }
  }

  startNewGame(gameNumber, boardSize) {
    // Don't create duplicate entries
    if (!this.games.has(gameNumber)) {
      this.games.set(gameNumber, {
        gameNumber: gameNumber,
        boardSize: boardSize,
        moves: [],
        winner: null,
        isComplete: false,
      });
    }

    this.currentGameNumber = gameNumber;
    this.addEntry(`Game ${gameNumber} started (${boardSize}×${boardSize})`);
  }

  setGameWinner(gameNumber, boardSize, winner) {
    if (this.games.has(gameNumber)) {
      const game = this.games.get(gameNumber);
      game.winner = winner;
      game.isComplete = true;
    }
    this.render();
  }

  render() {
    this.container.innerHTML = "";

    // Convert Map to array and sort by game number (descending)
    const gamesArray = Array.from(this.games.values()).sort(
      (a, b) => b.gameNumber - a.gameNumber
    );

    gamesArray.forEach((game) => {
      const isCurrentGame =
        game.gameNumber === this.currentGameNumber && !game.isComplete;
      const title = isCurrentGame
        ? `Game ${game.gameNumber}`
        : `Game ${game.gameNumber} (${game.boardSize}×${game.boardSize})${
            game.winner ? ` - ${game.winner}` : ""
          }`;

      const section = this.createGameSection(
        title,
        game.moves,
        !isCurrentGame // Collapse all except current game
      );
      this.container.appendChild(section);
    });
  }

  createGameSection(title, moves, collapsed) {
    const section = document.createElement("div");
    section.className = "game-section";

    const header = document.createElement("div");
    header.className = "game-section-header" + (collapsed ? " collapsed" : "");

    const titleEl = document.createElement("div");
    titleEl.className = "game-section-title";
    titleEl.textContent = title;

    const arrow = document.createElement("div");
    arrow.className = "game-section-arrow";
    arrow.textContent = "▼";

    header.appendChild(titleEl);
    header.appendChild(arrow);

    const content = document.createElement("div");
    content.className =
      "game-section-content" + (collapsed ? " collapsed" : "");

    // Add moves in reverse order (most recent first)
    const reversedMoves = [...moves].reverse();
    reversedMoves.forEach((move) => {
      const entry = document.createElement("div");
      entry.className = "log-entry";
      entry.textContent = move;
      content.appendChild(entry);
    });

    header.onclick = () => {
      header.classList.toggle("collapsed");
      content.classList.toggle("collapsed");
    };

    section.appendChild(header);
    section.appendChild(content);

    return section;
  }
}
