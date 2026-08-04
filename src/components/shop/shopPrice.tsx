import clsx from "clsx";
import React from "react";

import * as classNames from "src/components/shop/shopPrice.module.css";

type Props = {
  price: number;
  discountedPrice?: number;
  donationPrices?: number[];
};

export default function ShopPrice(props: Props): React.JSX.Element | null {
  const { price, discountedPrice, donationPrices } = props;

  const hasDiscount = discountedPrice !== undefined && discountedPrice !== price;

  return (
    <span
      className={clsx(classNames.shopPrice, {
        [classNames.hasDiscount]: hasDiscount,
      })}
    >
      {donationPrices?.length ? (
        <span className={classNames.shopPriceOriginal}>
          {donationPrices.map((price) => `$${price}`).join(", ")}
        </span>
      ) : (
        <>
          <span className={classNames.shopPriceOriginal}>${price}</span>
          {hasDiscount ? <span>${discountedPrice}</span> : null}
        </>
      )}
    </span>
  );
}
