import React, { useEffect, useState, useRef } from 'react';

// Hey! This constant is also present in the backend.
const MAX_ATTEMPTS = 6;

const clueTextColor = clue => {

  if (clue === null) {
    return {
      text: '',
      color: '',
      emoji: '',
    };
  }

  if (clue === '') {
    return {
      text: 'correct!',
      color: 'green',
      emoji: '🟩',
    };
  }

  const period = clue[0];
  const older = clue[1] === '-';

  switch(period) {
    case 'x':
      return {
        text: older ? 'more than a year before' : 'more than a year after',
        color: 'black',
        emoji: '⬛',
      };
    case 'y':
      return {
        text: older ? 'less than a year before' : 'less than a year after',
        color: 'brown',
        emoji: '🟫',
      };
    case 's':
      return {
        text: older ? 'less than six months before' : 'less than six months after',
        color: 'red',
        emoji: '🟥',
      };
    case 'm':
      return {
        text: older ? 'less than a month before' : 'less than a month after',
        color: 'orange',
        emoji: '🟧',
      };
    case 'w':
      return {
        text: older ? 'less than a week before' : 'less than a week after',
        color: 'yellow',
        emoji: '🟨',
      };
  }

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
  let [showShare, setShowShare] = useState(false);

  useEffect(() => { (async () => {
    const response = await fetch(`attempts/${date}`);
    const data = await response.json();

    setAttempts(fill(data));

    // If max number of attempts reached OR some attempt is successful, game ends
    if (data.length >= MAX_ATTEMPTS || data.some(({ clue }) => clue === "")) {
      // Disable the form
      setDisabled(true);
      // Show share the button
      setShowShare(true);
    }

    // Player didn't get the solution correctly
    if (data.length >= MAX_ATTEMPTS && data.every(({ clue }) => clue !== "")) {
      const response = await fetch(`solution/${date}`);
      setSolution(await response.text());
    }

  })(); }, [updater]);

  const tooltipRef = useRef();
  useEffect(() => {
    try {
      new bootstrap.Tooltip(tooltipRef.current, {
        title: "Copied to clipboard!",
        placement: 'top',
        trigger: 'click',
      });
    } catch {}
  });

  let shareButton = (result) => <button
    id="shareButton"
    className="mx-auto btn btn-primary shadow-none"
    ref={tooltipRef}
    onClick={() => navigator.clipboard.writeText(`Debble ${new Date(date).toLocaleDateString()}}
🇩${Object.assign(new Array(MAX_ATTEMPTS).fill('▫️'), [...result]).join('')}

https://debble.app`)}>Share</button>;

  let solutionOutput = <span className="text-danger">Solution: {solution}</span>;

  let result = '';

  return <>
    <div className="my-3">
      {attempts.map(({ attemptDate, clue }, attemptNumber) => {
        let {text, color, emoji} = clueTextColor(clue);
        let lightText = ['black', 'brown'].includes(color);
        result += emoji;
        return <div key={attemptNumber} className={`d-flex border rounded p-2 m-1 ${lightText ? 'text-light' : ''}`} style={{backgroundColor: color}}>
          <span className="me-auto">{attemptDate ? new Date(attemptDate).toLocaleDateString() : '-'}</span>
          <small className={`ms-auto text-muted${lightText ? '-light' : ''}`}>{text}</small>
        </div>;
      })}
    </div>
    {showShare ? shareButton(result) : null}
    {solution ? solutionOutput : ''}
  </>;
}
