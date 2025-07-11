import { DateTime } from "luxon";

import assertNever from "src/helpers/assertNever";

export const formatDate = (
  date: DateTime,
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

  return date.toLocaleString(dateTimeFormatOptions);
};

export const formatTime = (date: DateTime): string => {
  return date.toLocaleString(DateTime.TIME_SIMPLE);
};

export const formatDateTime = (date: DateTime): string => {
  return date.toLocaleString({
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
  });
};

export const formatDateInterval = (start: DateTime, end: DateTime): string => {
  const interval = start.until(end);
  return interval.toLocaleString(DateTime.DATE_FULL);
};

export const formatDateInput = (date: DateTime) => {
  return date.toFormat("yyyy-MM-dd");
};
