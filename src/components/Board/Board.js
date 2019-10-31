import React, { useEffect, useRef, useState, useCallback } from 'react';
import useInterval from '@use-it/interval';
import PropTypes from 'prop-types';

import styles from './Board.module.css';
import logoImage from '../../assets/images/logo.svg';
import lollipopImage from '../../assets/images/lollipop.svg';
import icecreamImage from '../../assets/images/ice_cream.svg';
import { areCellsEqual } from '../../utility/utility';
import { LOLLIPOP, ICECREAM } from '../../constants';

function Board({
  maze,
  isRoundActive,
  currentCell,
  lollipopCell,
  icecreamCell
}) {
  const [goalText, setGoalText] = useState('');
  const [reachedLollipopAtCell, setReachedLollipopAtCell] = useState(null);
  const [reachedIcecreamAtCell, SetReachedIcecreamAtCell] = useState(null);
  const [mazeCtx, setMazeCtx] = useState(undefined);
  const [playerCtx, setPlayersCtx] = useState(undefined);
  const [goalCtx, setGoalCtx] = useState(undefined);
  const [pointsCtx, setPointsCtx] = useState(undefined);

  const mazeCanvas = useRef(null);
  const playerCanvas = useRef(null);
  const pointsCanvas = useRef(null);
  const goalCanvas = useRef(null);
  const container = useRef(null);

  const initializeCanvas = useCallback((canvas, setCanvasContext) => {
    const fitToContainer = () => {
      const { offsetWidth, offsetHeight } = container.current;
      canvas.current.width = offsetWidth;
      canvas.current.height = offsetHeight;
      canvas.current.style.width = offsetWidth + 'px';
      canvas.current.style.height = offsetHeight + 'px';
    };

    setCanvasContext(canvas.current.getContext('2d'));
    setTimeout(fitToContainer, 0);
  }, []);

  useEffect(() => {
    initializeCanvas(mazeCanvas, setMazeCtx);
    initializeCanvas(playerCanvas, setPlayersCtx);
    initializeCanvas(goalCanvas, setGoalCtx);
    initializeCanvas(pointsCanvas, setPointsCtx);
  }, [initializeCanvas]);

  const hasUserReachedCell = useCallback(
    targetCell => {
      return areCellsEqual(currentCell, targetCell);
    },
    [currentCell]
  );

  useEffect(() => {
    if (isRoundActive) {
      if (lollipopCell && hasUserReachedCell(lollipopCell)) {
        setReachedLollipopAtCell(lollipopCell);
      }
      if (icecreamCell && hasUserReachedCell(icecreamCell)) {
        SetReachedIcecreamAtCell(icecreamCell);
      }
    }

    if (!isRoundActive) {
      setReachedLollipopAtCell(null);
      SetReachedIcecreamAtCell(null);
    }
  }, [
    isRoundActive,
    lollipopCell,
    icecreamCell,
    setReachedLollipopAtCell,
    SetReachedIcecreamAtCell,
    hasUserReachedCell
  ]);

  useInterval(
    () => {
      if (reachedLollipopAtCell) {
        setReachedLollipopAtCell(null);
      }
      if (reachedIcecreamAtCell) {
        SetReachedIcecreamAtCell(null);
      }
    },
    reachedLollipopAtCell || reachedIcecreamAtCell ? 3000 : null
  );

  useInterval(() => {
    setGoalText(goalText ? '' : 'Goal');
  }, 1000);

  const drawMaze = useCallback(() => {
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

  const drawPoints = useCallback(() => {
    if (!maze) {
      return;
    }

    pointsCtx.fillStyle = 'transparent';
    pointsCtx.clearRect(
      0,
      0,
      pointsCanvas.current.width,
      pointsCanvas.current.height
    );

    const blockWidth = Math.floor(pointsCanvas.current.width / maze.cols);
    const blockHeight = Math.floor(pointsCanvas.current.height / maze.rows);
    const xOffset = Math.floor(
      (pointsCanvas.current.width - maze.cols * blockWidth) / 2
    );
    const textSize = Math.min(blockWidth, blockHeight);

    pointsCtx.fillStyle = 'red';
    pointsCtx.font = '20px "Joystix"';
    pointsCtx.textBaseline = 'top';

    if (pointsCtx && reachedLollipopAtCell) {
      pointsCtx.fillText(
        `+${LOLLIPOP.BONUS_POINTS}`,
        reachedLollipopAtCell[0] * blockWidth +
          xOffset +
          (blockWidth - textSize) / 2,
        reachedLollipopAtCell[1] * blockHeight + (blockHeight - textSize) / 2,
        textSize
      );
    }

    if (pointsCtx && reachedIcecreamAtCell) {
      pointsCtx.fillText(
        `+${ICECREAM.BONUS_POINTS}`,
        reachedIcecreamAtCell[0] * blockWidth +
          xOffset +
          (blockWidth - textSize) / 2,
        reachedIcecreamAtCell[1] * blockHeight + (blockHeight - textSize) / 2,
        textSize
      );
    }
  }, [pointsCtx, maze, reachedLollipopAtCell, reachedIcecreamAtCell]);

  const drawGoal = useCallback(() => {
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

    goalCtx.fillText(
      goalText,
      maze.endCell[1] * blockWidth + xOffset + (blockWidth - textSize) / 2,
      maze.endCell[0] * blockHeight + (blockHeight - textSize) / 2,
      textSize
    );
  }, [goalCtx, goalText, maze]);

  const drawPlayer = useCallback(() => {
    if (!maze) {
      return;
    }

    playerCtx.fillStyle = 'transparent';
    playerCtx.clearRect(
      0,
      0,
      playerCanvas.current.width,
      playerCanvas.current.height
    );

    const blockWidth = Math.floor(playerCanvas.current.width / maze.cols);
    const blockHeight = Math.floor(playerCanvas.current.height / maze.rows);
    const xOffset = Math.floor(
      (playerCanvas.current.width - maze.cols * blockWidth) / 2
    );
    const imageSize = 0.75 * Math.min(blockWidth, blockHeight);

    const player = new Image(imageSize, imageSize);
    player.onload = () => {
      playerCtx.drawImage(
        player,
        currentCell[0] * blockWidth + xOffset + (blockWidth - imageSize) / 2,
        currentCell[1] * blockHeight + (blockHeight - imageSize) / 2,
        imageSize,
        imageSize
      );
    };
    player.src = logoImage;
  }, [playerCtx, maze, currentCell]);

  useEffect(() => {
    drawMaze();
  }, [drawMaze]);

  useEffect(() => {
    drawGoal();
  }, [drawGoal]);

  useEffect(() => {
    drawPlayer();
  }, [drawPlayer]);

  useEffect(() => {
    drawPoints();
  }, [drawPoints]);

  return (
    <div className={styles.root} ref={container}>
      <canvas ref={mazeCanvas} style={{ zIndex: 1, position: 'absolute' }} />
      <canvas ref={playerCanvas} style={{ zIndex: 2, position: 'absolute' }} />
      <canvas ref={goalCanvas} style={{ zIndex: 3, position: 'absolute' }} />
      <canvas ref={pointsCanvas} style={{ zIndex: 3, position: 'absolute' }} />
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
