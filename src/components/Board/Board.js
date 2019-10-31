import React, { useEffect, useRef, useState, useCallback } from 'react';
import useInterval from '@use-it/interval';
import PropTypes from 'prop-types';

import styles from './Board.module.css';
import { areCellsEqual } from '../../utility/utility';
import logoImage from '../../assets/images/logo.svg';
import lollipopImage from '../../assets/images/lollipop.svg';
import icecreamImage from '../../assets/images/ice_cream.svg';
import { LOLLIPOP, ICECREAM } from '../../constants';

function Board(props) {
  const {
    maze,
    isRoundActive,
    currentCell,
    lollipopCell,
    icecreamCell
  } = props;
  const mazeCanvas = useRef(null);
  const objectsCanvas = useRef(null);
  const goalCanvas = useRef(null);
  const container = useRef(null);
  const [goalText, setGoalText] = useState('Goal');
  const [reachedLollipopAtCell, setReachedLollipopAtCell] = useState(null);
  const [reachedIcecreamAtCell, SetReachedIcecreamAtCell] = useState(null);
  const [mazeCtx, setMazeCtx] = useState(undefined);
  const [objectsCtx, setObjectsCtx] = useState(undefined);
  const [goalCtx, setGoalCtx] = useState(undefined);

  useEffect(() => {
    const fitToContainer = () => {
      const { offsetWidth, offsetHeight } = container.current;
      mazeCanvas.current.width = offsetWidth;
      mazeCanvas.current.height = offsetHeight;
      mazeCanvas.current.style.width = offsetWidth + 'px';
      mazeCanvas.current.style.height = offsetHeight + 'px';

      objectsCanvas.current.width = offsetWidth;
      objectsCanvas.current.height = offsetHeight;
      objectsCanvas.current.style.width = offsetWidth + 'px';
      objectsCanvas.current.style.height = offsetHeight + 'px';

      goalCanvas.current.width = offsetWidth;
      goalCanvas.current.height = offsetHeight;
      goalCanvas.current.style.width = offsetWidth + 'px';
      goalCanvas.current.style.height = offsetHeight + 'px';
    };

    setMazeCtx(mazeCanvas.current.getContext('2d'));
    setObjectsCtx(objectsCanvas.current.getContext('2d'));
    setGoalCtx(goalCanvas.current.getContext('2d'));
    setTimeout(fitToContainer, 0);
  }, []);

  // goal
  useEffect(() => {
    const draw = () => {
      if (!maze) {
        return;
      }

      goalCtx.fillStyle = 'transparent';
      goalCtx.clearRect(
        0,
        0,
        goalCanvas.current.width,
        goalCanvas.current.height
      );

      const blockWidth = Math.floor(goalCanvas.current.width / maze.cols);
      const blockHeight = Math.floor(goalCanvas.current.height / maze.rows);
      const xOffset = Math.floor(
        (goalCanvas.current.width - maze.cols * blockWidth) / 2
      );

      const textSize = Math.min(blockWidth, blockHeight);
      goalCtx.fillStyle = 'red';
      goalCtx.font = '20px "Joystix"';
      goalCtx.textBaseline = 'top';
      console.log({ goalText });

      goalCtx.fillText(
        goalText,
        maze.endCell[1] * blockWidth + xOffset + (blockWidth - textSize) / 2,
        maze.endCell[0] * blockHeight + (blockHeight - textSize) / 2,
        textSize
      );
    };

    draw();
  }, [goalCtx, maze, goalText]);

  // player
  useEffect(() => {
    const draw = () => {
      if (!maze) {
        return;
      }

      objectsCtx.fillStyle = 'transparent';
      objectsCtx.clearRect(
        0,
        0,
        objectsCanvas.current.width,
        objectsCanvas.current.height
      );

      const blockWidth = Math.floor(objectsCanvas.current.width / maze.cols);
      const blockHeight = Math.floor(objectsCanvas.current.height / maze.rows);
      const xOffset = Math.floor(
        (objectsCanvas.current.width - maze.cols * blockWidth) / 2
      );

      const imageSize = 0.75 * Math.min(blockWidth, blockHeight);

      const player = new Image(imageSize, imageSize);
      player.onload = () => {
        objectsCtx.drawImage(
          player,
          currentCell[0] * blockWidth + xOffset + (blockWidth - imageSize) / 2,
          currentCell[1] * blockHeight + (blockHeight - imageSize) / 2,
          imageSize,
          imageSize
        );
      };
      player.src = logoImage;
    };

    draw();
  }, [objectsCtx, maze, currentCell]);

  // maze
  useEffect(() => {
    const drawLine = (x1, y1, width, height) => {
      mazeCtx.strokeStyle = 'white';
      mazeCtx.beginPath();
      mazeCtx.moveTo(x1, y1);
      mazeCtx.lineTo(x1 + width, y1 + height);
      mazeCtx.stroke();
    };

    const draw = () => {
      if (!maze) {
        return;
      }

      mazeCtx.fillStyle = 'blue';
      mazeCtx.fillRect(
        0,
        0,
        mazeCanvas.current.width,
        mazeCanvas.current.height
      );

      const blockWidth = Math.floor(mazeCanvas.current.width / maze.cols);
      const blockHeight = Math.floor(mazeCanvas.current.height / maze.rows);
      const xOffset = Math.floor(
        (mazeCanvas.current.width - maze.cols * blockWidth) / 2
      );

      for (let y = 0; y < maze.rows; y++) {
        for (let x = 0; x < maze.cols; x++) {
          const cell = maze.cells[x + y * maze.cols];
          if (y === 0 && cell[0]) {
            drawLine(blockWidth * x + xOffset, blockHeight * y, blockWidth, 0);
          }
          if (cell[1]) {
            drawLine(
              blockWidth * (x + 1) + xOffset,
              blockHeight * y,
              0,
              blockHeight
            );
          }
          if (cell[2]) {
            drawLine(
              blockWidth * x + xOffset,
              blockHeight * (y + 1),
              blockWidth,
              0
            );
          }
          if (x === 0 && cell[3]) {
            drawLine(blockWidth * x + xOffset, blockHeight * y, 0, blockHeight);
          }
        }
      }

      const imageSize = 0.75 * Math.min(blockWidth, blockHeight);

      if (lollipopCell) {
        const lollipop = new Image(imageSize, imageSize);
        lollipop.onload = () => {
          mazeCtx.drawImage(
            lollipop,
            lollipopCell[0] * blockWidth +
              xOffset +
              (blockWidth - imageSize) / 2,
            lollipopCell[1] * blockHeight + (blockHeight - imageSize) / 2,
            imageSize,
            imageSize
          );
        };
        lollipop.src = lollipopImage;
      }

      if (icecreamCell) {
        const icecream = new Image(imageSize, imageSize);
        icecream.onload = () => {
          mazeCtx.drawImage(
            icecream,
            icecreamCell[0] * blockWidth +
              xOffset +
              (blockWidth - imageSize) / 2,
            icecreamCell[1] * blockHeight + (blockHeight - imageSize) / 2,
            imageSize,
            imageSize
          );
        };
        icecream.src = icecreamImage;
      }
    };

    draw();
  }, [mazeCtx, maze, lollipopCell, icecreamCell]);

  const hasUserReachedCell = useCallback(
    targetCell => {
      return areCellsEqual(currentCell, targetCell);
    },
    [currentCell]
  );

  useEffect(() => {
    if (lollipopCell && hasUserReachedCell(lollipopCell)) {
      setReachedLollipopAtCell(lollipopCell);
    }

    if (mazeCtx && reachedLollipopAtCell) {
      const blockWidth = Math.floor(mazeCanvas.current.width / maze.cols);
      const blockHeight = Math.floor(mazeCanvas.current.height / maze.rows);
      const xOffset = Math.floor(
        (mazeCanvas.current.width - maze.cols * blockWidth) / 2
      );
      const textSize = Math.min(blockWidth, blockHeight);
      mazeCtx.fillStyle = 'red';
      mazeCtx.font = '20px "Joystix"';
      mazeCtx.textBaseline = 'top';
      mazeCtx.fillText(
        `+${LOLLIPOP.BONUS_POINTS}`,
        reachedLollipopAtCell[0] * blockWidth +
          xOffset +
          (blockWidth - textSize) / 2,
        reachedLollipopAtCell[1] * blockHeight + (blockHeight - textSize) / 2,
        textSize
      );
    }

    if (icecreamCell && hasUserReachedCell(icecreamCell)) {
      console.log('icecream Reached! at Board');
      SetReachedIcecreamAtCell(icecreamCell);
    }

    if (mazeCtx && reachedIcecreamAtCell) {
      const blockWidth = Math.floor(mazeCanvas.current.width / maze.cols);
      const blockHeight = Math.floor(mazeCanvas.current.height / maze.rows);
      const xOffset = Math.floor(
        (mazeCanvas.current.width - maze.cols * blockWidth) / 2
      );
      const textSize = Math.min(blockWidth, blockHeight);
      mazeCtx.fillStyle = 'red';
      mazeCtx.font = '20px "Joystix"';
      mazeCtx.textBaseline = 'top';
      mazeCtx.fillText(
        `+${ICECREAM.BONUS_POINTS}`,
        reachedIcecreamAtCell[0] * blockWidth +
          xOffset +
          (blockWidth - textSize) / 2,
        reachedIcecreamAtCell[1] * blockHeight + (blockHeight - textSize) / 2,
        textSize
      );
    }
  }, [
    lollipopCell,
    icecreamCell,
    hasUserReachedCell,
    mazeCtx,
    maze,
    reachedLollipopAtCell,
    reachedIcecreamAtCell
  ]);

  useInterval(() => {
    if (reachedLollipopAtCell) {
      console.log('lollipop Cleared!');
      setReachedLollipopAtCell(null);
    }
    if (reachedIcecreamAtCell) {
      console.log('icecream Cleared!');
      SetReachedIcecreamAtCell(null);
    }
  }, 3000);

  useEffect(() => {
    if (!isRoundActive) {
      setReachedLollipopAtCell(null);
      SetReachedIcecreamAtCell(null);
    }
  }, [isRoundActive, setReachedLollipopAtCell, SetReachedIcecreamAtCell]);

  useInterval(() => {
    setGoalText(goalText ? '' : 'Goal');
  }, 1000);

  return (
    <div className={styles.root} ref={container}>
      <canvas ref={mazeCanvas} style={{ zIndex: 1, position: 'absolute' }} />
      <canvas ref={goalCanvas} style={{ zIndex: 2, position: 'absolute' }} />
      <canvas ref={objectsCanvas} style={{ zIndex: 3, position: 'absolute' }} />
    </div>
  );
}

Board.propTypes = {
  maze: PropTypes.shape({
    cols: PropTypes.number.isRequired,
    rows: PropTypes.number.isRequired,
    cells: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
    currentCell: PropTypes.arrayOf(PropTypes.number)
  })
};

export default Board;
