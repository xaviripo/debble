import React from "react";
import { createRoot } from 'react-dom/client';
import { Puzzle } from "./Puzzle";

const [month, day, year] = new Date()
  .toLocaleString("en-US", {timeZone: "Europe/Amsterdam"})
  .slice(0, 10)
  .split(',')[0]
  .split('/')
  .map(str => +str); // cast to number

const dateString = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

createRoot(document.getElementById("react-root")).render(<Puzzle date={dateString}/>);
