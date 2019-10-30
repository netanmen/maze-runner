import React from 'react';
import styles from './Header.module.css';
import PropTypes from 'prop-types';

function Header({ hiScore, time, points, round }) {
  const applyHeaderFormat = (value, padStartSpaces) => {
    return value || value === 0
      ? value.toString().padStart(padStartSpaces, ' ')
      : null;
  };

  return (
    <header>
      <div className={styles.row}>
        <p>Welcome to the StorrSoft maze!</p>
        <p>
          Hi-Score{' '}
          <span className={styles.headerText}>
            {applyHeaderFormat(hiScore, 5)}
          </span>
        </p>
      </div>
      <p>
        1UP{' '}
        <span className={styles.headerText}>
          {applyHeaderFormat(points, 5)}
        </span>
        &nbsp;&nbsp; ROUND{' '}
        <span className={styles.headerText}>{applyHeaderFormat(round, 3)}</span>
        &nbsp;&nbsp; TIME{' '}
        <span className={styles.headerText}>{applyHeaderFormat(time, 2)}</span>
      </p>
    </header>
  );
}

Header.propTypes = {
  time: PropTypes.number,
  hiScore: PropTypes.number.isRequired,
  points: PropTypes.number.isRequired,
  round: PropTypes.number.isRequired
};

export default Header;
