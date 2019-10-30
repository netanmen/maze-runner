import React, { useCallback, useEffect, useReducer } from 'react';
import useInterval from '@use-it/interval';

import { DEFAULT_ROUND_TIME, BOARD_ROWS, BOARD_COLUMNS } from '../constants';
import styles from './App.module.css';
import appReducer from './appReducer';
import MazeGenerator from '../MazeGenerator';
import Board from '../components/Board/Board';
import Header from '../components/Header/Header';
import Notification from '../components/Notification/Notification';
import Audio from '../components/Audio/Audio';

function App() {
  const [state, dispatch] = useReducer(appReducer, {
    isGameActive: undefined,
    isRoundActive: undefined,
    points: 0,
    round: 1,
    hiScore: 0,
    roundTime: DEFAULT_ROUND_TIME,
    timeLeft: DEFAULT_ROUND_TIME,
    maze: undefined,
    currentCell: undefined,
    lollipopCell: undefined,
    icecreamCell: undefined,
    audioSource: undefined
  });

  const areCellsEqual = useCallback((sourceCell, targetCell) => {
    if (!targetCell) {
      throw new Error(
        'ERROR at hasUserReachedCell: no targetCell.',
        targetCell
      );
    }
    if (!sourceCell) {
      throw new Error(
        'ERROR at hasUserReachedCell: no sourceCell.',
        sourceCell
      );
    }
    const [sourceX, sourceY] = sourceCell;
    const [targetX, targetY] = targetCell;
    if (sourceX === targetX && sourceY === targetY) {
      return true;
    } else {
      return false;
    }
  }, []);

  const hasUserReachedCell = useCallback(
    targetCell => {
      return areCellsEqual(state.currentCell, targetCell);
    },
    [state.currentCell, areCellsEqual]
  );

  const getRandomCell = useCallback(() => {
    const randomX = Math.floor(Math.random() * Math.floor(BOARD_ROWS));
    const randomY = Math.floor(Math.random() * Math.floor(BOARD_COLUMNS));
    let randomCell = [randomX, randomY];
    if (!!state.maze && areCellsEqual(randomCell, state.maze.endCell)) {
      randomCell = getRandomCell();
    }
    if (!!state.lollipopCell && areCellsEqual(randomCell, state.lollipopCell)) {
      randomCell = getRandomCell();
    }
    return randomCell;
  }, [state.maze, state.lollipopCell, areCellsEqual]);

  const handleFinishRound = useCallback(() => {
    const bonusPoints = state.round * state.timeLeft * 100;
    dispatch({
      type: 'finishRound',
      payload: { bonusPoints: bonusPoints }
    });
  }, [state.round, state.timeLeft]);

  useEffect(() => {
    if (state.isRoundActive) {
      if (!!state.maze && hasUserReachedCell(state.maze.endCell)) {
        handleFinishRound();
      }
    }
  }, [state.isRoundActive, state.maze, hasUserReachedCell, handleFinishRound]);

  const handleStartRound = useCallback(() => {
    console.log('handleStartRound!');

    dispatch({
      type: 'startRound',
      payload: {
        maze: new MazeGenerator(BOARD_ROWS, BOARD_COLUMNS).generate(),
        roundTime: Math.max(state.timeLeft, DEFAULT_ROUND_TIME)
      }
    });
  }, [state.timeLeft]);

  const handleStartGame = useCallback(() => {
    console.log('handleStartGame');

    dispatch({
      type: 'startGame',
      payload: {
        maze: new MazeGenerator(BOARD_ROWS, BOARD_COLUMNS).generate(),
        roundTime: Math.max(state.timeLeft, DEFAULT_ROUND_TIME)
      }
    });
  }, [state.timeLeft]);

  // const handleAudioEnd = () => {
  //   console.log('Audio ended! Points:', state.points);
  //   handleStartGame();
  // };

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
  }, [getRandomCell]);

  const handleCreateIcecream = useCallback(() => {
    const icecreamCell = getRandomCell();
    dispatch({
      type: 'createIcecream',
      payload: { icecreamCell: icecreamCell }
    });
    console.log(`Icecream added! Cell: `, icecreamCell);
  }, [getRandomCell]);

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

  const handleLollipopBonus = useCallback(() => {
    dispatch({
      type: 'lollipopBonus',
      payload: {
        bonusPoints: 5000,
        bonusTime: 15
      }
    });
  }, []);

  const handleIcecreamBonus = useCallback(() => {
    dispatch({
      type: 'icecreamBonus',
      payload: {
        bonusPoints: 10000,
        bonusTime: 30
      }
    });
  }, []);

  useEffect(() => {
    if (state.isGameActive) {
      if (state.lollipopCell) {
        if (hasUserReachedCell(state.lollipopCell)) {
          handleLollipopBonus();
        }
      }
      if (state.icecreamCell) {
        if (hasUserReachedCell(state.icecreamCell)) {
          handleIcecreamBonus();
        }
      }
    }
  }, [
    state.isGameActive,
    state.lollipopCell,
    state.icecreamCell,
    handleIcecreamBonus,
    handleLollipopBonus,
    hasUserReachedCell
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
          if (!leftWall && x > 0) {
            newCell = [x - 1, y];
          }
          break;
        case 38:
          if (!topWall && y > 0) {
            newCell = [x, y - 1];
          }
          break;
        case 39:
          if (!rightWall && x < BOARD_COLUMNS) {
            newCell = [x + 1, y];
          }
          break;
        case 40:
          if (!bottomWall && y < BOARD_ROWS) {
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
    if (state.isRoundActive) {
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
  }, [state.isRoundActive, handleUserMovement]);

  useInterval(
    () => {
      dispatch({ type: 'decrementTime' });
    },
    state.isRoundActive ? 1000 : null
  );

  useEffect(() => {
    if (state.timeLeft === 0) {
      dispatch({ type: 'endGame' });
    }
  }, [state.timeLeft]);

  return (
    <div className={styles.root}>
      <Audio
        source={state.audioSource}
        shouldLoop={state.isRoundActive}
        handleAudioEnd={handleStartRound}
      />
      <Header
        hiScore={state.hiScore}
        points={state.points}
        time={state.timeLeft}
        round={state.round}
      />
      <Board
        maze={state.maze}
        currentCell={state.currentCell}
        lollipopCell={state.lollipopCell}
        icecreamCell={state.icecreamCell}
      />
      <Notification show={!state.isGameActive} gameOver={state.timeLeft === 0} />
    </div>
  );
}

export default App;
