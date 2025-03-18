import clsx from "clsx";
import { graphql, PageProps } from "gatsby";
import React, { useCallback, useMemo, useState } from "react";

import useAppDispatch from "src/app/hooks/useAppDispatch";
import cartSlice from "src/app/slices/cart/cartSlice";
import SurfaceButton, { SurfaceButtonColor } from "src/components/buttons/surfaceButton";
import useCallbackId from "src/components/hooks/useCallbackId";
import HTML from "src/components/html";
import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import ShopNavigation from "src/components/shop/shopNavigation";
import useShop from "src/components/shop/useShop";
import { ShopProductButtonColor } from "src/fragments/shop/shopProductFragment";
import isEnumValue from "src/helpers/isEnumValue";
import switchOn from "src/helpers/switchOn";
import * as classNames from "src/templates/shopProductTemplate.module.css";

export type ShopProductTemplateContext = {
  shopProductId: string;
};

export const query = graphql`
  query ShopProductTemplate($shopProductId: String!) {
    allShopProducts: allMarkdownRemark(
      sort: { frontmatter: { order_index: ASC } }
      filter: { fileRelativeDirectory: { eq: "shop" } }
    ) {
      nodes {
        ...ShopProductFragment
      }
    }
    shopProduct: markdownRemark(id: { eq: $shopProductId }) {
      ...ShopProductFragment
    }
  }
`;

export default function ShopProductTemplate(
  props: PageProps<Queries.ShopProductTemplateQuery, ShopProductTemplateContext>,
): React.JSX.Element {
  const { data } = props;
  const { allShopProducts, shopProduct } = data;

  const dispatch = useAppDispatch();

  const { cartItemCount } = useShop(allShopProducts);

  const [size, setSize] = useState<string | null>(null);
  const [count, setCount] = useState(1);

  const needsSize = useMemo(() => {
    return !!shopProduct?.frontmatter?.sizes?.length;
  }, [shopProduct?.frontmatter?.sizes?.length]);

  const buttonColor = useMemo((): SurfaceButtonColor | undefined => {
    if (
      shopProduct?.frontmatter?.button_color &&
      isEnumValue(shopProduct.frontmatter.button_color, ShopProductButtonColor)
    ) {
      return switchOn(shopProduct.frontmatter.button_color, {
        [ShopProductButtonColor.Orange]: "accent1",
        [ShopProductButtonColor.Green]: "accent2",
        [ShopProductButtonColor.Blue]: "accent3",
      });
    }
    return undefined;
  }, [shopProduct?.frontmatter?.button_color]);

  const handleSelectSize = useCallbackId(setSize);

  const handleSelectCount = useCallback((event: React.ChangeEvent) => {
    const { target } = event;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    setCount(parseInt(target.value, 10));
  }, []);

  const handleAddToCart = useCallback(() => {
    const shopProductName = shopProduct?.fileName;
    if (!shopProductName || (needsSize && !size)) {
      return;
    }

    dispatch(
      cartSlice.actions.addCartEntry({
        name: shopProductName,
        size: needsSize ? size : null,
        count,
      }),
    );
  }, [count, dispatch, needsSize, shopProduct?.fileName, size]);

  if (!shopProduct) {
    return <></>;
  }

  return (
    <>
      <ShopNavigation cartItemCount={cartItemCount} goToShop goToCart />
      <h1>{shopProduct.frontmatter?.title}</h1>
      <div className={classNames.shopProduct}>
        <div className={classNames.shopProductImages}>
          {shopProduct.linkedFiles.map((shopProductLinkedFile) => {
            return (
              <Image
                key={shopProductLinkedFile.id}
                className={classNames.shopProductImage}
                image={shopProductLinkedFile.childImageSharp?.gatsbyImageData}
                alt={shopProduct.frontmatter?.title}
              />
            );
          })}
        </div>
        <div className={classNames.shopProductDetails}>
          <HTML html={shopProduct.html} />
          {needsSize ? (
            <div>
              <div className={classNames.sizeLabel}>Size:</div>
              <div className={classNames.sizes}>
                {shopProduct.frontmatter?.sizes?.map((shopProductSize) => {
                  return (
                    <button
                      key={shopProductSize}
                      className={clsx(classNames.size, {
                        [classNames.isSelected]: size === shopProductSize,
                      })}
                      data-id={shopProductSize}
                      onClick={handleSelectSize}
                    >
                      {shopProductSize}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {shopProduct.frontmatter?.discounts?.length ? (
            <div className={classNames.discounts}>
              <select className={classNames.discountsSelect} onChange={handleSelectCount}>
                <option key={1} value={1}>
                  1 {shopProduct.frontmatter.title?.toLocaleLowerCase()} - $
                  {shopProduct.frontmatter.price}
                </option>
                {shopProduct.frontmatter.discounts.map((discount) => {
                  if (!discount) {
                    return null;
                  }

                  return (
                    <option key={discount.count} value={discount.count ?? 0}>
                      {discount.count} {shopProduct.frontmatter?.title_plural?.toLocaleLowerCase()}{" "}
                      - ${discount.price}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div>${shopProduct.frontmatter?.price}</div>
          )}
          <div>
            <SurfaceButton
              internalHref="/shop/cart/"
              color={buttonColor}
              disabled={needsSize && !size}
              onClick={handleAddToCart}
            >
              Add to cart
            </SurfaceButton>
          </div>
        </div>
      </div>
    </>
  );
}

export function Head(
  props: PageProps<Queries.ShopProductTemplateQuery, ShopProductTemplateContext>,
): React.JSX.Element {
  const { data } = props;
  const { shopProduct } = data;
  return <HeadLayout pageTitle={shopProduct?.frontmatter?.title} />;
}
