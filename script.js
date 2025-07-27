const board = document.getElementById('board');
const statusText = document.getElementById('status');
const shotsText = document.getElementById('shots');
const shipsText = document.getElementById('shipsSunk');
const restartBtn = document.getElementById('restart');

const gridSize = 10;
const shipSizes = [5, 4, 3, 3, 2];

let cells = [];
let ships = [];
let shipCells = new Set();
let hits = 0;
let shots = 0;
let shipsSunk = 0;

function createBoard() {
  board.innerHTML = '';
  cells = [];
  ships = [];
  shipCells.clear();
  hits = 0;
  shots = 0;
  shipsSunk = 0;

  statusText.textContent = 'Sink all 5 ships!';
  shotsText.textContent = 'Shots: 0';
  shipsText.textContent = 'Ships sunk: 0 / 5';

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    board.appendChild(cell);
    cells.push(cell);
  }

  shipSizes.forEach(size => placeShip(size));

  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleClick(index));
  });
}

function placeShip(length) {
  let placed = false;
  while (!placed) {
    const isHorizontal = Math.random() < 0.5;
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    const positions = [];

    for (let i = 0; i < length; i++) {
      const x = isHorizontal ? col + i : col;
      const y = isHorizontal ? row : row + i;

      if (x >= gridSize || y >= gridSize) break;

      const index = y * gridSize + x;
      if (shipCells.has(index)) break;

      positions.push(index);
    }

    if (positions.length === length) {
      positions.forEach(i => shipCells.add(i));
      ships.push(positions); // Track each full ship
      placed = true;
    }
  }
}

function handleClick(index) {
  const cell = cells[index];
  if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

  shots++;
  shotsText.textContent = `Shots: ${shots}`;

  if (shipCells.has(index)) {
    cell.classList.add('hit', 'animate');
    cell.textContent = '💥';
    hits++;

    setTimeout(() => cell.classList.remove('animate'), 400);

    ships.forEach((ship, i) => {
      if (ship.includes(index)) {
        ships[i] = ship.filter(pos => pos !== index);
        if (ships[i].length === 0) {
          shipsSunk++;
          shipsText.textContent = `Ships sunk: ${shipsSunk} / 5`;
        }
      }
    });

    if (hits === shipCells.size) {
      statusText.textContent = `YOU WIN! 🏆 in ${shots} shots`;
    }
  } else {
    cell.classList.add('miss');
    cell.textContent = '❌';
  }
}

restartBtn.addEventListener('click', createBoard);
createBoard();
