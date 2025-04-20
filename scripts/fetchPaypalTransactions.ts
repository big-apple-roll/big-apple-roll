#!/usr/bin/env yarn ts-node
/* eslint-disable no-console */

import dotenv, { DotenvConfigOptions } from "dotenv";
import { ClientCredentials } from "simple-oauth2";

const run = async () => {
  // Load env
  const dotenvConfig: DotenvConfigOptions = {
    path: `.env.${process.env.NODE_ENV ?? "development"}`,
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
      tokenHost: "https://api-m.sandbox.paypal.com",
      tokenPath: "/v1/oauth2/token",
    },
  });
  const accessToken = await client.getToken({});
  console.log("Got access token", { accessToken: accessToken.token.access_token });

  const query = new URLSearchParams({
    start_date: new Date(2025, 3, 1).toISOString(),
    end_date: new Date(2025, 3, 30).toISOString(),
  }).toString();

  // This is work in progress, doesn't show items yet
  // TODO: include items
  const resp = await fetch(`https://api-m.sandbox.paypal.com/v1/reporting/transactions?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.token.access_token}`,
    },
  });

  const data = await resp.text();
  console.log(data);
};

run();
