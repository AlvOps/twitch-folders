# Twitch Folders

Featured in https://addons.mozilla.org/en-US/firefox/addon/twitch-folders/

Browser extension that adds **folders** to the "Followed Channels" list in the Twitch sidebar. Only live streamers are shown, fully integrated into the page.

**Version:** 2.2

## Features

- Create as many folders as you want, named however you like.
- Drag and drop the streamers you follow into any folder (and between folders).
- Collapse / expand each folder; the state is remembered.
- Only channels that are currently live are shown, with avatar, category and viewer count exactly as on Twitch.
- Unassigned channels live in an "Others" folder.
- No popups, no separate windows: it reuses Twitch's own channel cards.
- Resilient to Twitch updates: it watches the page and re-syncs automatically.

## Install

**Firefox:** [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/twitch-folders/) *(or load `manifest.json` temporarily from `about:debugging#/runtime/this-firefox`)*

**Chrome / Edge:** `chrome://extensions` → enable *Developer mode* → *Load unpacked* → select this folder.

## Usage

1. Open [twitch.tv](https://www.twitch.tv) and look at the left sidebar.
2. Type a name in **+ New folder** and press Enter.
3. Drag streamers from **Others** into your folder.
4. Click a folder header to collapse / expand it; hover it and click **×** to delete it.

## Privacy

No data is collected or transmitted. Folders are stored only in the browser's local storage (`chrome.storage.local`). The extension makes no network requests of its own.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save your folders |
| `https://www.twitch.tv/*` | Insert the folders into the sidebar |

## Development

Three files, no build step:

- `manifest.json` – Manifest V3, Chrome + Firefox
- `content.js` – all logic
- `style.css` – styles

Package for the stores: `zip twitch-folders.zip manifest.json content.js style.css`

## License

MIT – see [LICENSE](LICENSE).

Twitch is a trademark of Twitch Interactive, Inc. This project is not affiliated with Twitch.
