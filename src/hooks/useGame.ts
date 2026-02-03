import { useState, useEffect, useCallback, useRef } from 'react';

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

type Grid = number[][];

const GRID_SIZE = 4;

function createEmptyGrid(): Grid {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}

function getEmptyCells(grid: Grid): { row: number; col: number }[] {
  const emptyCells: { row: number; col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
}

function addRandomTile(grid: Grid): { grid: Grid; newTile: { row: number; col: number; value: number } | null } {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return { grid, newTile: null };

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newGrid = grid.map(r => [...r]);
  newGrid[row][col] = value;

  return { grid: newGrid, newTile: { row, col, value } };
}

function rotateGrid(grid: Grid, times: number): Grid {
  let result = grid.map(r => [...r]);
  for (let t = 0; t < times; t++) {
    const rotated = createEmptyGrid();
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        rotated[col][GRID_SIZE - 1 - row] = result[row][col];
      }
    }
    result = rotated;
  }
  return result;
}

function slideLeft(grid: Grid): { grid: Grid; score: number; moved: boolean; mergedPositions: Set<string> } {
  let score = 0;
  let moved = false;
  const mergedPositions = new Set<string>();
  const newGrid = createEmptyGrid();

  for (let row = 0; row < GRID_SIZE; row++) {
    const tiles = grid[row].filter(val => val !== 0);
    const merged: number[] = [];

    for (let i = 0; i < tiles.length; i++) {
      if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
        merged.push(tiles[i] * 2);
        score += tiles[i] * 2;
        mergedPositions.add(`${row}-${merged.length - 1}`);
        i++;
      } else {
        merged.push(tiles[i]);
      }
    }

    for (let col = 0; col < merged.length; col++) {
      newGrid[row][col] = merged[col];
    }

    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] !== newGrid[row][col]) {
        moved = true;
      }
    }
  }

  return { grid: newGrid, score, moved, mergedPositions };
}

function canMove(grid: Grid): boolean {
  // Check for empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) return true;
    }
  }

  // Check for possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = grid[row][col];
      if (col + 1 < GRID_SIZE && grid[row][col + 1] === value) return true;
      if (row + 1 < GRID_SIZE && grid[row + 1][col] === value) return true;
    }
  }

  return false;
}

function hasWon(grid: Grid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] >= 2048) return true;
    }
  }
  return false;
}

export function useGame(
  initialGrid?: Grid | null,
  initialScore?: number,
  initialBestScore?: number,
  initialGameOver?: boolean,
  initialWon?: boolean
) {
  const [grid, setGrid] = useState<Grid>(() => initialGrid || createEmptyGrid());
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(initialScore || 0);
  const [bestScore, setBestScore] = useState(initialBestScore || 0);
  const [gameOver, setGameOver] = useState(initialGameOver || false);
  const [won, setWon] = useState(initialWon || false);
  const [continueAfterWin, setContinueAfterWin] = useState(false);
  const tileIdRef = useRef(0);
  const isInitializedRef = useRef(false);

  const gridToTiles = useCallback((g: Grid, mergedPositions?: Set<string>, newTilePos?: { row: number; col: number }): Tile[] => {
    const newTiles: Tile[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (g[row][col] !== 0) {
          const isNew = newTilePos?.row === row && newTilePos?.col === col;
          const isMerged = mergedPositions?.has(`${row}-${col}`);
          newTiles.push({
            id: tileIdRef.current++,
            value: g[row][col],
            row,
            col,
            isNew,
            isMerged,
          });
        }
      }
    }
    return newTiles;
  }, []);

  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    const first = addRandomTile(newGrid);
    newGrid = first.grid;
    const second = addRandomTile(newGrid);
    newGrid = second.grid;

    setGrid(newGrid);
    setTiles(gridToTiles(newGrid));
    setScore(0);
    setGameOver(false);
    setWon(false);
    setContinueAfterWin(false);
  }, [gridToTiles]);

  // Initialize game
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (initialGrid && initialGrid.some(row => row.some(cell => cell !== 0))) {
      setGrid(initialGrid);
      setTiles(gridToTiles(initialGrid));
      setScore(initialScore || 0);
      setBestScore(initialBestScore || 0);
      setGameOver(initialGameOver || false);
      setWon(initialWon || false);
      if (initialWon) setContinueAfterWin(true);
    } else {
      initGame();
    }
  }, [initialGrid, initialScore, initialBestScore, initialGameOver, initialWon, gridToTiles, initGame]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || (won && !continueAfterWin)) return false;

    const rotations: Record<string, number> = {
      up: 1,
      right: 2,
      down: 3,
      left: 0,
    };

    const rotated = rotateGrid(grid, rotations[direction]);
    const result = slideLeft(rotated);

    if (!result.moved) return false;

    const unrotated = rotateGrid(result.grid, (4 - rotations[direction]) % 4);
    const { grid: finalGrid, newTile } = addRandomTile(unrotated);

    // Recalculate merged positions for unrotated grid
    const newTiles = gridToTiles(finalGrid, undefined, newTile || undefined);

    setGrid(finalGrid);
    setTiles(newTiles);

    const newScore = score + result.score;
    setScore(newScore);

    if (newScore > bestScore) {
      setBestScore(newScore);
    }

    if (hasWon(finalGrid) && !won) {
      setWon(true);
    }

    if (!canMove(finalGrid)) {
      setGameOver(true);
    }

    return true;
  }, [grid, score, bestScore, gameOver, won, continueAfterWin, gridToTiles]);

  const resetGame = useCallback(() => {
    initGame();
  }, [initGame]);

  const continuePlaying = useCallback(() => {
    setContinueAfterWin(true);
  }, []);

  return {
    grid,
    tiles,
    score,
    bestScore,
    gameOver,
    won,
    continueAfterWin,
    move,
    resetGame,
    continuePlaying,
  };
}
