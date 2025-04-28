import { DateTime } from "luxon";

export const createDate = (options: { year: number; month: number; day: number }): DateTime => {
  return DateTime.utc(options.year, options.month, options.day);
};

export const today = () => {
  return DateTime.utc().startOf("day");
};
