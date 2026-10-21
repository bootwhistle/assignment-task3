# Volunteam App

## Running the app

Requires Node 20+ and the Expo Go app (SDK 57) on your phone.

```
npm install
npx expo start
```

## Setting up the fake API (json-server)

The app finds json-server automatically: it uses the IP address of the computer running the Expo dev server (see `src/services/api.ts`). Start json-server on all network interfaces:

```
npx json-server --watch db.json --port 3333 --host 0.0.0.0 -m ./node_modules/json-server-auth
```

All seed users in `db.json` use the password `123456` (e.g. `eva.young@example.com`).

To access your server online without running json-server locally, you can set your baseURL to:

```
https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>
```

To use `my-json-server`, make sure your `db.json` is located at the repo root.

## Setting up the image upload API

Event pictures are uploaded to Freeimage.host (https://freeimage.host/page/api) by `src/services/imageApi.ts`.

The app works out of the box with the public API key published on the Freeimage.host API page (set in `app.config.ts`).
To use your own key, set FREEIMAGE_API_KEY when starting the app:

```
FREEIMAGE_API_KEY="insert_your_api_key_here" npx expo start
```

When creating your app build or publishing, import your secret values to EAS running:

```
eas secret:push
```
