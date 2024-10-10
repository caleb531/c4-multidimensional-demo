// Convert the given string representing a CSS number value to a millisecond
// value as a native JS number, e.g. ".15s" to 1500 (source:
// <https://stackoverflow.com/a/30546115/560642>)
export function toMS(value) {
  return parseFloat(value) * (/\ds$/.test(value) ? 1000 : 1);
}
