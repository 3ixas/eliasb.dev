# Strava credentials runbook

The training pin (#86) reads this week's sessions from Strava with three server-only environment variables: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, and `STRAVA_REFRESH_TOKEN`. Without them, the pin shows the running photo and caption alone. This runbook sets them up once, and says what to do if they stop working.

Only Elias can do these steps: they authorise an app against his Strava account. Never paste the secret or the tokens into chat, an issue, a commit, or a file in the repo.

## 1. Create the Strava API app

1. Sign in to Strava and open [strava.com/settings/api](https://www.strava.com/settings/api).
2. Fill in the form:
   - **Application Name:** eliasb.dev
   - **Category:** Visualizer
   - **Website:** https://www.eliasb.dev
   - **Authorization Callback Domain:** localhost
3. Save. The page now shows the **Client ID** (a number) and the **Client Secret**. Keep the page open.

## 2. Authorise the app on your account

Open this URL in the browser where you're signed in to Strava, with your Client ID in place of `CLIENT_ID`:

```text
https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all
```

`activity:read_all` lets the site count sessions you've set to "Only You" as well as public ones. It only counts them: the site shows the number of sessions per category, never names, routes, times, or places.

Approve. The browser then tries to open `http://localhost/exchange_token?...` and fails to load. That's expected. Copy the `code` value from the address bar: the part after `code=` and before `&scope`. It works once, for a few minutes.

## 3. Exchange the code for a refresh token

In a terminal (zsh), run this. It asks for each value, hiding the secret and the code, so they aren't echoed or saved in your shell history:

```bash
read -r "STRAVA_CLIENT_ID?Client ID: "; read -rs "STRAVA_CLIENT_SECRET?Client Secret: "; echo; read -rs "STRAVA_CODE?Code: "; echo; curl -s -X POST https://www.strava.com/api/v3/oauth/token -d client_id="$STRAVA_CLIENT_ID" -d client_secret="$STRAVA_CLIENT_SECRET" -d code="$STRAVA_CODE" -d grant_type=authorization_code | python3 -c 'import sys, json; r = json.load(sys.stdin); print("Refresh token:", r["refresh_token"]) if "refresh_token" in r else print("Strava said:", r)'
```

The `Refresh token:` line is the value for `STRAVA_REFRESH_TOKEN`. If it prints "Strava said:" with an error instead, the code has expired or was already used: go back to step 2 for a fresh one.

## 4. Add the variables to Vercel

From the repo, add each variable. The CLI takes one environment at a time and asks for the value, so it doesn't go into your history. Production first:

```bash
vercel env add STRAVA_CLIENT_ID production
```

```bash
vercel env add STRAVA_CLIENT_SECRET production --sensitive
```

```bash
vercel env add STRAVA_REFRESH_TOKEN production --sensitive
```

Then the same three with `preview` in place of `production`, so preview deployments show the card too. The dashboard works as well: Project → Settings → Environment Variables, where one entry can cover both.

`--sensitive` means the value can't be read back later, even by you; you'd only ever replace it.

To use them locally as well, pull them into `.env.local`, which git ignores. Sensitive values don't come down with the pull, so for local use, add those two to `.env.local` by hand:

```bash
vercel env pull .env.local
```

## 5. Check it works

1. Redeploy production (or wait for the next deploy), then open the Board.
2. The running photo should have its log card under it, saying "Training this week · via Strava", with this week's rows, or "Rest days, so far." if nothing's logged yet.
3. If the photo stands alone, open the deployment's Runtime Logs in Vercel and look for `[strava]` warnings.

## If it stops working

Strava's docs say a refresh token "can change anytime you retrieve a new access token. Once a new refresh token code has been returned, the older code will no longer work." The site doesn't store a rotated token anywhere, so if Strava ever rotates it, the stored one stops working and the pin quietly falls back to the photo alone.

In practice Strava rarely rotates the token, so the env-var setup should last a long time. If it does break:

1. Repeat steps 2 to 4 to get a fresh refresh token. The app from step 1 stays.
2. If it keeps happening, the fix is for the site to store the rotated token itself (in Vercel's storage, say) rather than in an environment variable. That's a follow-up ticket, not a runbook step.

Revoking access is at [strava.com/settings/apps](https://www.strava.com/settings/apps): remove eliasb.dev there, and the site loses access straight away.
