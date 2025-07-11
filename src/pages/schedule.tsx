import { graphql, useStaticQuery } from "gatsby";
import React, { useMemo } from "react";

import SurfaceButton from "src/components/buttons/surfaceButton";
import HeadLayout from "src/components/layouts/headLayout";
import { formatDate } from "src/helpers/date/format";
import parseDate from "src/helpers/date/parseDate";
import * as classNames from "src/pages/schedule.module.css";

export default function Schedule(): React.JSX.Element {
  const { index, scheduleEvents } = useStaticQuery<Queries.ScheduleQuery>(graphql`
    query Schedule {
      index: markdownRemark(relativePath: { eq: "index/index.md" }) {
        ...IndexFragment
      }
      scheduleEvents: allMarkdownRemark(
        filter: { relativeDirectory: { regex: "/^schedule/" } }
        sort: { frontmatter: { date: ASC } }
      ) {
        nodes {
          ...ScheduleEventFragment
        }
      }
    }
  `);

  const scheduleEventsByDay = useMemo(() => {
    const prefixLength = "schedule/".length + 1;
    return scheduleEvents.nodes.reduce<Record<string, typeof scheduleEvents.nodes>>((acc, node) => {
      const { slug } = node;
      const day = slug.substring(prefixLength, slug.indexOf("/", prefixLength));
      return {
        ...acc,
        [day]: [...(acc[day] ?? []), node],
      };
    }, {});
  }, [scheduleEvents]);

  return (
    <div className={classNames.schedule}>
      {Object.entries(scheduleEventsByDay).map(([day, scheduleEvents]) => {
        const scheduleEvent = scheduleEvents[0];
        if (!scheduleEvent || !scheduleEvent.frontmatter?.date) {
          return null;
        }

        const preBar =
          !!index?.frontmatter?.start_date &&
          parseDate(scheduleEvent.frontmatter.date) < parseDate(index.frontmatter.start_date);

        return (
          <SurfaceButton
            key={day}
            color={preBar ? "accent3" : undefined}
            size="large"
            internalHref={`/schedule/${day}/`}
            banner={
              preBar
                ? "Pre bar"
                : formatDate(parseDate(scheduleEvent.frontmatter.date), {
                    format: "short",
                  })
            }
          >
            {day}
          </SurfaceButton>
        );
      })}
    </div>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Schedule" />;
}
