const enemyBoard = document.getElementById('enemy-board');
const playerBoard = document.getElementById('player-board');
const statusText = document.getElementById('status');
const shotsText = document.getElementById('shots');
const shipsText = document.getElementById('shipsSunk');
const playerShipsText = document.getElementById('playerShips');
const restartBtn = document.getElementById('restart');
const radarBtn = document.getElementById('radar');

const gridSize = 10;
const shipSizes = [5, 4, 3, 3, 2];

let enemyCells = [], playerCells = [];
let enemyShips = [], playerShips = [];
let enemyShipCells = new Set(), playerShipCells = new Set();
let hits = 0, shots = 0, shipsSunk = 0;
let playerShipsRemaining = 5;
let radarUsed = false;

let aiTargetQueue = [];
let aiPreviousHits = [];

function createBoard() {
  enemyBoard.innerHTML = '';
  playerBoard.innerHTML = '';
  enemyCells = [];
  playerCells = [];
  enemyShips = [];
  playerShips = [];
  enemyShipCells.clear();
  playerShipCells.clear();
  hits = 0;
  shots = 0;
  shipsSunk = 0;
  playerShipsRemaining = 5;
  radarUsed = false;
  aiTargetQueue = [];
  aiPreviousHits = [];

  statusText.textContent = 'Sink all 5 enemy ships before they sink yours!';
  shotsText.textContent = 'Shots: 0';
  shipsText.textContent = 'Enemy Ships Sunk: 0 / 5';
  playerShipsText.textContent = 'Your Ships Remaining: 5';
  radarBtn.disabled = false;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const eCell = document.createElement('div');
    const pCell = document.createElement('div');

    eCell.classList.add('cell', 'fog');
    pCell.classList.add('cell');

    eCell.dataset.index = i;
    pCell.dataset.index = i;

    enemyBoard.appendChild(eCell);
    playerBoard.appendChild(pCell);

    enemyCells.push(eCell);
    playerCells.push(pCell);
  }

  shipSizes.forEach(size => placeShip(size, enemyShipCells, enemyShips));
  shipSizes.forEach(size => placeShip(size, playerShipCells, playerShips));

  enemyCells.forEach((cell, index) => {
    cell.addEventListener('click', () => handlePlayerClick(index));
  });
}

function placeShip(length, shipCells, shipList) {
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
      shipList.push(positions);
      placed = true;
    }
  }
}

function handlePlayerClick(index) {
  const cell = enemyCells[index];
  if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

  cell.classList.remove('fog');
  shots++;
  shotsText.textContent = `Shots: ${shots}`;

  if (enemyShipCells.has(index)) {
    cell.classList.add('hit', 'animate');
    cell.textContent = '💥';
    hits++;

    setTimeout(() => cell.classList.remove('animate'), 400);

    enemyShips.forEach((ship, i) => {
      if (ship.includes(index)) {
        enemyShips[i] = ship.filter(pos => pos !== index);
        if (enemyShips[i].length === 0) {
          shipsSunk++;
          shipsText.textContent = `Enemy Ships Sunk: ${shipsSunk} / 5`;
        }
      }
    });

    if (hits === enemyShipCells.size) {
      statusText.textContent = `YOU WIN! 🏆 in ${shots} shots`;
      return;
    }
  } else {
    cell.classList.add('miss');
    cell.textContent = '❌';
  }

  setTimeout(aiTurn, 500); // AI turn
}

function aiTurn() {
  let index;

  if (aiTargetQueue.length > 0) {
    index = aiTargetQueue.shift();
  } else {
    do {
      index = Math.floor(Math.random() * (gridSize * gridSize));
    } while (
      playerCells[index].classList.contains('hit') ||
      playerCells[index].classList.contains('miss')
    );
  }

  const cell = playerCells[index];

  if (playerShipCells.has(index)) {
    cell.classList.add('hit', 'animate');
    cell.textContent = '💥';

    setTimeout(() => cell.classList.remove('animate'), 400);

    playerShips.forEach((ship, i) => {
      if (ship.includes(index)) {
        playerShips[i] = ship.filter(pos => pos !== index);
        if (playerShips[i].length === 0) {
          playerShipsRemaining--;
          playerShipsText.textContent = `Your Ships Remaining: ${playerShipsRemaining}`;
        } else {
          aiPreviousHits.push(index);
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const directions = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1]
          ];
          directions.forEach(([nx, ny]) => {
            const ni = ny * gridSize + nx;
            if (
              nx >= 0 &&
              nx < gridSize &&
              ny >= 0 &&
              ny < gridSize &&
              !playerCells[ni].classList.contains('hit') &&
              !playerCells[ni].classList.contains('miss')
            ) {
              aiTargetQueue.push(ni);
            }
          });
        }
      }
    });

    if ([...playerShipCells].every(i => playerCells[i].classList.contains('hit'))) {
      statusText.textContent = 'YOU LOSE! 💥 The AI sunk all your ships!';
    }
  } else {
    cell.classList.add('miss');
    cell.textContent = '❌';
  }
}

// 🛰️ RADAR POWERUP
radarBtn.addEventListener('click', () => {
  if (radarUsed) return;
  radarUsed = true;
  radarBtn.disabled = true;

  const centerX = Math.floor(Math.random() * (gridSize - 2)) + 1;
  const centerY = Math.floor(Math.random() * (gridSize - 2)) + 1;

  const radarArea = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      const index = y * gridSize + x;
      radarArea.push(index);
    }
  }

  radarArea.forEach(index => {
    const cell = enemyCells[index];
    if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
      cell.classList.add('revealed');
      cell.classList.remove('fog');
    }
  });

  setTimeout(() => {
    radarArea.forEach(index => {
      const cell = enemyCells[index];
      if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
        cell.classList.remove('revealed');
        cell.classList.add('fog');
      }
    });
  }, 2000);
});

restartBtn.addEventListener('click', createBoard);
createBoard();