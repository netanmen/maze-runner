export const areCellsEqual = (sourceCell, targetCell) => {
  if (!targetCell) {
    throw new Error('ERROR at hasUserReachedCell: no targetCell.', targetCell);
  }
  if (!sourceCell) {
    throw new Error('ERROR at hasUserReachedCell: no sourceCell.', sourceCell);
  }
  const [sourceX, sourceY] = sourceCell;
  const [targetX, targetY] = targetCell;
  if (sourceX === targetX && sourceY === targetY) {
    return true;
  } else {
    return false;
  }
};
