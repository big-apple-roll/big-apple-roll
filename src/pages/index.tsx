import clsx from "clsx";
import { graphql, useStaticQuery } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import React from "react";

import SurfaceButton from "src/components/buttons/surfaceButton";
import HeadLayout from "src/components/layouts/headLayout";
import { formatDateInterval } from "src/helpers/date";
import * as classNames from "src/pages/index.module.css";

export default function Index() {
  const { metadata } = useStaticQuery<Queries.IndexQuery>(graphql`
    query Index {
      metadata: markdownRemark(fileName: { eq: "metadata" }, fileRelativeDirectory: { eq: "" }) {
        ...MetadataFragment
      }
    }
  `);

  return (
    <>
      <div className={classNames.logo}>
        <StaticImage
          src="../components/images/logo.png"
          alt="Logo"
          placeholder="none"
          layout="constrained"
          width={500}
        />
      </div>
      {metadata?.frontmatter?.start_date && metadata.frontmatter.end_date ? (
        <h2 className={classNames.date}>
          <div
            className={clsx({
              [classNames.expiredDate]:
                metadata?.frontmatter?.next_year &&
                metadata.frontmatter.next_year.start_date !== metadata.frontmatter.start_date,
            })}
          >
            {formatDateInterval(metadata.frontmatter.start_date, metadata.frontmatter.end_date)}
          </div>
          {metadata?.frontmatter?.next_year?.start_date &&
          metadata.frontmatter.next_year.end_date &&
          metadata.frontmatter.next_year.start_date !== metadata.frontmatter.start_date ? (
            <div>
              Join us next year:{" "}
              {formatDateInterval(
                metadata.frontmatter.next_year.start_date,
                metadata.frontmatter.next_year.end_date,
              )}
            </div>
          ) : null}
        </h2>
      ) : null}
      <div className={classNames.menu}>
        {/* <SurfaceButton internalHref="/hotel/">Book a room</SurfaceButton> */}
      </div>
    </>
  );
}

export function Head() {
  return <HeadLayout />;
}
