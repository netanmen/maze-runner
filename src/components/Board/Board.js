import React, { useEffect, useRef, useState, useCallback } from 'react';
import useInterval from '@use-it/interval';
import PropTypes from 'prop-types';

import styles from './Board.module.css';
import { areCellsEqual } from '../../utility/utility';
import logoImage from '../../assets/images/logo.svg';
import lollipopImage from '../../assets/images/lollipop.svg';
import icecreamImage from '../../assets/images/ice_cream.svg';

function Board(props) {
  const { maze, isRoundActive, currentCell, lollipopCell, icecreamCell } = props;
  const mazeCanvas = useRef(null);
  const container = useRef(null);
  const [goalText, setGoalText] = useState('Goal');
  const [reachedLollipopCell, setReachedLollipopCell] = useState(null);
  const [reachedIcecreamCell, SetReachedIcecreamCell] = useState(null);
  // const [icecreamCell, setIcecreamCell] = useState(icecreamCellProp);
  const [mazeCtx, setMazeCtx] = useState(undefined);

  useEffect(() => {
    const fitToContainer = () => {
      const { offsetWidth, offsetHeight } = container.current;
      mazeCanvas.current.width = offsetWidth;
      mazeCanvas.current.height = offsetHeight;
      mazeCanvas.current.style.width = offsetWidth + 'px';
      mazeCanvas.current.style.height = offsetHeight + 'px';
    };

    setMazeCtx(mazeCanvas.current.getContext('2d'));
    setTimeout(fitToContainer, 0);
  }, []);

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
      mazeCtx.fillRect(0, 0, mazeCanvas.current.width, mazeCanvas.current.height);

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

      const player = new Image(imageSize, imageSize);
      player.onload = () => {
        mazeCtx.drawImage(
          player,
          currentCell[0] * blockWidth + xOffset + (blockWidth - imageSize) / 2,
          currentCell[1] * blockHeight + (blockHeight - imageSize) / 2,
          imageSize,
          imageSize
        );
      };
      player.src = logoImage;

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
        console.log('icecream added! icecreamCell: ', icecreamCell);
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

      const textSize = Math.min(blockWidth, blockHeight);
      mazeCtx.fillStyle = 'red';
      mazeCtx.font = '20px "Joystix"';
      mazeCtx.textBaseline = 'top';
      mazeCtx.fillText(
        goalText,
        maze.endCell[1] * blockWidth + xOffset + (blockWidth - textSize) / 2,
        maze.endCell[0] * blockHeight + (blockHeight - textSize) / 2,
        textSize
      );
    };

    draw();
  }, [mazeCtx, currentCell, maze, lollipopCell, icecreamCell, goalText]);

  // useEffect(() => {
  //   if (lollipopCellProp && !lollipopCell) {
  //     setLollipopCell(lollipopCellProp);
  //   }
  //   if (icecreamCellProp && !icecreamCell) {
  //     setIcecreamCell(icecreamCellProp);
  //   }
  // }, [lollipopCellProp, lollipopCell, icecreamCellProp, icecreamCell])

  const hasUserReachedCell = useCallback(
    targetCell => {
      return areCellsEqual(currentCell, targetCell);
    },
    [currentCell]
  );

  useEffect(() => {
    if (lollipopCell) {
      console.log('lollipopCell exists!', lollipopCell);
      if (hasUserReachedCell(lollipopCell)) {
        // handleLollipopBonus();
        console.log('lollipop Reached! at Board');
      }
    }
    // if (icecreamCell) {
    //     console.log('icecreamCell exists!', icecreamCell);
    //     if (hasUserReachedCell(icecreamCell)) {
    //     console.log('icecream Reached! at Board');

    //     const blockWidth = Math.floor(canvas.current.width / maze.cols);
    //     const blockHeight = Math.floor(canvas.current.height / maze.rows);
    //     const xOffset = Math.floor(
    //       (canvas.current.width - maze.cols * blockWidth) / 2
    //     );
    //     const textSize = Math.min(blockWidth, blockHeight);
    //     ctx.fillStyle = 'red';
    //     ctx.font = '20px "Joystix"';
    //     ctx.textBaseline = 'top';
    //     ctx.fillText(
    //       'TESTING!',
    //       maze.endCell[1] * blockWidth + xOffset + (blockWidth - textSize) / 2,
    //       maze.endCell[0] * blockHeight + (blockHeight - textSize) / 2,
    //       textSize
    //     );
    //     // handleIcecreamBonus();
    //   }
    // }

    if (icecreamCell && hasUserReachedCell(icecreamCell)) {
      console.log('icecream Reached! at Board');
      SetReachedIcecreamCell(icecreamCell);
    }
    
    if (mazeCtx && reachedIcecreamCell) {
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
          'TESTING!',
          reachedIcecreamCell[1] * blockWidth + xOffset + (blockWidth - textSize) / 2,
          reachedIcecreamCell[0] * blockHeight + (blockHeight - textSize) / 2,
          textSize
        );
        // handleIcecreamBonus();
    }
  }, [lollipopCell, icecreamCell, hasUserReachedCell, mazeCtx, maze, reachedIcecreamCell]);

  useInterval(() => {
    if (reachedLollipopCell) {
      console.log('lollipop Cleared!');
      setReachedLollipopCell(null);
    }
    if (reachedIcecreamCell) {
      console.log('icecream Cleared!');
      SetReachedIcecreamCell(null);
    }
  }, 3000);

  useEffect(() => {
   if (!isRoundActive) {
     setReachedLollipopCell(null);
     SetReachedIcecreamCell(null);
   } 
  },[isRoundActive, setReachedLollipopCell, SetReachedIcecreamCell])

  useInterval(() => {
    setGoalText(goalText ? '' : 'Goal');
  }, 1000);
  
  return (
    <div className={styles.root} ref={container}>
      <canvas ref={mazeCanvas} />
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
