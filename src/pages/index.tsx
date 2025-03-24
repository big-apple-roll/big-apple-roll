import clsx from "clsx";
import { graphql, useStaticQuery } from "gatsby";
import React from "react";

import HTML from "src/components/html";
import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import { formatDateInterval } from "src/helpers/date/format";
import * as classNames from "src/pages/index.module.css";

export default function Index() {
  const { index } = useStaticQuery<Queries.IndexQuery>(graphql`
    query Index {
      index: markdownRemark(relativePath: { eq: "index/index.md" }) {
        ...IndexFragment
      }
    }
  `);

  return (
    <>
      <div className={classNames.logo}>
        <Image
          className={classNames.logoImage}
          src={index?.linkedFiles?.[0] ?? index?.linkedImages?.[0]}
          alt="Big Apple Roll"
        />
      </div>
      {index?.frontmatter?.start_date && index.frontmatter.end_date ? (
        <h2 className={classNames.date}>
          <div
            className={clsx({
              [classNames.expiredDate]:
                index?.frontmatter?.next_year &&
                index.frontmatter.next_year.start_date !== index.frontmatter.start_date,
            })}
          >
            {formatDateInterval(index.frontmatter.start_date, index.frontmatter.end_date)}
          </div>
          {index?.frontmatter?.next_year?.start_date &&
          index.frontmatter.next_year.end_date &&
          index.frontmatter.next_year.start_date !== index.frontmatter.start_date ? (
            <div>
              Join us next year:{" "}
              {formatDateInterval(
                index.frontmatter.next_year.start_date,
                index.frontmatter.next_year.end_date,
              )}
            </div>
          ) : null}
        </h2>
      ) : null}
      <HTML html={index?.html} />
      <div className={classNames.menu}>
        {/* <SurfaceButton internalHref="/hotel/">Book a room</SurfaceButton> */}
      </div>
    </>
  );
}

export function Head() {
  return <HeadLayout />;
}
