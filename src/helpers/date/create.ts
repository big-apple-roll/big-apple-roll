import { DateTime } from "luxon";

export const createDate = (options: { year: number; month: number; day: number }): DateTime => {
  return DateTime.utc(options.year, options.month, options.day);
};

export const today = () => {
  return now().startOf("day");
};

export const now = (): DateTime => {
  const now = DateTime.local();
  return DateTime.utc(
    now.year,
    now.month,
    now.day,
    now.hour,
    now.minute,
    now.second,
    now.millisecond,
  );
};
