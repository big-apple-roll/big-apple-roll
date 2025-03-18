import { graphql } from "gatsby";

export enum ShopProductButtonColor {
  Green = "green",
  Orange = "orange",
  Blue = "blue",
}

export const shopProductFragment = graphql`
  fragment ShopProductFragment on MarkdownRemark {
    id
    frontmatter {
      title
      title_plural
      button_color # Either "green", "orange", or "blue"
      order_index # Number to order items by
      price # Number (no currency symbol)
      discounts {
        count # Number
        price # Number (no currency symbol)
      }
      sizes # Array of strings
    }
    html
    linkedFiles {
      ...ImageFragment
    }
    name
    relativeDirectory
    slug
  }
`;
