import React, { useState, useEffect } from 'react';

export const Media = ({ date }) => {

  let [type, setType] = useState('');

  useEffect(() => { (async () => {
    const response = await fetch(`media/${date}`);
    setType(response.headers.get('Content-Type'));
  })(); }, []);

  let mediaElement = null;

  switch(type) {
    case 'image/jpeg':
      mediaElement = <img style={{maxHeight: '400px'}} src={`media/${date}`}/>;
      break;
    case 'video/mp4':
      mediaElement = <video style={{maxHeight: '400px'}} controls>
        <source src={`media/${date}`}/>
        Your browser does not support the video element.
      </video>;
      break;
    case 'audio/mp4a-latm':
    case 'audio/mpeg':
      mediaElement = <audio controls>
        <source src={`media/${date}`}/>
        Your browser does not support the audio element.
      </audio>;
      break;
  }

  return <div className="d-flex justify-content-center mb-3">
    {mediaElement}
  </div>;

}