import { graphql } from "gatsby";

export enum SponsorType {
  Presenting = "presenting",
  Supporting = "supporting",
  General = "general",
}

export const sponsorFragment = graphql`
  fragment SponsorFragment on MarkdownRemark {
    id
    frontmatter {
      title # string
      type # Either "presenting", "supporting", or "general"
      url # string
    }
    linkedFiles {
      ...FileFragment
    }
    linkedImages {
      ...ImageFragment
    }
    name
    relativeDirectory
  }
`;
