import { graphql } from "gatsby";

export const hotelFragment = graphql`
  fragment HotelFragment on MarkdownRemark {
    id
    frontmatter {
      link
      cutoff_date # Date
    }
    html
  }
`;
