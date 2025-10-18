import { graphql, useStaticQuery } from "gatsby";
import React from "react";

import LinkButton from "src/components/buttons/linkButton";
import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import ShopNavigation from "src/components/shop/shopNavigation";
import ShopPrice from "src/components/shop/shopPrice";
import useShop, { validateDateDiscounts } from "src/components/shop/useShop";
import { useShopTimeline } from "src/components/timeline/useTimeline";
import { formatDate } from "src/helpers/date/format";
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
  const { shopApparelSaleCutoffDate } = useShopTimeline(allShopProducts);

  return (
    <>
      <ShopNavigation cartItemCount={cartItemCount} goToCart />
      <h1>Shop</h1>
      {shopApparelSaleCutoffDate ? (
        <h2>Lowest pricing on t-shirts until {formatDate(shopApparelSaleCutoffDate)}!</h2>
      ) : null}
      {allShopProducts.nodes.length === 0 ? (
        <div>
          The shop isn&apos;t open yet. Stay tuned while we design this year&apos;s apparel!
        </div>
      ) : null}
      <div className={classNames.shopProducts}>
        {allShopProducts.nodes.map((shopProductNode) => {
          if (!shopProductNode.name || !shopProductNode.frontmatter) {
            return null;
          }

          return (
            <div key={shopProductNode.id}>
              <LinkButton internalHref={shopProductNode.slug} noDecoration>
                <div className={classNames.shopProductImageContainer}>
                  <div className={classNames.shopProductImageContainer2}>
                    <Image
                      className={classNames.shopProductImage}
                      src={shopProductNode.linkedFiles?.[0] ?? shopProductNode.linkedImages?.[0]}
                      alt={shopProductNode.frontmatter.title}
                    />
                  </div>
                </div>
                <div>{shopProductNode.frontmatter.title}</div>
                <div>
                  <ShopPrice
                    price={shopProductNode.frontmatter.price ?? 0}
                    discountedPrice={
                      validateDateDiscounts(shopProductNode.frontmatter.date_discounts ?? [])[0]
                        ?.price
                    }
                  />
                </div>
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
