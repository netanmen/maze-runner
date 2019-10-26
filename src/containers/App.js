import React, { useCallback, useEffect, useReducer } from 'react';
import styles from './App.module.css';
import useInterval from '@use-it/interval';
import Header from '../Header';
import Notification from '../Notification';
import MazeGenerator from '../maze/MazeGenerator';
import Board from '../Board';

const DEFAULT_ROUND_TIME = 31;
// const ROWS = 17;
// const COLS = 33;
const BOARD_ROWS = 4;
const BOARD_COLUMNS = 4;

function reducer(state, action) {
  switch (action.type) {
    case 'startGame': {
      return {
        ...state,
        maze: action.payload.maze,
        currentCell: action.payload.maze.startCell,
        isGameActive: true,
        roundTime: DEFAULT_ROUND_TIME,
        timeLeft: DEFAULT_ROUND_TIME,
        lollipopCell: undefined,
        icecreamCell: undefined
      };
    }
    case 'createLollipop': {
      return {
        ...state,
        lollipopCell: action.payload.lollipopCell
      };
    }
    case 'createIcecream': {
      return {
        ...state,
        lollipopCell: action.payload.lollipopCell
      };
    }
    case 'decrementTime': {
      return {
        ...state,
        timeLeft: state.timeLeft - 1
      };
    }
    case 'movePlayer': {
      return {
        ...state,
        currentCell: action.payload.currentCell,
        points: state.points + 10
      };
    }
    case 'finishRound': {
      return {
        ...state,
        isGameActive: false,
        round: state.round + 1,
        points: state.points + action.payload.bonusPoints
      };
    }
    case 'endGame': {
      return {
        ...state,
        isGameActive: false,
        round: 1,
        points: 0,
        hiScore: Math.max(state.hiScore, state.points)
      };
    }
    default:
      throw new Error('Unknown action');
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, {
    isGameActive: false,
    points: 0,
    round: 1,
    hiScore: 0,
    roundTime: DEFAULT_ROUND_TIME,
    timeLeft: DEFAULT_ROUND_TIME,
    maze: undefined,
    currentCell: undefined,
    lollipopCell: undefined,
    icecreamCell: undefined
  });

  const handleFinishRound = useCallback(() => {
    const bonusPoints = state.round * state.timeLeft * 100;
    dispatch({
      type: 'finishRound',
      payload: { bonusPoints: bonusPoints }
    });
  }, [state.round, state.timeLeft]);

  useEffect(() => {
    if (state.isGameActive && state.maze) {
      const [currentX, currentY] = state.currentCell;
      const [goalX, goalY] = state.maze.endCell;

      if (currentX === goalX && currentY === goalY) {
        handleFinishRound();
      }
    }
  }, [state.isGameActive, state.currentCell, state.maze, handleFinishRound]);

  const handleStartGame = useCallback(() => {
    dispatch({
      type: 'startGame',
      payload: {
        maze: new MazeGenerator(BOARD_ROWS, BOARD_COLUMNS).generate()
      }
    });
  }, []);

  useEffect(() => {
    if (!state.isGameActive) {
      const onKeyDown = e => {
        if (e.keyCode === 13) {
          handleStartGame();
        }
      };
      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [state.isGameActive, handleStartGame]);

  const handleCreateLollipop = useCallback(() => {
    const lollipopCell = getRandomCell();
    dispatch({
      type: 'createLollipop',
      payload: { lollipopCell: lollipopCell }
    });
    console.log(`Lollipop added! Cell: `, lollipopCell);
    
  }, []);

  const handleCreateIcecream = useCallback(() => {
    const icecreamCell = getRandomCell();
    dispatch({
      type: 'createIcecream',
      payload: { icecreamCell: icecreamCell }
    });
    console.log(`Icecream added! Cell: `, icecreamCell);
  }, []);

  useEffect(() => {
    if (state.isGameActive) {
      const timePassedInRound = state.roundTime - state.timeLeft;
      if (!state.lollipopCell && timePassedInRound === 30) {
        handleCreateLollipop();
      }
      if (!state.icecreamCell && state.timeLeft === 15) {
        handleCreateIcecream();
      }
    }
  }, [
    state.isGameActive,
    state.lollipopCell,
    state.icecreamCell,
    state.roundTime,
    state.timeLeft,
    handleCreateLollipop,
    handleCreateIcecream
  ]);

  const handleUserMovement = useCallback(
    arrowKeyCode => {
      const [x, y] = state.currentCell;
      const [topWall, rightWall, bottomWall, leftWall] = state.maze.cells[
        y * BOARD_COLUMNS + x
      ];
      let newCell = null;

      switch (arrowKeyCode) {
        case 37:
          if (x > 0 && !leftWall) {
            newCell = [x - 1, y];
          }
          break;
        case 38:
          if (y > 0 && !topWall) {
            newCell = [x, y - 1];
          }
          break;
        case 39:
          if (x < BOARD_COLUMNS && !rightWall) {
            newCell = [x + 1, y];
          }
          break;
        case 40:
          if (y < BOARD_ROWS && !bottomWall) {
            newCell = [x, y + 1];
          }
          break;
        default:
          console.error(
            `No moving direction assigned to pressed key with keycode ${arrowKeyCode}`
          );
          break;
      }

      if (newCell) {
        dispatch({
          type: 'movePlayer',
          payload: { currentCell: newCell }
        });
      }
    },
    [state.currentCell, state.maze]
  );

  useEffect(() => {
    if (state.isGameActive) {
      const onKeyDown = e => {
        if (e.keyCode >= 37 && e.keyCode <= 40) {
          handleUserMovement(e.keyCode);
        }
      };
      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [state.isGameActive, handleUserMovement]);

  useInterval(
    () => {
      dispatch({ type: 'decrementTime' });
    },
    state.isGameActive ? 1000 : null
  );

  useEffect(() => {
    if (state.timeLeft === 0) {
      dispatch({ type: 'endGame' });
    }
  }, [state.timeLeft]);

  function getRandomCell() {
    const randomX = Math.floor(Math.random() * Math.floor(BOARD_ROWS));
    const randomY = Math.floor(Math.random() * Math.floor(BOARD_COLUMNS));
    const randomCell = [randomX, randomY];
    return randomCell;
  }

  return (
    <div className={styles.root}>
      <Header
        hiScore={state.hiScore}
        points={state.points}
        time={state.timeLeft}
        round={state.round}
      />
      <Board maze={state.maze} currentCell={state.currentCell} />
      <Notification
        show={!state.isGameActive}
        gameOver={state.timeLeft === 0}
      />
    </div>
  );
}

export default App;
