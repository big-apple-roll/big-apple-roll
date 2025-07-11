import { DateTime } from "luxon";

import { ShopProductCategory } from "src/fragments/shop/shopProductFragment";
import assertNever from "src/helpers/assertNever";
import { today } from "src/helpers/date/create";
import parseDate from "src/helpers/date/parseDate";

export const useShopTimeline = (allShopProducts: Queries.ShopQuery["allShopProducts"]) => {
  const { maxApparelCutoffDate, minApparelDiscountCutoffDate, maxTicketCutoffDate } =
    allShopProducts.nodes.reduce<{
      maxApparelCutoffDate: DateTime | null;
      minApparelDiscountCutoffDate: DateTime | null;
      maxTicketCutoffDate: DateTime | null;
    }>(
      (acc, shopProduct) => {
        const category = shopProduct.frontmatter?.category as
          | ShopProductCategory
          | null
          | undefined;

        if (category) {
          switch (category) {
            case ShopProductCategory.Apparel: {
              if (shopProduct.frontmatter?.cutoff_date) {
                const cutoffDate = parseDate(shopProduct.frontmatter.cutoff_date);
                if (!acc.maxApparelCutoffDate || cutoffDate > acc.maxApparelCutoffDate) {
                  acc.maxApparelCutoffDate = cutoffDate;
                }
              }

              const dateDiscounts = shopProduct.frontmatter?.date_discounts ?? [];
              dateDiscounts.forEach((discount) => {
                if (discount?.cutoff_date) {
                  const discountCutoffDate = parseDate(discount.cutoff_date);
                  if (
                    !acc.minApparelDiscountCutoffDate ||
                    discountCutoffDate < acc.minApparelDiscountCutoffDate
                  ) {
                    acc.minApparelDiscountCutoffDate = discountCutoffDate;
                  }
                }
              });
              break;
            }
            case ShopProductCategory.Ticket: {
              if (shopProduct.frontmatter?.cutoff_date) {
                const cutoffDate = parseDate(shopProduct.frontmatter.cutoff_date);
                if (!acc.maxTicketCutoffDate || cutoffDate > acc.maxTicketCutoffDate) {
                  acc.maxTicketCutoffDate = cutoffDate;
                }
              }
              break;
            }
            default: {
              assertNever(category);
              break;
            }
          }
        }

        return acc;
      },
      {
        maxApparelCutoffDate: null,
        minApparelDiscountCutoffDate: null,
        maxTicketCutoffDate: null,
      },
    );

  const showShopApparel = maxApparelCutoffDate ? today() < maxApparelCutoffDate : false;
  const shopApparelSaleCutoffDate =
    minApparelDiscountCutoffDate && today() < minApparelDiscountCutoffDate
      ? minApparelDiscountCutoffDate
      : null;
  const showShopTicket = maxTicketCutoffDate ? today() < maxTicketCutoffDate : false;

  return { showShopApparel, shopApparelSaleCutoffDate, showShopTicket };
};

const useTimeline = (
  allShopProducts: Queries.ShopQuery["allShopProducts"],
  hotel: Queries.HotelQuery["hotel"],
  index: Queries.IndexQuery["index"],
) => {
  const showHotel = (() => {
    const hotelCutoffDate = hotel?.frontmatter?.cutoff_date;
    if (!hotelCutoffDate) {
      return true;
    }

    return today() < parseDate(hotelCutoffDate);
  })();

  const showRegistration = (() => {
    const endDate = index?.frontmatter?.end_date;
    if (!endDate) {
      return false;
    }
    return today() <= parseDate(endDate);
  })();

  return {
    showHotel,
    showRegistration,
    ...useShopTimeline(allShopProducts),
  };
};

export default useTimeline;
