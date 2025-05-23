export class Piece {
    constructor(type, color) {
        this.type = type;
        this.color = color;
    }

    isFlat() {
        return this.type === 'flat';
    }

    isStanding() {
        return this.type === 'standing';
    }

    isCapstone() {
        return this.type === 'capstone';
    }

    canStack() {
        return this.type === 'flat';
    }

    flatten() {
        if (this.type === 'standing') {
            this.type = 'flat';
        }
    }

    clone() {
        return new Piece(this.type, this.color);
    }
}