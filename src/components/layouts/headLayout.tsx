import { graphql, useStaticQuery } from "gatsby";
import React from "react";

type Props = {
  pageTitle?: string | null;
};

export default function HeadLayout(props: Props): React.JSX.Element {
  const { pageTitle } = props;

  const { metadata } = useStaticQuery<Queries.LayoutHeadQuery>(graphql`
    query LayoutHead {
      metadata: markdownRemark(name: { eq: "metadata" }, relativeDirectory: { eq: "" }) {
        ...MetadataFragment
      }
    }
  `);

  return (
    <>
      <title>{`${pageTitle ? `${pageTitle} - ` : ""}${metadata?.frontmatter?.title ?? ""}`}</title>
    </>
  );
}
