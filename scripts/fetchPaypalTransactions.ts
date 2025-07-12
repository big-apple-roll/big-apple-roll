#!/usr/bin/env yarn ts-node
/* eslint-disable no-console */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

import { writeToBuffer } from "@fast-csv/format";
import dotenv, { DotenvConfigOptions } from "dotenv";
import { partition, sortBy } from "lodash";
import { ClientCredentials } from "simple-oauth2";

// TODO:
// - fetch all months
// - convert to csv
// - generate summary report

type APIOptions = {
  host: string;
  accessToken: string;
};

type PaypalTransactionDetail = {
  transaction_info: {
    transaction_initiation_date: string;
    transaction_amount: {
      value: string;
    };
  };
  payer_info: {
    email_address: string;
    payer_name: {
      given_name: string;
      surname: string;
      alternate_full_name: string;
    };
  };
  cart_info: {
    item_details?: [
      {
        item_name: string;
        item_description: string;
        item_quantity: string;
      },
    ];
  };
};

type PaypalTransactionResponse = {
  transaction_details: Array<PaypalTransactionDetail>;
  page: number;
  total_pages: number;
};

type Transaction = {
  date: string;
  customer_name: string;
  customer_email: string;
  item_name: string;
  item_description: string;
  item_quantity: number;
};

type CountsByName = Record<
  string,
  {
    countsBySize: Record<string, number>;
  }
>;

type Summary = {
  name: string;
  [size: string]: string | number;
};

const TICKET_TRANSACTIONS_FILE = "./exports/ticket_transactions.csv";
const SHIRT_TRANSACTIONS_FILE = "./exports/shirt_transactions.csv";
const SUMMARY_FILE = "./exports/summary.csv";

