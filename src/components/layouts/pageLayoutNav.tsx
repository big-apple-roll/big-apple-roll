import clsx from "clsx";
import { graphql, PageProps, useStaticQuery } from "gatsby";
import React from "react";

import IconButton from "src/components/buttons/iconButton";
import TextButton from "src/components/buttons/textButton";
import { IconName } from "src/components/icon";
import * as classNames from "src/components/layouts/pageLayoutNav.module.css";
import { formatDate } from "src/helpers/date";

type Props = {
  location: PageProps["location"];
  mobile?: boolean;
  onClick?: React.MouseEventHandler;
};

export default function PageLayoutNav(props: Props): React.JSX.Element | null {
  const { location, mobile, onClick } = props;

  const { metadata } = useStaticQuery<Queries.PageLayoutNavQuery>(graphql`
    query PageLayoutNav {
      metadata: markdownRemark(fileName: { eq: "metadata" }, fileRelativeDirectory: { eq: "" }) {
        ...MetadataFragment
      }
    }
  `);

  return (
    <nav
      className={clsx(classNames.nav, {
        [classNames.isMobile]: mobile,
      })}
    >
      <TextButton internalHref="/schedule/" location={location} onClick={onClick}>
        Schedule
      </TextButton>
      <TextButton internalHref="/hotel/" location={location} onClick={onClick}>
        Hotel
      </TextButton>
      <TextButton internalHref="/sponsors/" location={location} onClick={onClick}>
        Sponsors
      </TextButton>
      {metadata?.frontmatter?.start_date ? (
        <TextButton
          internalHref={`/gallery/${formatDate(metadata.frontmatter.start_date, { format: "year" })}/`}
          location={location}
          onClick={onClick}
        >
          Gallery
        </TextButton>
      ) : null}
      {/* <TextButton internalHref="/shop/" location={location} onClick={onClick}>
        Shop
      </TextButton> */}
      <IconButton
        iconName={IconName.Instagram}
        externalHref="https://www.instagram.com/bigappleroll/"
      />
    </nav>
  );
}
