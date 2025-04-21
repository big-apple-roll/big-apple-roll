import { graphql, useStaticQuery } from "gatsby";
import React from "react";

type Props = {
  pageTitle?: string | null;
};

export default function HeadLayout(props: Props): React.JSX.Element {
  const { pageTitle } = props;

  const { index } = useStaticQuery<Queries.LayoutHeadQuery>(graphql`
    query LayoutHead {
      index: markdownRemark(relativePath: { eq: "index/index.md" }) {
        ...IndexFragment
      }
    }
  `);

  return (
    <>
      <title>{`${pageTitle ? `${pageTitle} - ` : ""}${index?.frontmatter?.title ?? ""}`}</title>
      <link rel="icon" href={index?.linkedImages?.[0]?.publicURL ?? ""} />
    </>
  );
}
