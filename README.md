# Case Desk

A Next.js page for recording personal six-digit case references. The dark card and segmented entry follow the supplied screenshot. A neutral folder icon identifies the app.

## Run locally

Use Node.js 20.9 or newer. From this directory, run `npm ci` and `npm run dev`, then open the local URL printed by Next.js. Run `npm run build` to create the static production site in `out/`.

## Saved records

Enter or paste six digits, then select **Verify Case**. The card reproduces the screenshot's wording. In this local demo the button checks the six-digit format and saves the ID and time to `cases.json` in the current browser. It keeps leading zeros and avoids duplicate case IDs. Select **Download JSON** above the card to export the whole log.

```json
[
  {
    "caseId": "012345",
    "savedAt": "2026-01-01T09:30:00.000Z"
  }
]
```

Each browser profile and site origin has a separate log. Clearing site data also clears its log. Use a current browser on HTTPS or localhost for file storage.
