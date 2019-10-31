import React, { useCallback, useEffect, useReducer } from 'react';
import useInterval from '@use-it/interval';

import {
  DEFAULT_ROUND_TIME,
  ROWS,
  COLS,
  LOLLIPOP,
  ICECREAM
} from '../constants';
import styles from './App.module.css';
import appReducer from './appReducer';
import MazeGenerator from '../MazeGenerator';
import Board from '../components/Board/Board';
import Header from '../components/Header/Header';
import Notification from '../components/Notification/Notification';
import Audio from '../components/Audio/Audio';
import { areCellsEqual } from '../utility/utility';

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

  const hasUserReachedCell = useCallback(
    targetCell => {
      return areCellsEqual(state.currentCell, targetCell);
    },
    [state.currentCell]
  );

  const getRandomCell = useCallback(() => {
    const randomX = Math.floor(Math.random() * Math.floor(ROWS));
    const randomY = Math.floor(Math.random() * Math.floor(COLS));
    let randomCell = [randomX, randomY];
    if (!!state.maze && areCellsEqual(randomCell, state.maze.endCell)) {
      randomCell = getRandomCell();
    }
    if (!!state.lollipopCell && areCellsEqual(randomCell, state.lollipopCell)) {
      randomCell = getRandomCell();
    }
    return randomCell;
  }, [state.maze, state.lollipopCell]);

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
    dispatch({
      type: 'startRound',
      payload: {
        maze: new MazeGenerator(ROWS, COLS).generate(),
        roundTime: Math.max(state.timeLeft, DEFAULT_ROUND_TIME)
      }
    });
  }, [state.timeLeft]);

  const handleStartGame = useCallback(() => {
    dispatch({
      type: 'startGame',
      payload: {
        maze: new MazeGenerator(ROWS, COLS).generate(),
        roundTime: Math.max(state.timeLeft, DEFAULT_ROUND_TIME)
      }
    });
  }, [state.timeLeft]);

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
  }, [getRandomCell]);

  const handleCreateIcecream = useCallback(() => {
    const icecreamCell = getRandomCell();
    dispatch({
      type: 'createIcecream',
      payload: { icecreamCell: icecreamCell }
    });
  }, [getRandomCell]);

  useEffect(() => {
    if (state.isGameActive) {
      const timePassedInRound = state.roundTime - state.timeLeft;
      if (!state.lollipopCell && timePassedInRound === LOLLIPOP.CREATE_ON_TIME_PASSED) {
        handleCreateLollipop();
      }
      if (!state.icecreamCell && state.timeLeft === ICECREAM.CREATE_ON_TIME_LEFT) {
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

  const handlePrizeBonus = useCallback(prize => {
    if (prize) {
      const { NAME, BONUS_POINTS, BONUS_TIME } = prize;
      dispatch({
        type: `${NAME}Bonus`,
        payload: {
          bonusPoints: BONUS_POINTS,
          bonusTime: BONUS_TIME
        }
      });
    }
  }, []);

  useEffect(() => {
    if (state.isGameActive) {
      if (state.lollipopCell && hasUserReachedCell(state.lollipopCell)) {
        handlePrizeBonus(LOLLIPOP);
      }
      if (state.icecreamCell && hasUserReachedCell(state.icecreamCell)) {
        handlePrizeBonus(ICECREAM);
      }
    }
  }, [
    state.isGameActive,
    state.lollipopCell,
    state.icecreamCell,
    handlePrizeBonus,
    hasUserReachedCell
  ]);

  const handleUserMovement = useCallback(arrowKeyCode => {
      const [x, y] = state.currentCell;
      const [topWall, rightWall, bottomWall, leftWall] = state.maze.cells[
        y * COLS + x
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
          if (!rightWall && x < COLS) {
            newCell = [x + 1, y];
          }
          break;
        case 40:
          if (!bottomWall && y < ROWS) {
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
        isRoundActive={state.isRoundActive}
        currentCell={state.currentCell}
        lollipopCell={state.lollipopCell}
        icecreamCell={state.icecreamCell}
      />
      <Notification
        show={!state.isGameActive}
        gameOver={state.timeLeft === 0}
      />
    </div>
  );
}

export default App;
