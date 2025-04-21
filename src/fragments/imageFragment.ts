import { graphql } from "gatsby";

export const imageFragment = graphql`
  fragment ImageFragment on File {
    id
    childImageSharp {
      gatsbyImageData(placeholder: NONE)
    }
    name
    publicURL
    relativePath
    relativeDirectory
  }
`;
