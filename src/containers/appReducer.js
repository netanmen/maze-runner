import activeRoundAudio from '../assets/audio/maze.mp3';
import finishRoundAudio from '../assets/audio/level_end.mp3';
import { DEFAULT_ROUND_TIME } from '../constants';

function appReducer(state, action) {
  switch (action.type) {
    case 'startGame': {
      return {
        ...state,
        isGameActive: true,
        isRoundActive: true,
        maze: action.payload.maze,
        currentCell: action.payload.maze.startCell,
        roundTime: DEFAULT_ROUND_TIME,
        timeLeft: DEFAULT_ROUND_TIME,
        round: 1,
        points: 0,
        lollipopCell: null,
        icecreamCell: null,
        audioSource: activeRoundAudio
      };
    }
    case 'startRound': {
      return {
        ...state,
        isRoundActive: true,
        maze: action.payload.maze,
        currentCell: action.payload.maze.startCell,
        roundTime: action.payload.roundTime,
        timeLeft: action.payload.roundTime,
        round: state.round + 1,
        lollipopCell: undefined,
        icecreamCell: undefined,
        audioSource: activeRoundAudio
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
        isRoundActive: false,
        points: state.points + action.payload.bonusPoints,
        audioSource: finishRoundAudio
      };
    }
    case 'endGame': {
      return {
        ...state,
        isGameActive: false,
        isRoundActive: false,
        hiScore: Math.max(state.hiScore, state.points),
        audioSource: null
      };
    }
    default:
      throw new Error('Unknown action');
  }
}

export default appReducer;
