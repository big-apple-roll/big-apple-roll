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
      cutoff_date # Date
      quantity_discounts {
        count # Number
        price # Number (no currency symbol)
      }
      date_discounts {
        cutoff_date # Date
        price # Number (no currency symbol)
      }
      sizes # Array of strings
    }
    html
    linkedFiles {
      ...FileFragment
    }
    linkedImages {
      ...ImageFragment
    }
    name
    relativePath
    relativeDirectory
    slug
  }
`;
