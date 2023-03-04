import React, { useState } from 'react';
import { Media } from './Media';
import { AttemptsList } from './AttemptsList';
import { AttemptForm } from './AttemptForm';

export const Puzzle = ({ date }) => {

  let [updater, setUpdater] = useState(0);
  let [disabled, setDisabled] = useState(false);
  let [attemptDate, setAttemptDate] = useState('');

  const forceAttemptsListUpdate = () => {
    setUpdater(updater + 1);
  };

  return <>
    <Media date={date}/>
    <AttemptsList date={date} updater={updater} setDisabled={setDisabled} setAttemptDate={setAttemptDate}/>
    <AttemptForm date={date} attemptDate={attemptDate} setAttemptDate={setAttemptDate} forceAttemptsListUpdate={forceAttemptsListUpdate} disabled={disabled}/>
  </>
};
