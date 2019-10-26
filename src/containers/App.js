import React, { useCallback, useEffect, useReducer } from 'react';
import styles from './App.module.css';
import useInterval from '@use-it/interval';
import Header from '../Header';
import Notification from '../Notification';
import MazeGenerator from '../maze/MazeGenerator';
import Board from '../Board';

const ROUND_TIME = 60;
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
        time: ROUND_TIME,
        isGameActive: true
      };
    }
    case 'decrementTime': {
      return {
        ...state,
        time: state.time - 1
      };
    }
    case 'movePlayer': {
      return {
        ...state,
        currentCell: action.payload.currentCell,
        score: state.score + 10
      };
    }
    case 'endGame': {
      return {
        ...state,
        isGameActive: false,
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
    time: undefined,
    maze: undefined,
    currentCell: undefined
  });

  useEffect(() => {
    console.log(`Current Cell = ${state.currentCell}`);
    if (state.maze) {
      console.log(`Current End Cell = ${state.maze.endCell}`);
      if (
        state.currentCell[0] === state.maze.endCell[0] &&
        state.currentCell[1] === state.maze.endCell[1]
      ) {
        console.log(`Congrats! You finished the maze!`);
        dispatch({
          type: 'endGame'
        });
      }
    }
  }, [state.currentCell, state.maze]);

  const handleOnEnterKeyPressed = useCallback(() => {
    if (!state.isGameActive) {
      dispatch({
        type: 'startGame',
        payload: {
          maze: new MazeGenerator(BOARD_ROWS, BOARD_COLUMNS).generate(),
          isGameActive: true
        }
      });
    }
  }, [state.isGameActive]);

  useEffect(() => {
    const onKeyDown = e => {
      if (e.keyCode === 13) {
        handleOnEnterKeyPressed();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleOnEnterKeyPressed]);

  const handleMovement = useCallback(
    arrowKeyCode => {
      const [x, y] = state.currentCell;
      const [topWall, rightWall, bottomWall, leftWall] = state.maze.cells[y * BOARD_COLUMNS + x];
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
          handleMovement(e.keyCode);
        }
      };
      console.log(`Current coords = ${state.currentCell}`);
      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [state.isGameActive, state.currentCell, handleMovement]);

  useInterval(
    () => {
      dispatch({ type: 'decrementTime' });
    },
    state.isGameActive ? 1000 : null
  );

  useEffect(() => {
    if (state.time === 0) {
      dispatch({ type: 'endGame' });
    }
  }, [state.time]);

  return (
    <div className={styles.root}>
      <Header
        hiScore={state.hiScore}
        points={state.points}
        time={state.time}
        round={state.round}
      />
      <Board maze={state.maze} currentCell={state.currentCell} />
      <Notification show={!state.isGameActive} gameOver={state.time === 0} />
    </div>
  );
}

export default App;
