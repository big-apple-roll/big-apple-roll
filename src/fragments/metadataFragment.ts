import { graphql } from "gatsby";

export const metadataFragment = graphql`
  fragment MetadataFragment on MarkdownRemark {
    id
    fileName
    fileRelativeDirectory
    frontmatter {
      title
      start_date
      end_date
      next_year {
        start_date
        end_date
      }
    }
  }
`;
