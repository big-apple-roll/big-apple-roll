import { graphql } from "gatsby";

export const indexFragment = graphql`
  fragment IndexFragment on MarkdownRemark {
    id
    fileName
    fileRelativeDirectory
    slug
    frontmatter {
      title
      start_date
      end_date
      next_year {
        start_date
        end_date
      }
    }
    html
    linkedFiles {
      ...ImageFragment
    }
  }
`;
