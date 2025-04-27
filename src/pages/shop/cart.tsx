import { PayPalButtonCreateOrder, PayPalButtonOnApprove } from "@paypal/paypal-js";
import {
  PayPalScriptProvider,
  PayPalButtons,
  ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import { graphql, useStaticQuery } from "gatsby";
import React, { useCallback, useMemo, useState } from "react";

import useAppDispatch from "src/app/hooks/useAppDispatch";
import cartSlice from "src/app/slices/cart/cartSlice";
import { CartEntryKey } from "src/app/slices/cart/types";
import LinkButton from "src/components/buttons/linkButton";
import TextButton from "src/components/buttons/textButton";
import useCallbackId from "src/components/hooks/useCallbackId";
import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import ShopCounter from "src/components/shop/shopCounter";
import ShopNavigation from "src/components/shop/shopNavigation";
import ShopPrice from "src/components/shop/shopPrice";
import useShop, { CartItem } from "src/components/shop/useShop";
import * as classNames from "src/pages/shop/cart.module.css";

// Doc: https://developer.paypal.com/sdk/js/configuration/
const PAYPAL_OPTIONS: ReactPayPalScriptOptions = {
  clientId: process.env.GATSBY_PAYPAL_CLIENT_ID ?? "",
  currency: "USD",
  intent: "capture",
  components: "buttons,applepay",
  disableFunding: "paylater",
};

export default function Cart(): React.JSX.Element {
  const { allShopProducts } = useStaticQuery<Queries.CartQuery>(graphql`
    query Cart {
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

  const dispatch = useAppDispatch();

  const { cartItems, cartItemCount, cartTotalUndiscountedPrice, cartTotalDiscountedPrice } =
    useShop(allShopProducts);

  const [confirmed, setConfirmed] = useState(false);

  const handleIncrementCartItem = useCallback(
    (cartItem: CartItem) => {
      dispatch(cartSlice.actions.incrementCartEntry(cartItem.key));
    },
    [dispatch],
  );

  const handleDecrementCartItem = useCallback(
    (cartItem: CartItem) => {
      dispatch(cartSlice.actions.decrementCartEntry(cartItem.key));
    },
    [dispatch],
  );

  const handleRemoveCartItem = useCallbackId(
    useCallback(
      (id) => {
        dispatch(cartSlice.actions.removeCartEntry(id as CartEntryKey));
      },
      [dispatch],
    ),
  );

  const handleCreateOrder = useMemo((): PayPalButtonCreateOrder => {
    return async (data, actions) => {
      return actions.order.create({
        intent: "CAPTURE",
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
        purchase_units: [
          {
            items: cartItems.map((cartItem) => {
              return {
                name: `${cartItem.shopProduct.frontmatter?.title ?? cartItem.cartEntry.name} ${cartItem.cartEntry.size ?? ""}`,
                description: `${cartItem.cartEntry.name} ${cartItem.cartEntry.size ?? ""}`,
                quantity: cartItem.cartEntry.count.toString(),
                unit_amount: {
                  currency_code: "USD",
                  value: cartItem.productPrice.toString(),
                },
                category: "DIGITAL_GOODS",
              };
            }),
            amount: {
              currency_code: "USD",
              value: cartTotalDiscountedPrice.toString(),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: cartTotalUndiscountedPrice.toString(),
                },
                discount: {
                  currency_code: "USD",
                  value: (cartTotalUndiscountedPrice - cartTotalDiscountedPrice).toFixed(2),
                },
              },
            },
          },
        ],
      });
    };
  }, [cartItems, cartTotalDiscountedPrice, cartTotalUndiscountedPrice]);

  const handleApproveOrder = useMemo((): PayPalButtonOnApprove => {
    return async (data, actions) => {
      await actions.order?.capture();
      dispatch(cartSlice.actions.removeAllCartEntries());
      setConfirmed(true);
    };
  }, [dispatch]);

  return (
    <>
      <ShopNavigation cartItemCount={cartItemCount} goToShop />
      <h1>Cart</h1>
      <div className={classNames.cart}>
        {confirmed ? (
          <div>
            <p>Thank you for your support!</p>
            <p>
              All items must be must be picked-up during registration on{" "}
              <LinkButton internalHref="/schedule/friday/registration-and-expo/">Friday</LinkButton>{" "}
              or{" "}
              <LinkButton internalHref="/schedule/saturday/registration-and-expo/">
                Saturday
              </LinkButton>
              .
            </p>
          </div>
        ) : (
          <>
            <div className={classNames.cartItems}>
              {cartItems.map((cartItem) => {
                return (
                  <React.Fragment key={cartItem.key}>
                    <div>
                      <LinkButton internalHref={cartItem.shopProduct.slug} noDecoration>
                        <Image
                          className={classNames.cartItemImage}
                          src={
                            cartItem.shopProduct.linkedFiles[0] ??
                            cartItem.shopProduct.linkedImages[0]
                          }
                          alt={cartItem.shopProduct.frontmatter?.title}
                        />
                      </LinkButton>
                    </div>
                    <div className={classNames.cartItemDetails}>
                      <div>
                        <LinkButton internalHref={cartItem.shopProduct.slug} noDecoration>
                          <strong>{cartItem.shopProduct.frontmatter?.title}</strong>
                        </LinkButton>{" "}
                        - <ShopPrice price={cartItem.productPrice}></ShopPrice>
                      </div>
                      {cartItem.cartEntry.size ? <div>{cartItem.cartEntry.size}</div> : null}
                      <div>
                        <ShopPrice
                          price={cartItem.totalUndiscountedPrice}
                          discountedPrice={cartItem.totalDiscountedPrice}
                        />
                      </div>
                      <div>
                        <ShopCounter
                          cartItem={cartItem}
                          onIncrement={handleIncrementCartItem}
                          onDecrement={handleDecrementCartItem}
                        ></ShopCounter>
                      </div>
                    </div>
                    <div>
                      <TextButton id={cartItem.key} onClick={handleRemoveCartItem}>
                        Remove
                      </TextButton>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div>
              <h2 className={classNames.summary}>Order summary</h2>
              <div className={classNames.total}>
                <span>Total</span>
                <span>${cartTotalDiscountedPrice}</span>
              </div>
              <div className={classNames.paypal}>
                <PayPalScriptProvider options={PAYPAL_OPTIONS}>
                  <PayPalButtons createOrder={handleCreateOrder} onApprove={handleApproveOrder} />
                </PayPalScriptProvider>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Cart" />;
}
