import * as classNames from "src/pages/hotel.module.css";

import { graphql, useStaticQuery } from "gatsby";
import React from "react";

import HTML from "src/components/html";
import HeadLayout from "src/components/layouts/headLayout";

export default function Hotel(): React.JSX.Element {
  const { hotel } = useStaticQuery<Queries.HotelQuery>(graphql`
    query Hotel {
      hotel: markdownRemark(name: { eq: "hotel" }, relativeDirectory: { eq: "hotel" }) {
        ...HotelFragment
      }
    }
  `);

  return (
    <>
      <HTML html={hotel?.html}></HTML>
      <iframe src={hotel?.frontmatter?.map ?? undefined} className={classNames.frame} />
    </>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Hotel" />;
}
