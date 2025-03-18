import { graphql } from "gatsby";

export enum ScheduleEventDifficulty {
  Easy = "easy",
  Casual = "casual",
  Moderate = "moderate",
  Advanced = "advanced",
}

export const scheduleEventFragment = graphql`
  fragment ScheduleEventFragment on MarkdownRemark {
    id
    fileName
    fileRelativeDirectory
    html
    slug
    frontmatter {
      title
      date # Format: YYYY-MM-DD HH:mm:ss
      teaser # boolean
      difficulty # Either "easy", "casual", "moderate", or "advanced"
      location # string, optional
      start # string, optional
      start_map # Link to google maps, optional
      end # string, optional
      leader # string, optional
      distance # string, optional
      highlights # string, optional
      route_map # Link to google maps, optional
    }
  }
`;
