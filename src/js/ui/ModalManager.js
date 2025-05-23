export class ModalManager {
  constructor() {
    this.activeModal = null;
    this.createModalElements();
    this.setupEventListeners();
  }

  createModalElements() {
    // Create modal container if it doesn't exist
    if (!document.getElementById("modal-container")) {
      const container = document.createElement("div");
      container.id = "modal-container";
      document.body.appendChild(container);

      // Add all modal HTML here
      container.innerHTML = this.getModalHTML();
    }
  }

  getModalHTML() {
    return `
          <!-- New Game Modal -->
          <div id="newGameModal" class="modal">
              <div class="modal-content">
                  <h2>New Game</h2>
                  <p>Select board size:</p>
                  <div class="board-size-options" id="boardSizeOptions"></div>
                  <div class="modal-buttons">
                      <button id="startGameBtn">Start Game</button>
                      <button class="secondary" data-close-modal="newGameModal">Cancel</button>
                  </div>
              </div>
          </div>
          
          <!-- Piece Selection Modal -->
          <div id="pieceModal" class="modal">
              <div class="modal-content">
                  <h2>Place a Piece</h2>
                  <p id="pieceModalInfo"></p>
                  <div class="piece-options" id="pieceOptions"></div>
                  <button class="secondary" data-close-modal="pieceModal">Cancel</button>
              </div>
          </div>
          
          <!-- Stack Movement Modal -->
          <div id="stackModal" class="modal">
              <div class="modal-content">
                  <h2>Move Stack</h2>
                  <div class="stack-info">
                      <h3>Stack Contents</h3>
                      <div class="stack-display" id="stackDisplay"></div>
                  </div>
                  <div class="slider-control">
                      <div class="slider-label">
                          <span>Pieces to pick up:</span>
                          <span id="sliderValue">1</span>
                      </div>
                      <input type="range" class="slider" id="stackSlider" min="1" max="1" value="1">
                  </div>
                  <div class="modal-buttons">
                      <button id="confirmStackBtn">Move</button>
                      <button class="secondary" data-close-modal="stackModal">Cancel</button>
                  </div>
              </div>
          </div>
          
          <!-- Drop Modal -->
          <div id="dropModal" class="modal">
              <div class="modal-content">
                  <h2>Drop Pieces</h2>
                  <p id="dropInfo"></p>
                  <div class="slider-control">
                      <div class="slider-label">
                          <span>Pieces to drop:</span>
                          <span id="dropSliderValue">1</span>
                      </div>
                      <input type="range" class="slider" id="dropSlider" min="1" max="1" value="1">
                  </div>
                  <div class="modal-buttons">
                      <button id="confirmDropBtn">Drop</button>
                      <button class="secondary" data-close-modal="dropModal">Cancel All</button>
                  </div>
              </div>
          </div>
      `;
  }

  setupEventListeners() {
    // Close modal buttons
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modalId = e.target.dataset.closeModal;
        this.closeModal(modalId);
      });
    });

    // Sliders
    const stackSlider = document.getElementById("stackSlider");
    if (stackSlider) {
      stackSlider.addEventListener("input", () => {
        document.getElementById("sliderValue").textContent = stackSlider.value;
        if (this.onStackSliderChange) {
          this.onStackSliderChange(stackSlider.value);
        }
      });
    }

    const dropSlider = document.getElementById("dropSlider");
    if (dropSlider) {
      dropSlider.addEventListener("input", () => {
        document.getElementById("dropSliderValue").textContent =
          dropSlider.value;
      });
    }

    // Click outside to close
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal && this.onModalCancel) {
          this.onModalCancel();
        }
      });
    });
  }

  showModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("show");
      this.activeModal = modalId;
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("show");
      if (this.activeModal === modalId) {
        this.activeModal = null;
      }
    }
  }

  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("show");
    });
    this.activeModal = null;
  }

  showNewGameModal(boardSizes, currentSize, onConfirm) {
    const container = document.getElementById("boardSizeOptions");
    container.innerHTML = "";

    boardSizes.forEach((size) => {
      const option = document.createElement("div");
      option.className =
        "size-option" + (size === currentSize ? " selected" : "");
      option.textContent = `${size}×${size}`;
      option.onclick = () => {
        document.querySelectorAll(".size-option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        option.classList.add("selected");
      };
      container.appendChild(option);
    });

    document.getElementById("startGameBtn").onclick = () => {
      const selected = container.querySelector(".selected");
      const size = parseInt(selected.textContent.split("×")[0]);
      this.closeModal("newGameModal");
      onConfirm(size);
    };

    this.showModal("newGameModal");
  }

  showPieceModal(pieceOptions, info, onSelect) {
    document.getElementById("pieceModalInfo").textContent = info;
    const container = document.getElementById("pieceOptions");
    container.innerHTML = "";

    pieceOptions.forEach((option) => {
      const pieceEl = this.createPieceOption(option);
      if (option.enabled) {
        // Only add click handler if enabled
        pieceEl.onclick = () => {
          this.closeModal("pieceModal");
          onSelect(option.type);
        };
      }
      container.appendChild(pieceEl);
    });

    this.showModal("pieceModal");
  }

  createPieceOption(option) {
    const div = document.createElement("div");
    div.className = "piece-option" + (option.enabled ? "" : " disabled");

    const preview = document.createElement("div");
    preview.className = "piece-preview";

    const demoPiece = document.createElement("div");
    demoPiece.className = `demo-piece ${option.type} ${option.color}`;

    preview.appendChild(demoPiece);

    const label = document.createElement("div");
    label.className = "piece-option-label";
    label.textContent =
      option.type.charAt(0).toUpperCase() + option.type.slice(1);

    const count = document.createElement("div");
    count.className = "piece-option-count";
    count.textContent = option.count;

    div.appendChild(preview);
    div.appendChild(label);
    if (option.showCount) {
      div.appendChild(count);
    }

    return div;
  }

  showStackModal(stack, maxPieces, onConfirm) {
    const display = document.getElementById("stackDisplay");
    display.innerHTML = "";

    stack.forEach((piece, index) => {
      const indicator = document.createElement("div");
      indicator.className = `stack-piece-indicator ${piece.color}`;
      indicator.textContent = piece.type.charAt(0).toUpperCase();
      if (index >= stack.length - maxPieces) {
        indicator.classList.add("selected");
      }
      display.appendChild(indicator);
    });

    const slider = document.getElementById("stackSlider");
    slider.max = maxPieces;
    slider.value = 1;
    document.getElementById("sliderValue").textContent = "1";

    // Store stack reference for slider updates
    this.currentStack = stack;
    this.maxStackPieces = maxPieces;

    document.getElementById("confirmStackBtn").onclick = () => {
      const value = parseInt(slider.value);
      this.closeModal("stackModal");
      onConfirm(value);
    };

    this.showModal("stackModal");
  }

  showDropModal(remainingPieces, maxDrop, onConfirm) {
    const info = document.getElementById("dropInfo");
    info.textContent = `You have ${remainingPieces} pieces remaining. How many to drop here?`;

    const slider = document.getElementById("dropSlider");
    slider.min = 1;
    slider.max = maxDrop;
    slider.value = 1;
    document.getElementById("dropSliderValue").textContent = "1";

    document.getElementById("confirmDropBtn").onclick = () => {
      const value = parseInt(slider.value);
      this.closeModal("dropModal");
      onConfirm(value);
    };

    this.showModal("dropModal");
  }

  // Callback for stack slider changes
  onStackSliderChange(value) {
    if (!this.currentStack) return;

    const display = document.getElementById("stackDisplay");
    const indicators = display.children;

    for (let i = 0; i < indicators.length; i++) {
      if (i >= this.currentStack.length - parseInt(value)) {
        indicators[i].classList.add("selected");
      } else {
        indicators[i].classList.remove("selected");
      }
    }
  }
}
