import { graphql } from "gatsby";

export const fileFragment = graphql`
  fragment FileFragment on File {
    id
    name
    publicURL
    relativePath
    relativeDirectory
  }
`;
