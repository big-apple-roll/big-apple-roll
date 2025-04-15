import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import getCartEntryKey from "src/app/slices/cart/helpers/getCartEntryKey";
import { CartEntry, CartEntryKey, CartState } from "src/app/slices/cart/types";

const initialState: CartState = {
  cartEntriesByKey: {},
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addCartEntry: (state, action: PayloadAction<Omit<CartEntry, "key">>) => {
      const key = getCartEntryKey(action.payload);
      state.cartEntriesByKey[key] = {
        key,
        ...action.payload,
        count: (state.cartEntriesByKey[key]?.count ?? 0) + action.payload.count,
      };
    },
    incrementCartEntry: (state, action: PayloadAction<CartEntryKey>) => {
      const cartEntry = state.cartEntriesByKey[action.payload];
      if (cartEntry) {
        cartEntry.count += 1;
      }
    },
    decrementCartEntry: (state, action: PayloadAction<CartEntryKey>) => {
      const cartEntry = state.cartEntriesByKey[action.payload];
      if (cartEntry && cartEntry.count > 1) {
        cartEntry.count -= 1;
      } else if (cartEntry) {
        delete state.cartEntriesByKey[action.payload];
      }
    },
    removeCartEntry: (state, action: PayloadAction<CartEntryKey>) => {
      delete state.cartEntriesByKey[action.payload];
    },
    removeAllCartEntries: (state) => {
      state.cartEntriesByKey = {};
    },
  },
});

export default cartSlice;
