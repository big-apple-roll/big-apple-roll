#!/usr/bin/env yarn ts-node
/* eslint-disable no-console */

import dotenv, { DotenvConfigOptions } from "dotenv";
import { ClientCredentials } from "simple-oauth2";

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
  console.log("Loaded env with", { dotenvConfig });

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
  console.log("Got access token", { accessToken: accessToken.token.access_token });

  // Get transactions
  // This is work in progress, doesn't show items yet
  // TODO: paginate
  const transactionUrl = new URL(host);
  transactionUrl.pathname = "/v1/reporting/transactions";
  transactionUrl.searchParams.set("start_date", new Date(2025, 3, 1).toISOString());
  transactionUrl.searchParams.set("end_date", new Date(2025, 3, 30).toISOString());
  transactionUrl.searchParams.set("transaction_status", "S");
  transactionUrl.searchParams.set("fields", "transaction_info,payer_info,cart_info");
  const resp = await fetch(transactionUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.token.access_token}`,
    },
  });

  const data = await resp.text();
  console.log("Loaded transactions");
  console.log(JSON.stringify(JSON.parse(data), null, 2));
};

run();
