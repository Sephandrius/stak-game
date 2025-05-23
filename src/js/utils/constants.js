export const PIECE_COUNTS_BY_SIZE = {
  3: { flats: 10, capstones: 0 },
  4: { flats: 15, capstones: 0 },
  5: { flats: 21, capstones: 1 },
  6: { flats: 30, capstones: 1 },
  7: { flats: 40, capstones: 2 },
  8: { flats: 50, capstones: 2 },
  9: { flats: 60, capstones: 3 },
};

export const DIRECTIONS = {
    UP: [-1, 0],
    RIGHT: [0, 1],
    DOWN: [1, 0],
    LEFT: [0, -1]
};

export const DIRECTION_SYMBOLS = {
    '0,1': '>',
    '1,0': 'v',
    '0,-1': '<',
    '-1,0': '^'
};

export const PIECE_TYPES = {
    FLAT: 'flat',
    STANDING: 'standing',
    CAPSTONE: 'capstone'
};

export const PLAYERS = {
    WHITE: 'white',
    BLACK: 'black'
};