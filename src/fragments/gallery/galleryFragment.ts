import { graphql } from "gatsby";

export const galleryFragment = graphql`
  fragment GalleryFragment on MarkdownRemark {
    id
    frontmatter {
      links
    }
    name
    relativeDirectory
    slug
  }
`;
