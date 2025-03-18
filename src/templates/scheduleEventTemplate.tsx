import clsx from "clsx";
import { graphql, PageProps } from "gatsby";
import React from "react";

import HeadLayout from "src/components/layouts/headLayout";
import Navigation from "src/components/navigation";
import { ScheduleEventDifficulty } from "src/fragments/schedule/scheduleEventFragment";
import { formatDate, formatDateTime } from "src/helpers/date";
import getParentSlug from "src/helpers/getParentSlug";
import isEnumValue from "src/helpers/isEnumValue";
import switchOn from "src/helpers/switchOn";
import * as classNames from "src/templates/scheduleEventTemplate.module.css";

export type ScheduleEventTemplateContext = {
  scheduleEventId: string;
  previousScheduleEventId?: string;
  nextScheduleEventId?: string;
};

export const query = graphql`
  query ScheduleEventTemplate(
    $scheduleEventId: String!
    $previousScheduleEventId: String = ""
    $nextScheduleEventId: String = ""
  ) {
    scheduleEvent: markdownRemark(id: { eq: $scheduleEventId }) {
      ...ScheduleEventFragment
    }
    previousScheduleEvent: markdownRemark(id: { eq: $previousScheduleEventId }) {
      ...ScheduleEventFragment
    }
    nextScheduleEvent: markdownRemark(id: { eq: $nextScheduleEventId }) {
      ...ScheduleEventFragment
    }
  }
`;

export default function ScheduleEventTemplate(
  props: PageProps<Queries.ScheduleEventTemplateQuery, ScheduleEventTemplateContext>,
): React.JSX.Element {
  const { data } = props;
  const { scheduleEvent, previousScheduleEvent, nextScheduleEvent } = data;
  if (!scheduleEvent || !scheduleEvent.frontmatter?.date) {
    return <div />;
  }

  return (
    <>
      <Navigation
        previousSlug={getParentSlug(scheduleEvent?.slug)}
        previousTitle={formatDate(scheduleEvent.frontmatter.date, { format: "weekday" })}
      ></Navigation>
      <h1>{scheduleEvent.frontmatter.title}</h1>
      <h2>{formatDateTime(scheduleEvent.frontmatter.date)}</h2>
      {scheduleEvent.frontmatter.difficulty &&
      isEnumValue(scheduleEvent.frontmatter.difficulty, ScheduleEventDifficulty) ? (
        <div
          className={clsx(
            classNames.difficulty,
            switchOn(scheduleEvent.frontmatter.difficulty, {
              [ScheduleEventDifficulty.Easy]: classNames.isEasy,
              [ScheduleEventDifficulty.Casual]: classNames.isCasual,
              [ScheduleEventDifficulty.Moderate]: classNames.isModerate,
              [ScheduleEventDifficulty.Advanced]: classNames.isAdvanced,
            }),
          )}
        >
          <span className={classNames.difficultyLabel}>
            {switchOn(scheduleEvent.frontmatter.difficulty, {
              [ScheduleEventDifficulty.Easy]: "Easy street skate",
              [ScheduleEventDifficulty.Casual]: "Casual street skate",
              [ScheduleEventDifficulty.Moderate]: "Moderate street skate",
              [ScheduleEventDifficulty.Advanced]: "Advanced street skate",
            })}
          </span>
        </div>
      ) : null}
      <div className={classNames.details}>
        <dl className={classNames.detailsList}>
          {scheduleEvent.frontmatter.location ? (
            <>
              <dt className={classNames.detailsListTerm}>Location:</dt>
              <dd className={classNames.detailsListDescription}>
                {scheduleEvent.frontmatter.location}
              </dd>
            </>
          ) : null}
          {scheduleEvent.frontmatter.start ? (
            <>
              <dt className={classNames.detailsListTerm}>Start:</dt>
              <dd className={classNames.detailsListDescription}>
                {scheduleEvent.frontmatter.start}
              </dd>
            </>
          ) : null}
          {scheduleEvent.frontmatter.end ? (
            <>
              <dt className={classNames.detailsListTerm}>End:</dt>
              <dd className={classNames.detailsListDescription}>{scheduleEvent.frontmatter.end}</dd>
            </>
          ) : null}
          {scheduleEvent.frontmatter.leader ? (
            <>
              <dt className={classNames.detailsListTerm}>Leader:</dt>
              <dd className={classNames.detailsListDescription}>
                {scheduleEvent.frontmatter.leader}
              </dd>
            </>
          ) : null}
          {scheduleEvent.frontmatter.distance ? (
            <>
              <dt className={classNames.detailsListTerm}>Distance:</dt>
              <dd className={classNames.detailsListDescription}>
                {scheduleEvent.frontmatter.distance}
              </dd>
            </>
          ) : null}
          {scheduleEvent.frontmatter.highlights ? (
            <>
              <dt className={classNames.detailsListTerm}>Highlights:</dt>
              <dd className={classNames.detailsListDescription}>
                {scheduleEvent.frontmatter.highlights}
              </dd>
            </>
          ) : null}
        </dl>
        {scheduleEvent.frontmatter.start_map ? (
          <div>
            <iframe
              className={classNames.detailsMapFrame}
              src={scheduleEvent.frontmatter.start_map}
            ></iframe>
          </div>
        ) : null}
      </div>
      {scheduleEvent.frontmatter.teaser ? (
        <div>
          <p>
            Our team is hard at work planning the best skates for you. Check back soon for more
            details.
          </p>
        </div>
      ) : null}
      {scheduleEvent.html ? (
        <div
          className={classNames.description}
          dangerouslySetInnerHTML={{ __html: scheduleEvent.html }}
        ></div>
      ) : null}
      {scheduleEvent.frontmatter.route_map ? (
        <>
          <h3>Route map</h3>
          <iframe
            className={classNames.routeMapFrame}
            src={scheduleEvent.frontmatter.route_map}
            width="640"
            height="480"
          ></iframe>
        </>
      ) : null}
      <div className={classNames.pagination}>
        <Navigation
          previousSlug={previousScheduleEvent?.slug ?? undefined}
          previousTitle={previousScheduleEvent?.frontmatter?.title ?? undefined}
          nextSlug={nextScheduleEvent?.slug ?? undefined}
          nextTitle={nextScheduleEvent?.frontmatter?.title ?? undefined}
        ></Navigation>
      </div>
    </>
  );
}

export function Head(
  props: PageProps<Queries.ScheduleEventTemplateQuery, ScheduleEventTemplateContext>,
): JSX.Element {
  const { data } = props;
  const { scheduleEvent } = data;
  return <HeadLayout pageTitle={scheduleEvent?.frontmatter?.title} />;
}
