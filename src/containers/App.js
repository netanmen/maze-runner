import React, { useCallback, useEffect, useReducer } from 'react';
import useInterval from '@use-it/interval';

import styles from './App.module.css';
import MazeGenerator from '../maze/MazeGenerator';
import Board from '../Board';
import Header from '../Header';
import Notification from '../Notification';

import Audio from "../components/Audio";

const DEFAULT_ROUND_TIME = 16;
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
        roundTime: action.payload.roundTime,
        timeLeft: action.payload.roundTime,
        lollipopCell: undefined,
        icecreamCell: undefined,
        audio: action.payload.audio
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
        icecreamCell: action.payload.icecreamCell
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
    case 'lollipopBonus': {
      return {
        ...state,
        lollipopCell: undefined,
        points: state.points + action.payload.bonusPoints,
        timeLeft: state.timeLeft + action.payload.bonusTime
      };
    }
    case 'icecreamBonus': {
      return {
        ...state,
        icecreamCell: undefined,
        points: state.points + action.payload.bonusPoints,
        timeLeft: state.timeLeft + action.payload.bonusTime
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
        roundTime: DEFAULT_ROUND_TIME,
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
    icecreamCell: undefined,
    audio: undefined
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
    if (state.isGameActive && state.maze) {
      if (hasUserReachedCell(state.maze.endCell)) {
        handleFinishRound();
      }
    }
  }, [
    state.isGameActive,
    state.currentCell,
    state.maze,
    handleFinishRound,
    hasUserReachedCell
  ]);

  const handleAudio = useCallback(() => {
    const audio = document.getElementById('audio');
    const src = document.getElementById('src');

    // const audio = new Audio();
    // audio.src = '../assets/audio/maze.mp3';
    // audio.src = '../assets/audio/maze.mp3';
    // audio.loop = true;
    audio.play();
    const playPromise = audio.play();
    playPromise
      .then(() => {
    console.log('Inside first promise: ',playPromise);
    console.log({ playPromise });
      })
      .catch(err => console.error('Error in playPromise!', err));

    if (playPromise !== undefined) {
    console.log('Inside SECOND before THEN promise: ',playPromise);
    playPromise
        .then(() => {
    console.log('Inside SECOND promise: ',playPromise);
    console.log({ playPromise });
        })
        .catch(err => console.error('Error in playPromise!', err));
    }

    console.log({ audio });
    console.log({ src });
    console.log('After promise: ',playPromise);
  }, []);
  
  useEffect(() => {
    handleAudio();
    const audio = document.getElementById('audio');
    const src = document.getElementById('src');

    // const audio = new Audio();
    // audio.src = '../assets/audio/maze.mp3';
    // audio.src = '../assets/audio/maze.mp3';
    // audio.loop = true;
    audio.play();
    const playPromise = audio.play();
    playPromise
      .then(() => {
    console.log('Inside first promise: ',playPromise);
    console.log({ playPromise });
      })
      .catch(err => console.error('Error in playPromise!', err));

    if (playPromise !== undefined) {
    console.log('Inside SECOND before THEN promise: ',playPromise);
    playPromise
        .then(() => {
    console.log('Inside SECOND promise: ',playPromise);
    console.log({ playPromise });
        })
        .catch(err => console.error('Error in playPromise!', err));
    }

    console.log({ audio });
    console.log({ src });
    console.log('After promise: ',playPromise);

  }, [handleAudio])

  const handleStartGame = useCallback(() => {
    dispatch({
      type: 'startGame',
      payload: {
        maze: new MazeGenerator(BOARD_ROWS, BOARD_COLUMNS).generate(),
        roundTime: Math.max(state.timeLeft, DEFAULT_ROUND_TIME),
        audio: undefined
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

  useEffect(() => {}, []);

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

  // <audio ref={ref => (state.audio = ref)} />
  return (
    <div className={styles.root}>
      <Audio/>
      <div>
        <audio controls>
          <source src="./maze.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
      <div>
        <audio id="audio">
          <source id="src" src="./maze.mp3" type="audio/mpeg" />
          Your browser does not support the <code>audio</code> element.
        </audio>
      </div>
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
      <Notification
        show={!state.isGameActive}
        gameOver={state.timeLeft === 0}
      />
    </div>
  );
}

export default App;
