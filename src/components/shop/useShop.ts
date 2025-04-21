import { compact, sortBy } from "lodash";
import { useMemo } from "react";

import useAppSelector from "src/app/hooks/useAppSelector";
import selectCartEntries from "src/app/slices/cart/selectors/selectCartEntries";
import { CartEntry, CartEntryKey } from "src/app/slices/cart/types";
import parseDate from "src/helpers/date/parseDate";

export type CartItem = {
  key: CartEntryKey;
  cartEntry: CartEntry;
  shopProduct: Queries.ShopQuery["allShopProducts"]["nodes"][number];
  productPrice: number;
  totalUndiscountedPrice: number;
  totalDiscountedPrice: number;
};

type NullableQuantityDiscount = NonNullable<
  NonNullable<
    Queries.ShopQuery["allShopProducts"]["nodes"][number]["frontmatter"]
  >["quantity_discounts"]
>[number];

type QuantityDiscount = {
  [P in keyof NonNullable<NullableQuantityDiscount>]: NonNullable<
    NonNullable<NullableQuantityDiscount>[P]
  >;
};

type NullableDateDiscount = NonNullable<
  NonNullable<
    Queries.ShopQuery["allShopProducts"]["nodes"][number]["frontmatter"]
  >["date_discounts"]
>[number];

type DateDiscount = {
  [P in keyof NonNullable<NullableDateDiscount>]: NonNullable<NonNullable<NullableDateDiscount>[P]>;
};

export const validateDateDiscounts = (
  nullableDateDiscounts: ReadonlyArray<NullableDateDiscount> | null,
): Array<DateDiscount> => {
  const dateDiscounts = (nullableDateDiscounts ?? []).filter(
    (dateDiscount): dateDiscount is DateDiscount => {
      return !!dateDiscount?.cutoff_date && !!dateDiscount.price;
    },
  );

  const orderedDateDiscounts = sortBy(dateDiscounts, "price");

  const now = parseDate(new Date().toISOString());
  const validDateDiscounts = orderedDateDiscounts.filter((dateDiscount) => {
    return now < parseDate(dateDiscount.cutoff_date);
  });

  return validDateDiscounts;
};

const computePrice = (
  count: number,
  price: number,
  nullableQuantityDiscounts: ReadonlyArray<NullableQuantityDiscount> | null,
  nullableDateDiscounts: ReadonlyArray<NullableDateDiscount> | null,
): number => {
  const quantityDiscounts = (nullableQuantityDiscounts ?? []).filter(
    (quantityDiscount): quantityDiscount is QuantityDiscount => {
      return !!quantityDiscount?.count && !!quantityDiscount.price;
    },
  );

  if (quantityDiscounts.length) {
    const orderedQuantityDiscounts = sortBy(quantityDiscounts, "count");
    const quantityDiscount = orderedQuantityDiscounts.findLast(
      (discount) => count >= discount.count,
    );
    if (quantityDiscount) {
      return (
        quantityDiscount.price +
        computePrice(
          count - quantityDiscount.count,
          price,
          quantityDiscounts,
          nullableDateDiscounts,
        )
      );
    }
  }

  const dateDiscount = validateDateDiscounts(nullableDateDiscounts)[0];
  if (dateDiscount) {
    return count * dateDiscount.price;
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
            computePrice(cartEntry.count, shopProduct.frontmatter.price, null, null),
          ),
          totalDiscountedPrice: toFixedNumber(
            computePrice(
              cartEntry.count,
              shopProduct.frontmatter.price,
              shopProduct.frontmatter.quantity_discounts,
              shopProduct.frontmatter.date_discounts,
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
