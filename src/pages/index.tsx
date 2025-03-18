import clsx from "clsx";
import { graphql, useStaticQuery } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import React from "react";

import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import { formatDateInterval } from "src/helpers/date";
import * as classNames from "src/pages/index.module.css";

export default function Index() {
  const { logo, metadata } = useStaticQuery<Queries.IndexQuery>(graphql`
    query Index {
      logo: file(relativePath: { eq: "logo/tmp-logo.jpg" }) {
        ...ImageFragment
      }
      metadata: markdownRemark(fileName: { eq: "metadata" }, fileRelativeDirectory: { eq: "" }) {
        ...MetadataFragment
      }
    }
  `);

  return (
    <>
      <div className={classNames.logo}>
        <Image
          className={classNames.logoImage}
          image={logo?.childImageSharp?.gatsbyImageData}
          alt="Big Apple Roll"
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
