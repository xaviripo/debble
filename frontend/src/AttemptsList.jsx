import React, { useEffect, useState } from 'react';

// Hey! This constant is also present in the backend.
const MAX_ATTEMPTS = 6;

const clueText = clue => {

  if (clue.length === 0) {
    return 'you got it!'
  }

  const period = clue[0];
  const older = clue[1] === '-';

  switch(period) {
    case 'x':
      return older ? 'more than a year before' : 'more than a year after';
    case 'y':
      return older ? 'less than a year before' : 'less than a year after';
    case 's':
      return older ? 'less than six months before' : 'less than six months after';
    case 'm':
      return older ? 'less than a month before' : 'less than a month after';
    case 'w':
      return older ? 'less than a week before' : 'less than a week after';
  }

  return '';

};

/**
 * Add empty attempts until we have MAX_ATTEMPTS entries in order to have empty attempt slots
 */
const fill = (attempts) => {
  // Clone the array
  let result = [...attempts];
  for (let i = attempts.length; i < MAX_ATTEMPTS; i++) {
    result.push({
      attemptDate: null,
      clue: null,
    });
  }
  return result;
}

export const AttemptsList = ({ date, updater, setDisabled }) => {

  let [attempts, setAttempts] = useState([]);
  let [solution, setSolution] = useState(null);

  useEffect(() => { (async () => {
    const response = await fetch(`attempts/${date}`);
    const data = await response.json();

    setAttempts(fill(data));

    // If max number of attempts reached OR some attempt is successful, disable the form
    if (data.length >= MAX_ATTEMPTS || data.some(({ clue }) => clue === "")) {
      setDisabled(true);
    }

    // Player didn't get the solution correctly
    if (data.length >= MAX_ATTEMPTS && data.every(({ clue }) => clue !== "")) {
      const response = await fetch(`solution/${date}`);
      setSolution(await response.text());
    }

  })(); }, [updater]);

  let solutionOutput = solution ? <span className="text-danger">Solution: {solution}</span> : '';

  return <>
    <ol style={{listStyleType: 'none'}}>
      {attempts.map(({ attemptDate, clue }, attemptNumber) => <li key={attemptNumber} className="d-flex border rounded p-2">
        <span className="me-auto">{attemptDate ? new Date(attemptDate).toLocaleDateString() : '-'}</span>
        <small className="ms-auto text-muted">{clue ? clueText(clue) : '-'}</small>
      </li>)}
    </ol>
    {solutionOutput}
  </>;
}