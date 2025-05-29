import clsx from "clsx";
import { graphql, PageProps } from "gatsby";
import React, { useCallback, useMemo, useState } from "react";

import useAppDispatch from "src/app/hooks/useAppDispatch";
import cartSlice from "src/app/slices/cart/cartSlice";
import SurfaceButton, { SurfaceButtonColor } from "src/components/buttons/surfaceButton";
import TextButton from "src/components/buttons/textButton";
import useCallbackId from "src/components/hooks/useCallbackId";
import HTML from "src/components/html";
import Icon, { IconName } from "src/components/icon";
import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import ShopNavigation from "src/components/shop/shopNavigation";
import ShopPrice from "src/components/shop/shopPrice";
import useShop, { validateDateDiscounts } from "src/components/shop/useShop";
import { ShopProductButtonColor, ShopProductSizing } from "src/fragments/shop/shopProductFragment";
import { formatDate } from "src/helpers/date/format";
import parseDate from "src/helpers/date/parseDate";
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
      filter: { relativeDirectory: { eq: "shop" } }
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
  const [showSizingGuide, setShowSizingGuide] = useState(false);
  const [count, setCount] = useState(1);

  const needsSize = useMemo(() => {
    return !!shopProduct?.frontmatter?.sizes?.length;
  }, [shopProduct?.frontmatter?.sizes?.length]);

  const isCutoff = useMemo(() => {
    const cutoffDate = shopProduct?.frontmatter?.cutoff_date;
    if (!cutoffDate) {
      return false;
    }
    const now = parseDate(new Date().toISOString());
    return now > parseDate(cutoffDate);
  }, [shopProduct?.frontmatter?.cutoff_date]);

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

  const dateDiscounts = useMemo(() => {
    return validateDateDiscounts(shopProduct?.frontmatter?.date_discounts ?? []);
  }, [shopProduct?.frontmatter?.date_discounts]);

  const handleSelectSize = useCallbackId(setSize);

  const handleToggleSizingGuide = useCallback(() => {
    setShowSizingGuide((prevShowSizingGuide) => !prevShowSizingGuide);
  }, []);

  const handleSelectCount = useCallback((event: React.ChangeEvent) => {
    const { target } = event;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    setCount(parseInt(target.value, 10));
  }, []);

  const handleAddToCart = useCallback(() => {
    const shopProductName = shopProduct?.name;
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
  }, [count, dispatch, needsSize, shopProduct?.name, size]);

  if (!shopProduct) {
    return <></>;
  }

  return (
    <>
      <ShopNavigation cartItemCount={cartItemCount} goToShop goToCart />
      <h1>{shopProduct.frontmatter?.title}</h1>
      <div className={classNames.shopProduct}>
        <div className={classNames.shopProductImages}>
          {[...shopProduct.linkedFiles, ...shopProduct.linkedImages].map(
            (shopProductLinkedFile) => {
              return (
                <Image
                  key={shopProductLinkedFile.id}
                  className={classNames.shopProductImage}
                  src={shopProductLinkedFile}
                  alt={shopProduct.frontmatter?.title}
                />
              );
            },
          )}
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
              {shopProduct.frontmatter?.sizing &&
              isEnumValue(shopProduct.frontmatter.sizing, ShopProductSizing) ? (
                <>
                  <div className={classNames.sizingGuide}>
                    <TextButton onClick={handleToggleSizingGuide}>
                      <span className={classNames.sizingGuideText}>
                        <Icon
                          name={
                            showSizingGuide
                              ? IconName.KeyboardArrowDown
                              : IconName.KeyboardArrowRight
                          }
                        ></Icon>{" "}
                        Sizing guide
                      </span>
                    </TextButton>
                  </div>
                  {showSizingGuide ? (
                    <>
                      <table className={classNames.sizingGuideTable}>
                        <thead>
                          <tr>
                            <th></th>
                            <th>S</th>
                            <th>M</th>
                            <th>L</th>
                            <th>XL</th>
                            <th>XXL</th>
                          </tr>
                        </thead>
                        {switchOn(shopProduct.frontmatter.sizing, {
                          cotton: (
                            <tbody>
                              <tr>
                                <th>Body length</th>
                                <td>28</td>
                                <td>29</td>
                                <td>30</td>
                                <td>31</td>
                                <td>32</td>
                              </tr>
                              <tr>
                                <th>Body width</th>
                                <td>18</td>
                                <td>20</td>
                                <td>22</td>
                                <td>24</td>
                                <td>26</td>
                              </tr>
                              <tr>
                                <th>Sleeve length</th>
                                <td>15.62</td>
                                <td>17</td>
                                <td>18.5</td>
                                <td>20</td>
                                <td>21.5</td>
                              </tr>
                            </tbody>
                          ),
                          performance: (
                            <tbody>
                              <tr>
                                <th>Body length</th>
                                <td>28</td>
                                <td>29</td>
                                <td>30</td>
                                <td>31</td>
                                <td>32</td>
                              </tr>
                              <tr>
                                <th>Body width</th>
                                <td>18</td>
                                <td>20</td>
                                <td>22</td>
                                <td>24</td>
                                <td>26</td>
                              </tr>
                              <tr>
                                <th>Sleeve length</th>
                                <td>16.25</td>
                                <td>17.75</td>
                                <td>19</td>
                                <td>20.25</td>
                                <td>21.5</td>
                              </tr>
                            </tbody>
                          ),
                        })}
                      </table>
                      <dl>
                        <dt>Body length</dt>
                        <dd>
                          Lay garment flat (face down). Measure from center back neckline seam
                          straight down to bottom of the front hem.
                        </dd>
                        <dt>Body width</dt>
                        <dd>
                          Lay garment flat. 1&quot; below the armhole flat measure the garment
                          across the chest.
                        </dd>
                        <dt>Sleeve length</dt>
                        <dd>
                          Lay garment flat(face down). Measure from center back neck to outer edge
                          of shoulder seam, then along outer edge to sleeve end.
                        </dd>
                      </dl>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
          {(() => {
            if (shopProduct.frontmatter?.quantity_discounts?.length) {
              return (
                <div className={classNames.quantityDiscounts}>
                  <select
                    className={classNames.quantityDiscountsSelect}
                    onChange={handleSelectCount}
                  >
                    <option key={1} value={1}>
                      1 {shopProduct.frontmatter.title?.toLocaleLowerCase()} - $
                      {shopProduct.frontmatter.price}
                    </option>
                    {shopProduct.frontmatter.quantity_discounts.map((discount) => {
                      if (!discount) {
                        return null;
                      }

                      return (
                        <option key={discount.count} value={discount.count ?? 0}>
                          {discount.count}{" "}
                          {shopProduct.frontmatter?.title_plural?.toLocaleLowerCase()} - $
                          {discount.price}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            } else if (dateDiscounts.length) {
              return (
                <>
                  <div className={classNames.dateDiscounts}>
                    {dateDiscounts.map((discount) => {
                      return (
                        <React.Fragment key={discount.cutoff_date}>
                          <div>${discount.price}</div>
                          <div>
                            If ordered before{" "}
                            {formatDate(discount.cutoff_date, { format: "short" })}
                          </div>
                        </React.Fragment>
                      );
                    })}
                    {/* 
                    <div>${shopProduct.frontmatter?.price}</div>
                    <div>
                      {shopProduct.frontmatter?.cutoff_date ? (
                        <>
                          If ordered before{" "}
                          {formatDate(shopProduct.frontmatter.cutoff_date, { format: "short" })}
                        </>
                      ) : (
                        <>
                          If ordered on or after{" "}
                          {formatDate(dateDiscounts[dateDiscounts.length - 1].cutoff_date, {
                            format: "short",
                          })}
                        </>
                      )}
                    </div> */}
                  </div>
                  <div>
                    <ShopPrice
                      price={shopProduct.frontmatter?.price ?? 0}
                      discountedPrice={dateDiscounts[0].price}
                    />
                  </div>
                </>
              );
            }

            return <div>${shopProduct.frontmatter?.price}</div>;
          })()}
          {isCutoff ? <div className={classNames.cutoffClosed}>Orders are closed</div> : null}
          <div>
            <SurfaceButton
              internalHref="/shop/cart/"
              color={buttonColor}
              disabled={(needsSize && !size) || isCutoff}
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
