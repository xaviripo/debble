import React, { useState, useEffect } from 'react';

export const Media = ({ date }) => {

  let [type, setType] = useState('');

  useEffect(() => { (async () => {
    const response = await fetch(`media/${date}`);
    setType(response.headers.get('Content-Type'));
  })(); }, []);

  let mediaElement = null;

  if (type.match(/image\/.*/g)) {
    mediaElement = <img style={{maxHeight: '100%', maxWidth: '100%'}} src={`media/${date}`}/>;
  } else if (type.match(/video\/.*/g)) {
    mediaElement = <video style={{maxHeight: '100%', maxWidth: '100%'}} controls>
        <source src={`media/${date}`}/>
        Your browser does not support the video element.
      </video>;
  } else if (type.match(/audio\/.*/g)) {
    mediaElement = <audio controls>
      <source src={`media/${date}`}/>
      Your browser does not support the audio element.
    </audio>;
  }

  return <div className="d-flex justify-content-center mb-3">
    {mediaElement}
  </div>;

}