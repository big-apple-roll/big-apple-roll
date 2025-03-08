import { DateTime } from "luxon";

import assertNever from "src/helpers/assertNever";

const parseDate = (date: string): DateTime => {
  return DateTime.fromISO(date, { zone: "utc" });
};

export const formatDate = (
  date: string,
  options: { format?: "huge" | "short" | "weekday" | "year" } = {},
): string => {
  const { format = "huge" } = options;

  const dateTimeFormatOptions = ((): Intl.DateTimeFormatOptions => {
    switch (format) {
      case "huge": {
        return DateTime.DATE_HUGE;
      }
      case "short": {
        return {
          month: "long",
          day: "numeric",
        };
      }
      case "weekday": {
        return {
          weekday: "long",
        };
      }
      case "year": {
        return {
          year: "numeric",
        };
      }
      default: {
        assertNever(format);
        return {};
      }
    }
  })();

  return parseDate(date).toLocaleString(dateTimeFormatOptions);
};

export const formatTime = (date: string): string => {
  return parseDate(date).toLocaleString(DateTime.TIME_SIMPLE);
};

export const formatDateTime = (date: string): string => {
  return parseDate(date).toLocaleString({
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
  });
};

export const formatDateInterval = (start: string, end: string): string => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const interval = startDate.until(endDate);
  return interval.toLocaleString(DateTime.DATE_FULL);
};

export const currentDateInput = () => {
  return DateTime.now().toFormat("yyyy-MM-dd");
};
