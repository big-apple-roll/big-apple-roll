import { graphql, useStaticQuery } from "gatsby";
import React from "react";

import LinkButton from "src/components/buttons/linkButton";
import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import ShopNavigation from "src/components/shop/shopNavigation";
import useShop from "src/components/shop/useShop";
import * as classNames from "src/pages/shop.module.css";

export default function Shop(): React.JSX.Element {
  const { allShopProducts } = useStaticQuery<Queries.ShopQuery>(graphql`
    query Shop {
      allShopProducts: allMarkdownRemark(
        sort: { frontmatter: { order_index: ASC } }
        filter: { relativeDirectory: { eq: "shop" } }
      ) {
        nodes {
          ...ShopProductFragment
        }
      }
    }
  `);

  const { cartItemCount } = useShop(allShopProducts);

  console.log("DEBUG: shop", { allShopProducts }, JSON.stringify({}, null, 2));

  return (
    <>
      <ShopNavigation cartItemCount={cartItemCount} goToCart />
      <h1>Shop</h1>
      <div className={classNames.shopProducts}>
        {allShopProducts.nodes.map((shopProductNode) => {
          if (!shopProductNode.name || !shopProductNode.frontmatter) {
            return null;
          }

          return (
            <div key={shopProductNode.id}>
              <LinkButton internalHref={shopProductNode.slug} noDecoration>
                <Image
                  className={classNames.shopProductImage}
                  src={shopProductNode.linkedFiles?.[0] ?? shopProductNode.linkedImages?.[0]}
                  alt={shopProductNode.frontmatter.title}
                />
                <div>{shopProductNode.frontmatter.title}</div>
                <div>${shopProductNode.frontmatter.price}</div>
              </LinkButton>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Shop" />;
}
