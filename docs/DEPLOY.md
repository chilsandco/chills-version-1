# Deploying chilsandco.com

How a change reaches the live site today (26 Nov 2026): **zip upload in Hostinger**. Pushing to GitHub does not
deploy anything.

Repo: https://github.com/chilsandco/chills-version-1 (private). `main` is the code that should be live.

## The release flow

1. Work on a branch, check it, then fast-forward `main`:
   `git push origin <branch> && git push origin <branch>:main`
2. Check the build locally: `npx tsc --noEmit` and `npm run build` must both be clean, because Hostinger runs
   `npm run build` again during the deploy and a failing build means no deploy.
3. Refresh the upload zip (from the `chills-version-1` folder):

   ```
   zip -q -d ../chils-website-latest.zip "dist/*"
   zip -q -r ../chils-website-latest.zip dist index.html server.js server.ts journal.ts seo.ts slackBot.ts storage.ts orderVariations.ts metaCapi.ts mediaCache.ts src public/robots.txt docs
   ```

   If a new top-level `.ts` file is added that `server.ts` imports, add it to that list, or Hostinger's build fails.
4. The account owner uploads `chils-website-latest.zip` to the chilsandco.com app in hPanel and deploys. Hostinger unpacks it, runs `npm run build` and restarts the app (entry file
   `server.js`, Node 22.x).
5. Check the live site: home page with real products, a product page, add to bag, /journal, /sitemap.xml,
   /feeds/google-products.xml. Do not complete a real payment unless you intend to.

## Data that survives a deploy

A deploy replaces the app folder. Everything the site writes at runtime lives outside it, in the hosting account's
home folder, so it carries over:

- `~/chils-data`: customer uploads and return photos (`uploads/`), settings, quotes and pending exchanges, the Slack
  bot's memory (`.slack-state.json`), the last good product list (`products-snapshot.json`) and the last good copy of
  each product page (`product-snapshots/<id>.json`). The snapshots let the shop and product pages keep working while
  the store (api.chilsandco.com) is down.
- `~/chils-media-cache`: the image cache behind `/media/...`.

Never delete these folders when cleaning up the app.

## Environment variables

They live only in Hostinger (the app's environment page). Never commit `.env*` or `secrets/` (both are git-ignored),
and never put keys or passwords in code.

- `ORDER_LINK_SECRET` (optional, recommended): signs the private `t=` token in order-success links, which the success
  page needs to read an order's status or retry a payment. If it is not set, `JWT_SECRET` is used. If neither is set,
  order links are switched off and the success page shows a general "order confirmed" message. Use a long random
  value. Changing it (or adding it later) makes earlier success links fall back to that general message; orders are
  not affected. The `CHLS-xxxxxx` reference is only a display name and grants no access.

## Testing locally

`server.ts` calls `dotenv.config()`, which reads `.env` from the **current folder**. Starting the server from the
project folder therefore loads the real keys in `.env` (Slack, payments), even under `env -i`, and the local copy
connects to the live Slack bot. Start it from an empty folder instead, with fake store values:

```
mkdir -p /tmp/chils-run && cd /tmp/chils-run
env -i PATH="$PATH" HOME=/tmp/chils-run NODE_ENV=production WOOCOMMERCE_URL=http://127.0.0.1:9 \
  WOOCOMMERCE_KEY=ck_test WOOCOMMERCE_SECRET=cs_test PAYMENT_RECON=off CHILS_DATA_DIR=/tmp/chils-run/data \
  PORT=4010 node /path/to/chills-version-1/server.js
```

The log should say `[SLACK] Order bot off`.

## Rollback

Upload the previous zip (keep a copy of the last good one before overwriting it) or, in hPanel > Deployments,
redeploy an earlier successful deployment.

## Not set up: deploy from GitHub

GitHub-based auto-deploy is **not** set up. Hostinger only offers Git deploys for apps created with "Import Git
repository", and the live app was created with "Upload files".

A temporary Git-deployed Hostinger app exists at https://overjoyed-whitesmoke-gnat-12.hostingersite.com. It deploys
from the GitLab project `chils-and-co-group/chills-version-1` (branch `main`). That GitLab project is a one-time copy:
it does **not** sync from GitHub, so it does not receive new commits and the temporary app is out of date. Do not
point chilsandco.com at it.

To make GitHub pushes reach it, a mirror is needed: a GitLab access token saved by the owner as the GitHub Actions
secret `GITLAB_TOKEN`, plus a workflow that pushes `main` to GitLab on every push. The workflow has not been added,
because the secret does not exist yet. Moving the live domain to a Git-deployed app would also need its environment
variables copied over and the Slack tokens moved (only one app may talk to Slack at a time).
