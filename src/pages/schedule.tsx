import { graphql, useStaticQuery } from "gatsby";
import React from "react";

import SurfaceButton from "src/components/buttons/surfaceButton";
import HeadLayout from "src/components/layouts/headLayout";
import { formatDate } from "src/helpers/date";
import * as classNames from "src/pages/schedule.module.css";

export default function Schedule(): React.JSX.Element {
  const data = useStaticQuery<Queries.ScheduleQuery>(graphql`
    query Schedule {
      scheduleDays: allMarkdownRemark(
        filter: { relativeDirectory: { eq: "schedule" } }
        sort: { frontmatter: { date: ASC } }
      ) {
        nodes {
          ...ScheduleDayFragment
        }
      }
    }
  `);

  return (
    <div className={classNames.schedule}>
      {data.scheduleDays.nodes.map((node) => {
        const { title, date, pre_bar } = node.frontmatter ?? {};
        if (!title || !date || !node.slug) {
          return null;
        }

        return (
          <SurfaceButton
            key={node.id}
            color={pre_bar ? "accent3" : undefined}
            size="large"
            internalHref={node.slug}
            banner={pre_bar ? "Pre bar" : formatDate(date, { format: "short" })}
          >
            {title}
          </SurfaceButton>
        );
      })}
    </div>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Schedule" />;
}
