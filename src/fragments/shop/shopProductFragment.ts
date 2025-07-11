import { graphql } from "gatsby";

export enum ShopProductButtonColor {
  Green = "green",
  Orange = "orange",
  Blue = "blue",
}

export enum ShopProductSizing {
  Cotton = "cotton",
  Performance = "performance",
}

export enum ShopProductCategory {
  Apparel = "apparel",
  Ticket = "ticket",
}

export const shopProductFragment = graphql`
  fragment ShopProductFragment on MarkdownRemark {
    id
    frontmatter {
      title
      title_plural
      button_color # Either "green", "orange", or "blue"
      category # Either "apparel" or "ticket"
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
      sizing # Either "cotton"
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
