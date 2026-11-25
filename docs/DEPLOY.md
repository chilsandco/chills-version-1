# Deploying chilsandco.com from GitHub

Goal: push to the `main` branch on GitHub and Hostinger builds and deploys it. No more zip uploads.

Repo: https://github.com/chilsandco/chills-version-1 (private). `main` is the live code.

## Why a new Hostinger app is needed

The current app (chilsandco.com) was created with "Upload files", and Hostinger only offers GitHub deploys for apps
created with "Import Git repository". So the Git-deployed app is a new Web App on the same hosting plan, tested on a
temporary address and then given the chilsandco.com domain.

**The account owner must do the GitHub connection from their own Hostinger login.** Hostinger disables
"Connect with GitHub" in collaborator ("managing client") mode. Everything else can be checked from any login.

## One-time setup

1. Log in to hPanel as the account owner (chsrikanthisme@gmail.com), not in collaborator mode.
2. Websites > Create site > Web App. Choose "Use temporary domain".
3. "Import your Git repository" > Connect with GitHub. Approve Hostinger's access to the `chilsandco` organisation and
   select the repository `chills-version-1` only.
4. Branch: `main`. Turn auto-deploy on ("auto-deploy on every push").
5. Build settings (these match the current app):
   - Framework preset: Express
   - Node version: 22.x
   - Root directory: `./`
   - Package manager: npm
   - Build: the default (`npm run build`, which builds the shop with Vite and bundles `server.ts` into `server.js`)
   - Entry file: `server.js`
6. Environment variables: use "Import .env" with `.env.hostinger-test` from the project folder (it is git-ignored and
   deliberately has the Slack tokens removed and `PAYMENT_RECON=off`, so the test copy cannot double-post to Slack or
   double-process payments while the live site is still running). Then set:
   - `WOOCOMMERCE_KEY` and `WOOCOMMERCE_SECRET` to the NEW keys (copy them from the current app's environment page,
     "Show all values"). The import file holds the old keys, which fail with 401 and show demo products.
7. Deploy. Test on the temporary address (checklist below).

## Test checklist (temporary address)

- Home page loads with real products (not demo ones), prices and photos.
- A product page, the collection, /journal, /llms.txt and /sitemap.xml load.
- Add to bag works. Do not complete a real payment unless you intend to.
- https://<temp-address>/api/products returns about 72 products.
- Server logs show "Products refreshed" and "Product pages warmed", and no errors.

## Switching the real domain (cutover)

Do this at a quiet time. There is a short gap, so have the rollback below in mind.

1. In the new app, add the Slack tokens (`SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`) and `SLACK_REFUND_USERS`
   (`U0CFPSE9M4K,U0CGXS9DFSA`), and remove `PAYMENT_RECON`. Do not leave the tokens on both apps.
2. Remove the Slack tokens from the OLD app and redeploy it, so only one app talks to Slack.
3. In the old app, disconnect the domain chilsandco.com. In the new app, connect chilsandco.com (and www).
4. Check https://chilsandco.com, then place a small test order (a Rs 1 order has worked before) and confirm the order
   appears in Slack and the confirmation email arrives.
5. Keep the old app for a week as the rollback, then delete it.

Things that carry over by themselves because they live outside the app folder: customer uploads and return photos
(`~/chils-data`), the image cache (`~/chils-media-cache`) and, since this change, the Slack bot's memory
(`~/chils-data/.slack-state.json`).

## Day to day

1. Work on a branch, then merge it into `main` (pull request or fast-forward).
2. Hostinger builds and deploys `main` automatically. Watch Deployments in hPanel for "Success".
3. Check the site. If a deploy fails, the previous version keeps running.

## Rollback

- Bad deploy: in hPanel > Deployments, redeploy an earlier successful deployment, or `git revert` the commit on `main`
  and push.
- Bad cutover: reconnect chilsandco.com to the old app (still there for a week).

## Secrets

Never commit `.env*` or `secrets/` (both are git-ignored). Environment variables live only in Hostinger.

## How a change reaches the live site (current state, 26 Nov 2026)

GitHub (`chilsandco/chills-version-1`) is where the code is pushed. The new Hostinger app deploys from the GitLab
project `chils-and-co-group/chills-version-1`, branch `main`. A change only goes live automatically if GitLab receives
it. As of this note GitLab has no mirror set up, so confirm below that a GitHub push shows up on GitLab before
relying on it.

Sync test: commit `a4f7f5e` style marker lines like the one below are only used to prove a push reaches GitLab.

- sync test marker: 2026-11-26
