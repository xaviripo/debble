import React, { useState } from 'react';

export const AttemptForm = ({ date, forceAttemptsListUpdate, disabled }) => {

  let [attemptDate, setAttemptDate] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const response = await fetch(`attempts/${date}`, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'attempt_date': attemptDate,
      }),
    });

    switch(response.status) {
      case 201: // Attempt accepted

        // Clear input
        setAttemptDate('');

        // Update the list of attempts
        forceAttemptsListUpdate();

        break;
      case 409: // Attempt denied

        // Clear input
        setAttemptDate('');

        if ("Maximum number of attempts reached" === await response.text()) {
          // This is not too user friendly, but it shouldn't be happening anyways
          alert("Maximum number of attempts reached");
        }

        break;
    }

  };

  return <form className="form-inline d-flex justify-content-center" onSubmit={onSubmitHandler}>
    <input className="form-control shadow-none" type="date" value={attemptDate} onChange={e => setAttemptDate(e.target.value)} disabled={disabled}/>
    <button className="btn btn-secondary shadow-none" type="submit" disabled={disabled}>Submit</button>
  </form>;

}
