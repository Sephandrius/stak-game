import { PIECE_COUNTS_BY_SIZE } from '../utils/constants.js';

export class Player {
    constructor(color, boardSize) {
        this.color = color;
        const counts = PIECE_COUNTS_BY_SIZE[boardSize];
        this.flats = counts.flats;
        this.capstones = counts.capstones;
    }

    canPlaceFlat() {
        return this.flats > 0;
    }

    canPlaceCapstone() {
        return this.capstones > 0;
    }

    useFlat() {
        if (this.flats > 0) {
            this.flats--;
            return true;
        }
        return false;
    }

    useCapstone() {
        if (this.capstones > 0) {
            this.capstones--;
            return true;
        }
        return false;
    }

    hasNoPieces() {
        return this.flats === 0 && this.capstones === 0;
    }
}