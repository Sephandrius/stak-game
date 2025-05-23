import { GameController } from "./controllers/GameController.js";

console.log("Main.js loaded");

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing game...");
  try {
    window.gameController = new GameController();
    console.log("Game controller created successfully");
  } catch (error) {
    console.error("Error initializing game:", error);
  }
});
