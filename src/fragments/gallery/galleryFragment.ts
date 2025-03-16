import { graphql } from "gatsby";

export const galleryFragment = graphql`
  fragment GalleryFragment on MarkdownRemark {
    id
    fileName
    fileRelativeDirectory
    slug
    frontmatter {
      links
    }
  }
`;
