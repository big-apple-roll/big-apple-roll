import clsx from "clsx";
import { graphql, useStaticQuery } from "gatsby";
import React from "react";

import SurfaceButton from "src/components/buttons/surfaceButton";
import HTML from "src/components/html";
import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import useTimeline from "src/components/timeline/useTimeline";
import { formatDate, formatDateInterval } from "src/helpers/date/format";
import parseDate from "src/helpers/date/parseDate";
import * as classNames from "src/pages/index.module.css";

export default function Index() {
  const { allShopProducts, hotel, index } = useStaticQuery<Queries.IndexQuery>(graphql`
    query Index {
      allShopProducts: allMarkdownRemark(
        sort: { frontmatter: { order_index: ASC } }
        filter: { relativeDirectory: { eq: "shop" } }
      ) {
        nodes {
          ...ShopProductFragment
        }
      }
      hotel: markdownRemark(relativePath: { eq: "hotel/hotel.md" }) {
        ...HotelFragment
      }
      index: markdownRemark(relativePath: { eq: "index/index.md" }) {
        ...IndexFragment
      }
    }
  `);

  const {
    showShopApparel,
    shopApparelSaleCutoffDate,
    showShopTicket,
    showHotel,
    showRegistration,
  } = useTimeline(allShopProducts, hotel, index);

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
            {formatDateInterval(
              parseDate(index.frontmatter.start_date),
              parseDate(index.frontmatter.end_date),
            )}
          </div>
          {index?.frontmatter?.next_year?.start_date &&
          index.frontmatter.next_year.end_date &&
          index.frontmatter.next_year.start_date !== index.frontmatter.start_date ? (
            <div>
              Join us next year:{" "}
              {formatDateInterval(
                parseDate(index.frontmatter.next_year.start_date),
                parseDate(index.frontmatter.next_year.end_date),
              )}
            </div>
          ) : null}
        </h2>
      ) : null}
      <div className={classNames.menu}>
        {showHotel ? <SurfaceButton internalHref="/hotel/">Book a room</SurfaceButton> : null}
        {showShopApparel ? (
          <SurfaceButton internalHref="/shop/">
            Buy a t-shirt{" "}
            {shopApparelSaleCutoffDate
              ? `Lowest pricing until ${formatDate(shopApparelSaleCutoffDate)}!`
              : null}
          </SurfaceButton>
        ) : null}
        {showRegistration ? (
          <SurfaceButton internalHref="https://forms.gle/FAyavPYAUDXMEfqD6">Register</SurfaceButton>
        ) : null}
        {showShopTicket ? (
          <SurfaceButton internalHref="/shop/saturday-party-ticket/">
            Get Saturday night party tickets
          </SurfaceButton>
        ) : null}
        {showShopTicket ? (
          <SurfaceButton internalHref="/shop/raffle-ticket/">Get raffle tickets</SurfaceButton>
        ) : null}
      </div>
      <HTML html={index?.html} />
    </>
  );
}

export function Head() {
  return <HeadLayout />;
}
