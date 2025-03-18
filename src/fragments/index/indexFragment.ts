import { graphql } from "gatsby";

export const indexFragment = graphql`
  fragment IndexFragment on MarkdownRemark {
    id
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
      ...FileFragment
    }
    linkedImages {
      ...ImageFragment
    }
    name
    relativePath
    relativeDirectory
    slug
  }
`;
