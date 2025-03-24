import { DateTime } from "luxon";

const parseDate = (date: string): DateTime => {
  return DateTime.fromISO(date, { zone: "utc" });
};

export default parseDate;
