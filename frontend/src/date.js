// Returns today's date as a string in ISO 8859 format
// e.g. "2023-03-04"
const TIMEZONE = "Europe/Amsterdam";

export const format = date => date.toISOString().slice(0, 10)
export const today = () => format(new Date(new Date().toLocaleString("en-US", {timeZone: TIMEZONE})));
