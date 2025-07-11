import { graphql, HeadProps, Link, PageProps } from "gatsby";
import React from "react";

import HeadLayout from "src/components/layouts/headLayout";
import Navigation from "src/components/navigation";
import { formatDate, formatTime } from "src/helpers/date/format";
import parseDate from "src/helpers/date/parseDate";
import toTitleCase from "src/helpers/toTitleCase";
import * as classNames from "src/templates/scheduleDayTemplate.module.css";

export type ScheduleDayTemplateContext = {
  scheduleDay: string;
  scheduleEventsSlugRegex: string;
  previousScheduleDay?: string;
  nextScheduleDay?: string;
};

export const query = graphql`
  query ScheduleDayTemplate($scheduleEventsSlugRegex: String!) {
    scheduleEvents: allMarkdownRemark(
      filter: { slug: { regex: $scheduleEventsSlugRegex } }
      sort: { frontmatter: { date: ASC } }
    ) {
      nodes {
        ...ScheduleEventFragment
      }
    }
  }
`;

export default function ScheduleDayTemplate(
  props: PageProps<Queries.ScheduleDayTemplateQuery, ScheduleDayTemplateContext>,
): React.JSX.Element | null {
  const { data, pageContext } = props;
  const { scheduleEvents } = data;
  const { previousScheduleDay, nextScheduleDay } = pageContext;

  const scheduleEvent = scheduleEvents.nodes[0];
  if (!scheduleEvent) {
    return null;
  }

  return (
    <>
      <Navigation previousSlug="/schedule/" previousTitle="Schedule"></Navigation>
      <h1>
        {scheduleEvent.frontmatter?.date
          ? formatDate(parseDate(scheduleEvent.frontmatter?.date))
          : ""}
      </h1>
      <div className={classNames.events}>
        {scheduleEvents.nodes.map((node) => {
          const { title, date } = node.frontmatter ?? {};
          if (!title || !date || !node.slug) {
            return null;
          }

          return (
            <div key={node.id} className={classNames.event}>
              <div>
                <span className={classNames.eventTimeText}>{formatTime(parseDate(date))}</span>
              </div>
              <div className={classNames.eventSeparator}></div>
              <div className={classNames.eventName}>
                <span className={classNames.eventNameText}>
                  <Link to={node.slug} draggable={false}>
                    {title}
                  </Link>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className={classNames.pagination}>
        <Navigation
          previousSlug={previousScheduleDay ? `/schedule/${previousScheduleDay}/` : undefined}
          previousTitle={previousScheduleDay ? toTitleCase(previousScheduleDay) : undefined}
          nextSlug={nextScheduleDay ? `/schedule/${nextScheduleDay}/` : undefined}
          nextTitle={nextScheduleDay ? toTitleCase(nextScheduleDay) : undefined}
        ></Navigation>
      </div>
    </>
  );
}

export function Head(
  props: HeadProps<Queries.ScheduleDayTemplateQuery, ScheduleDayTemplateContext>,
): React.JSX.Element {
  const { pageContext } = props;
  return <HeadLayout pageTitle={toTitleCase(pageContext.scheduleDay)} />;
}