const getMonthlyTransactions = async (
  options: {
    year: number;
    month: number; // 0 indexed
  },
  apiOptions: APIOptions,
): Promise<Array<PaypalTransactionDetail>> => {
  const startDate = new Date(options.year, options.month, 1);
  const endDate = new Date(options.year, options.month + 1, 0, 23, 59, 59, 999);

  // https://developer.paypal.com/docs/api/transaction-search/v1/
  const transactionUrl = new URL(apiOptions.host);
  transactionUrl.pathname = "/v1/reporting/transactions";
  transactionUrl.searchParams.set("start_date", startDate.toISOString());
  transactionUrl.searchParams.set("end_date", endDate.toISOString());
  transactionUrl.searchParams.set("transaction_status", "S");
  transactionUrl.searchParams.set("fields", "transaction_info,payer_info,cart_info");

  let page = 0;
  let totalPages = 1;
  const paypalTransactionDetails: Array<PaypalTransactionDetail> = [];
  do {
    transactionUrl.searchParams.set("page", `${++page}`);

    const resp = await fetch(transactionUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiOptions.accessToken}`,
      },
    });

    const text = await resp.text();
    const paypalTransactionResponse = JSON.parse(text) as PaypalTransactionResponse;

    totalPages = paypalTransactionResponse.total_pages;
    paypalTransactionDetails.push(...paypalTransactionResponse.transaction_details);
  } while (page < totalPages);

  return paypalTransactionDetails;
};

const filterBARPaypalTransactionDetails = (
  transactions: Array<PaypalTransactionDetail>,
): Array<PaypalTransactionDetail> => {
  return transactions.filter((transaction) => {
    return transaction.cart_info.item_details?.some((itemDetail) => {
      return itemDetail.item_description.startsWith("bar_");
    });
  });
};

const filterRefundedPaypalTransactionDetails = (
  transactions: Array<PaypalTransactionDetail>,
): Array<PaypalTransactionDetail> => {
  const [refundTransactions, paymentTransactions] = partition(transactions, (transaction) => {
    const amount = parseFloat(transaction.transaction_info.transaction_amount.value);
    return amount < 0;
  });

  for (const refundTransaction of refundTransactions) {
    const refundAmount = parseFloat(refundTransaction.transaction_info.transaction_amount.value);

    const paymentTransactionIndex = paymentTransactions.findIndex((paymentTransaction) => {
      const paymentAmount = parseFloat(
        paymentTransaction.transaction_info.transaction_amount.value,
      );

      return (
        paymentAmount === -1 * refundAmount &&
        paymentTransaction.payer_info.email_address ===
          refundTransaction.payer_info.email_address &&
        paymentTransaction.payer_info.payer_name.alternate_full_name ===
          refundTransaction.payer_info.payer_name.alternate_full_name
      );
    });
    if (paymentTransactionIndex !== -1) {
      paymentTransactions.splice(paymentTransactionIndex, 1);
    }
  }

  return paymentTransactions;
};

const mapPaypalTransactionDetailToTransaction = (
  paypalTransactionDetail: PaypalTransactionDetail,
): Array<Transaction> => {
  return (paypalTransactionDetail.cart_info.item_details ?? []).map((itemDetail): Transaction => {
    return {
      date: paypalTransactionDetail.transaction_info.transaction_initiation_date,
      customer_name: `${paypalTransactionDetail.payer_info.payer_name.alternate_full_name}`,
      customer_email: paypalTransactionDetail.payer_info.email_address,
      item_name: itemDetail.item_name,
      item_description: itemDetail.item_description,
      item_quantity: parseInt(itemDetail.item_quantity, 10),
    };
  });
};

const partitionTransactions = (transactions: Array<Transaction>) => {
  const [ticketTransactions, shirtTransactions] = partition(transactions, (transaction) => {
    return /ticket/.test(parseItemDescription(transaction.item_description).name);
  });
  return { ticketTransactions, shirtTransactions };
};

const parseItemDescription = (itemDescription: string) => {
  const result = itemDescription.match(/bar_(?<name>.+)_(?<size>.*)/);
  const name = result?.groups?.["name"] || "<unknown>";
  const size = result?.groups?.["size"] || "<unknown>";
  return { name, size };
};

const parseShopItemName = (shopItem: string): string => {
  return shopItem.substring(0, shopItem.lastIndexOf("."));
};

const parseShopItemOrderIndex = (shopItemContent: string): number => {
  const result = shopItemContent.match(/order_index:\s*(?<orderIndex>\d+)/);
  const orderIndex = parseInt(result?.groups?.["orderIndex"] ?? "");
  return !isNaN(orderIndex) ? orderIndex : Number.MAX_SAFE_INTEGER;
};

const computeSummaries = (transactions: Array<Transaction>): Array<Summary> => {
  const shopItems = readdirSync("./content/shop").filter((file) => {
    return file.endsWith(".md");
  });

  const { shopItemOrderIndexesByName } = shopItems.reduce<{
    shopItemOrderIndexesByName: Record<string, number>;
    shopItemSizes: Array<string>;
  }>(
    (acc, shopItem) => {
      const name = parseShopItemName(shopItem);
      const orderIndex = parseShopItemOrderIndex(
        readFileSync(`./content/shop/${shopItem}`).toString(),
      );
      return {
        ...acc,
        [name]: orderIndex,
      };
    },
    {
      shopItemOrderIndexesByName: {},
      shopItemSizes: [],
    },
  );

  const orderedShopItemNames = sortBy(Object.keys(shopItemOrderIndexesByName), (name) => {
    return shopItemOrderIndexesByName[name];
  });

  const emptyCountsByName = orderedShopItemNames.reduce<CountsByName>((acc, name) => {
    return {
      ...acc,
      [name]: {
        countsBySize: {
          XS: 0,
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
          XXL: 0,
        },
      },
    };
  }, {});

  const countsByName = transactions.reduce<CountsByName>((acc, transaction) => {
    const { name, size } = parseItemDescription(transaction.item_description);
    return {
      ...acc,
      [name]: {
        ...acc[name],
        countsBySize: {
          ...acc[name]?.countsBySize,
          [size]: (acc[name]?.countsBySize?.[size] ?? 0) + transaction.item_quantity,
        },
      },
    };
  }, emptyCountsByName);

  const summaries = Object.entries(countsByName).map(([name, counts]): Summary => {
    return Object.entries(counts.countsBySize).reduce<Summary>(
      (acc, [size, count]) => {
        return {
          ...acc,
          [size]: count,
        };
      },
      { name },
    );
  });

  return summaries;
};

const exportToCSV = async (data: Array<Record<string, unknown>>, options: { fileName: string }) => {
  const buffer = await writeToBuffer(data, { headers: true });
  writeFileSync(options.fileName, buffer);
};

const run = async () => {
  const path = `.env.${process.env.NODE_ENV ?? "development"}`;
  const host =
    process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  // Load env
  const dotenvConfig: DotenvConfigOptions = {
    path,
  };
  dotenv.config(dotenvConfig);
  console.log("Loaded env", { dotenvConfig });

  // Get access token
  const client = new ClientCredentials({
    client: {
      id: process.env.GATSBY_PAYPAL_CLIENT_ID ?? "",
      secret: process.env.PAYPAL_CLIENT_SECRET ?? "",
    },
    auth: {
      tokenHost: host,
      tokenPath: "/v1/oauth2/token",
    },
  });
  const accessToken = await client.getToken({});
  const apiOptions: APIOptions = {
    host,
    accessToken: accessToken.token.access_token as string,
  };
  console.log("Got access token", { apiOptions });

  // Get transactions
  const paypalTransactionDetails: Array<PaypalTransactionDetail> = [];
  const now = new Date();
  for (let month = 0; month <= now.getMonth(); month++) {
    paypalTransactionDetails.push(
      ...(await getMonthlyTransactions({ year: now.getFullYear(), month }, apiOptions)),
    );
  }

  const filteredPaypalTransactionDetails = filterRefundedPaypalTransactionDetails(
    filterBARPaypalTransactionDetails(paypalTransactionDetails),
  );

  const transactions = filteredPaypalTransactionDetails.flatMap(
    mapPaypalTransactionDetailToTransaction,
  );
  const { ticketTransactions, shirtTransactions } = partitionTransactions(transactions);

  console.log("Imported data", {
    transactions: paypalTransactionDetails.length,
    filteredTransactions: filterBARPaypalTransactionDetails.length,
    totalShirts: shirtTransactions.reduce((acc, shirtTransaction) => {
      return acc + shirtTransaction.item_quantity;
    }, 0),
  });

  await exportToCSV(ticketTransactions, { fileName: TICKET_TRANSACTIONS_FILE });
  await exportToCSV(shirtTransactions, { fileName: SHIRT_TRANSACTIONS_FILE });

  const summaries = computeSummaries(shirtTransactions);
  await exportToCSV(summaries, { fileName: SUMMARY_FILE });

  console.log("Exported data", TICKET_TRANSACTIONS_FILE, SHIRT_TRANSACTIONS_FILE, SUMMARY_FILE);
};

run();
