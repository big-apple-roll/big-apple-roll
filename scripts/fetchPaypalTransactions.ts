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

const APPAREL_TRANSACTIONS_FILE = "./exports/apparel_transactions.csv";
const APPAREL_SUMMARY_FILE = "./exports/apparel_summary.csv";

const TICKET_TRANSACTIONS_FILE = "./exports/ticket_transactions.csv";
const TICKET_SUMMARY_FILE = "./exports/ticket_summary.csv";

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

const isTicketName = (name: string) => {
  return /ticket/.test(name);
};

const partitionTransactions = (transactions: Array<Transaction>) => {
  const [ticketTransactions, apparelTransactions] = partition(transactions, (transaction) => {
    return isTicketName(parseItemDescription(transaction.item_description).name);
  });
  return { ticketTransactions, apparelTransactions };
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

const computeApparelSummaries = (transactions: Array<Transaction>): Array<Summary> => {
  const EMPTY_APPAREL_SUMMARY: Record<string, number> = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  };

  const shopItems = readdirSync("./content/shop").filter((file) => {
    return file.endsWith(".md");
  });

  const shopItemOrderIndexesByName = shopItems.reduce<Record<string, number>>((acc, shopItem) => {
    const name = parseShopItemName(shopItem);
    if (isTicketName(name)) {
      return acc;
    }

    const shopItemContent = readFileSync(`./content/shop/${shopItem}`).toString();
    const orderIndex = parseShopItemOrderIndex(shopItemContent);
    return {
      ...acc,
      [name]: orderIndex,
    };
  }, {});

  const orderedShopItemNames = sortBy(Object.keys(shopItemOrderIndexesByName), (name) => {
    return shopItemOrderIndexesByName[name];
  });

  const emptyCountsByName = orderedShopItemNames.reduce<CountsByName>((acc, name) => {
    return {
      ...acc,
      [name]: {
        countsBySize: { ...EMPTY_APPAREL_SUMMARY },
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
      { name, ...EMPTY_APPAREL_SUMMARY },
    );
  });

  // console.log(
  //   "DEBUG: sum",
  //   {},
  //   JSON.stringify(
  //     {
  //       orderedShopItemNames,
  //       emptyCountsByName,
  //       countsByName,
  //       summaries,
  //     },
  //     null,
  //     2,
  //   ),
  // );

  return summaries;
};

const computeTicketSummaries = (ticketTransactions: Array<Transaction>): Array<Summary> => {
  const summariesByName = ticketTransactions.reduce<Record<string, Summary>>(
    (acc, ticketTransaction) => {
      const { name } = parseItemDescription(ticketTransaction.item_description);
      return {
        ...acc,
        [name]: {
          name,
          count: Number(acc[name]?.count ?? 0) + ticketTransaction.item_quantity,
        },
      };
    },
    {},
  );

  return Object.values(summariesByName);
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
  const { ticketTransactions, apparelTransactions } = partitionTransactions(transactions);

  console.log("Imported data", {
    paypalTransactions: paypalTransactionDetails.length,
    filteredTransactions: filterBARPaypalTransactionDetails.length,
    apparelTransactions: apparelTransactions.length,
    apparelTotal: apparelTransactions.reduce((acc, apparelTransaction) => {
      return acc + apparelTransaction.item_quantity;
    }, 0),
    ticketTransactions: ticketTransactions.length,
    ticketTotal: ticketTransactions.reduce((acc, ticketTransaction) => {
      return acc + ticketTransaction.item_quantity;
    }, 0),
  });

  await exportToCSV(ticketTransactions, { fileName: TICKET_TRANSACTIONS_FILE });
  await exportToCSV(apparelTransactions, { fileName: APPAREL_TRANSACTIONS_FILE });

  const apparelSummaries = computeApparelSummaries(apparelTransactions);
  await exportToCSV(apparelSummaries, { fileName: APPAREL_SUMMARY_FILE });

  const ticketSummaries = computeTicketSummaries(ticketTransactions);
  await exportToCSV(ticketSummaries, { fileName: TICKET_SUMMARY_FILE });

  console.log(
    "Exported data",
    APPAREL_TRANSACTIONS_FILE,
    APPAREL_SUMMARY_FILE,
    TICKET_TRANSACTIONS_FILE,
    TICKET_SUMMARY_FILE,
  );
};

run();
