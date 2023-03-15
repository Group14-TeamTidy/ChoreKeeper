/*
 ** This function returns the interval a chore is to be repeated in ms
 ** @param Number quantity - frequncy.quantity of a chore
 ** @param String interval - frequncy.interval of a chore
 */
export const repeatInMs = (quantity, interval) => {
  const toDaysSelector = { days: 1, weeks: 7, months: 30, years: 365 };
  return toDaysSelector[interval] * quantity * 86400000;
};
