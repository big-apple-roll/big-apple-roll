import { graphql } from "gatsby";

export const hotelFragment = graphql`
  fragment HotelFragment on MarkdownRemark {
    id
    frontmatter {
      link
    }
    html
  }
`;
