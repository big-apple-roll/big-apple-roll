import "src/pages/hotel.css";

import { graphql, useStaticQuery } from "gatsby";
import React from "react";

import SurfaceButton from "src/components/buttons/surfaceButton";
import HTML from "src/components/html";
import HeadLayout from "src/components/layouts/headLayout";
import * as classNames from "src/pages/hotel.module.css";

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
      <HTML className="hotel-content" html={hotel?.html}></HTML>
      <div className={classNames.buttonContainer}>
        <SurfaceButton externalHref={hotel?.frontmatter?.link}>Book your room online</SurfaceButton>
      </div>
    </>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Hotel" />;
}
