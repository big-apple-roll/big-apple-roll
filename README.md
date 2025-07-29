# Big Apple Roll

This repo contains the code for the Big Apple Roll website: [https://bigappleroll.org/](https://bigappleroll.org/)

## Table of contents

- [Edit content](#edit-content)
  - [Schedule](#schedule)
  - [Shop](#shop)
  - [Sponsors](#sponsors)
- [Edit code](#edit-code)
  - [Install](#install)
  - [Run dev server](#run-dev-server)
  - [Deploy](#deploy)
  - [Roadmap](#roadmap)
  - [Lint](#lint)
  - [Update dependencies](#update-dependencies)
- [External services](#external-services)

## Edit content

The website is generated from [markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) files stored in the [`content/<current year>` directory](content/2024/).

Each file may contain a frontmatter header. The supported variables of the frontmatter header depends on the folder in which the file is stored.

These files can easily be edited directly on GitHub. Once the file is committed on GitHub, the website will be automatically updated a few minutes later. You can check the status of the build on the [Actions tab](/actions).

### Schedule

```md
<!-- /content/2024/schedule/friday/night-skate.md -->

---

title: Friday night skate
date: 2024-08-02 19:00:00 <!-- Format: YYYY-MM-DD HH:mm:ss -->

difficulty: moderate <!-- Either "easy", "casual", "moderate", or "advanced" -->
start: New York Marriott Downtown, 6:45 PM
start_map: https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.385716093497!2d-74.01706112379928!3d40.70952463776697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a1090488a95%3A0xb7522984917c278f!2sNew%20York%20Marriott%20Downtown!5e0!3m2!1sen!2sus!4v1715270006659!5m2!1sen!2sus
end: Broadstone (88 Broad st. New-York)
leader: Sarai Pegram
distance: 15 miles
highlights: Ghostbusters HQ, Washington Square Park, Union Square, Grand Central, First Ave Tunnel, Times Square, New York Public Library, Macy’s, Flatiron Building, Madison Square Park, Astor Place, St. Mark’s Place, Little Italy, and Chinatown
route_map: https://www.google.com/maps/d/u/0/embed?mid=1dUFc0xkKOrqiCzU5F4I_Mq7wDnuMVP0&ehbc=2E312F&noprof=1

---

Come skate on **Friday night**!
```

- The url of the event page will be generated from the folder name and file name (e.g. `/schedule/friday/night-skate/`).
- Each day folder should have a corresponding day file.

### Shop

```md
<!-- /content/2024/shop/awesome-tshirt.md -->

---

title: Awesome t-shirt
button_color: blue <!-- Either "green", "orange", or "blue" -->
order_index: 1 <!-- Used to order the products -->
price: 29.99

---

Description of the t-shirt
```

- Multiple images with the same prefix than the product file can be included (e.g. `/content/2024/shop/awesome-tshirt-front.jpg`
- The url of the product page will be generated from file name (e.g. `/shop/awesome-tshirt/`).

### Sponsors

```md
<!-- /content/2024/sponsors/nyc-skate-marathon.md -->

---

title: NYC Skate Marathon
type: general <!--  Either "presenting", "supporting", or "general" -->
url: https://skatemarathon.org/

---
```

- One image with the same prefix than the sponsor file can be included (e.g. `/content/2024/sponsors/nyc-skate-marathon.jpg`).

## Edit code

The website is built with [Gatsby](https://www.gatsbyjs.com), a React-based framework for creating static websites.

### Install

- Depends on node v20. (Install with [nvm](https://github.com/nvm-sh/nvm))

```sh
yarn install
```

- Duplicate `.env.sample` to `.env.development` and `.env.production`

### Run dev server

```sh
yarn dev
```

- Open [http://localhost:8000](http://localhost:8000)
- Open [http://localhost:8000/\_\_\_graphql](http://localhost:8000/___graphql) to explore GraphQL
- Hot reloading is enabled in dev

### Deploy

Just push new commits to `main` and the website will be automatically deployed to GitHub Pages with Github actions.

### Roadmap

The roadmap/open issues is managed in [Height](https://bar.height.app/). (Ask Thibault for access.)

### Lint

```sh
yarn lint
```

### Update dependencies

```sh
yarn upgrade-interactive
```

If Dependabot can't update a dependency, edit the `resolutions` field in `package.json` to force the version.

## Paypal

The shop payments are sent to Paypal. Export an activity report from Paypal to see all orders.

Export transactions:

- Copy `.env.sample` to `.env.production` and add secrets
- Run `NODE_ENV=production ./scripts/fetchPaypalTransactions.ts`
