export function squareToNotation(row, col, boardSize) {
    return String.fromCharCode(97 + col) + (boardSize - row);
}

export function notationToSquare(notation, boardSize) {
    const col = notation.charCodeAt(0) - 97;
    const row = boardSize - parseInt(notation.slice(1));
    return { row, col };
}

export function isValidSquare(row, col, boardSize) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

export function getOpponentColor(color) {
    return color === 'white' ? 'black' : 'white';
}