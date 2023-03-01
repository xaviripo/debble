import React, { useState } from 'react';
import { Media } from './Media';
import { AttemptsList } from './AttemptsList';
import { AttemptForm } from './AttemptForm';

export const Puzzle = ({ date }) => {

  let [updater, setUpdater] = useState(0);
  let [disabled, setDisabled] = useState(false);

  const forceAttemptsListUpdate = () => {
    setUpdater(updater + 1);
  };

  return <>
    <Media date={date}/>
    <AttemptsList date={date} updater={updater} disabled={disabled} setDisabled={setDisabled}/>
    <AttemptForm date={date} forceAttemptsListUpdate={forceAttemptsListUpdate} disabled={disabled}/>
  </>
};
