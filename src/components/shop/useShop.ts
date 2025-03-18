import { compact, sortBy } from "lodash";
import { useMemo } from "react";

import useAppSelector from "src/app/hooks/useAppSelector";
import selectCartEntries from "src/app/slices/cart/selectors/selectCartEntries";
import { CartEntry, CartEntryKey } from "src/app/slices/cart/types";

export type CartItem = {
  key: CartEntryKey;
  cartEntry: CartEntry;
  shopProduct: Queries.ShopQuery["allShopProducts"]["nodes"][number];
  productPrice: number;
  totalUndiscountedPrice: number;
  totalDiscountedPrice: number;
};

type NullableDiscount = NonNullable<
  NonNullable<Queries.ShopQuery["allShopProducts"]["nodes"][number]["frontmatter"]>["discounts"]
>[number];

type Discount = {
  [P in keyof NonNullable<NullableDiscount>]: NonNullable<NonNullable<NullableDiscount>[P]>;
};

const computePrice = (
  count: number,
  price: number,
  nullableDiscounts: ReadonlyArray<NullableDiscount> | null,
): number => {
  const discounts = (nullableDiscounts ?? []).filter((discount): discount is Discount => {
    return !!discount?.count && !!discount.price;
  });

  if (discounts.length) {
    const orderedDiscounts = sortBy(discounts, "count");
    const discount = orderedDiscounts.findLast((discount) => count >= discount.count);
    if (discount) {
      return discount.price + computePrice(count - discount.count, price, discounts);
    }
  }

  return count * price;
};

const toFixedNumber = (number: number): number => {
  return parseFloat(number.toFixed(2));
};

const useShop = (allShopProducts: Queries.ShopQuery["allShopProducts"]) => {
  const cartEntries = useAppSelector(selectCartEntries);

  const cartItems = useMemo(() => {
    const shopProductsByName = allShopProducts.nodes.reduce<
      Record<string, Queries.ShopQuery["allShopProducts"]["nodes"][number]>
    >((acc, shopItemNode) => {
      if (!shopItemNode.name) {
        return acc;
      }

      return {
        ...acc,
        [shopItemNode.name]: shopItemNode,
      };
    }, {});

    return compact(
      cartEntries.map((cartEntry): CartItem | null => {
        const shopProduct = shopProductsByName[cartEntry.name];
        if (
          !shopProduct ||
          !shopProduct.frontmatter?.price ||
          (shopProduct.frontmatter?.sizes &&
            !shopProduct.frontmatter.sizes.includes(cartEntry.size))
        ) {
          return null;
        }

        return {
          key: cartEntry.key,
          cartEntry,
          shopProduct,
          productPrice: toFixedNumber(shopProduct.frontmatter.price),
          totalUndiscountedPrice: toFixedNumber(
            computePrice(cartEntry.count, shopProduct.frontmatter.price, null),
          ),
          totalDiscountedPrice: toFixedNumber(
            computePrice(
              cartEntry.count,
              shopProduct.frontmatter.price,
              shopProduct.frontmatter.discounts,
            ),
          ),
        };
      }),
    );
  }, [allShopProducts.nodes, cartEntries]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((acc, cartItem) => {
      return acc + cartItem.cartEntry.count;
    }, 0);
  }, [cartItems]);

  const cartTotalUndiscountedPrice = useMemo(() => {
    return cartItems.reduce((acc, cartItem) => {
      return toFixedNumber(acc + cartItem.totalUndiscountedPrice);
    }, 0);
  }, [cartItems]);

  const cartTotalDiscountedPrice = useMemo(() => {
    return cartItems.reduce((acc, cartItem) => {
      return toFixedNumber(acc + cartItem.totalDiscountedPrice);
    }, 0);
  }, [cartItems]);

  return {
    cartItems,
    cartItemCount,
    cartTotalUndiscountedPrice,
    cartTotalDiscountedPrice,
  };
};

export default useShop;
