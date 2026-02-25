# CursorPilot Actions SDK Plugin

A **Logitech Actions SDK** plugin (C#/.NET 8) that maps physical hardware controls to CursorPilot workflow actions.

## Actions Registered

| Action | Type | Hardware Control | Engine Endpoint |
|--------|------|-----------------|-----------------|
| **Fix & Verify** | Command | Button A | `POST /api/fix` |
| **Explain** | Command | Button B | `POST /api/explain` |
| **Mode Selector** | Adjustment | Dial/Ring | `POST /api/mode` |

## Architecture

```
Logitech Device → Actions SDK → Plugin (C#) → HTTP Bridge → CursorPilot Engine (Node)
```

The plugin communicates with the CursorPilot Engine via **localhost HTTP** (`http://localhost:8787`), authenticated with the `X-CursorPilot-Token` header.

## Build (Windows)

```bash
cd plugins/cursorpilot-actions-plugin
dotnet restore
dotnet build -c Release
```

## CI

The GitHub Actions workflow (`.github/workflows/build-plugin.yml`) automatically builds and archives the plugin on every push. The artifact `cursorpilot-actions-plugin.zip` is uploaded for download.

## Loading the Plugin

1. Build the plugin on Windows (`dotnet build -c Release`)
2. Start the CursorPilot Engine (`npm run dev` from the repo root)
3. Ensure the bridge server is running at `http://localhost:8787`
4. Load the plugin output directory into Logi Options+ / Actions SDK runtime
5. Assign actions to your Logitech device buttons and dial

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| Bridge URL | `http://localhost:8787` | Engine bridge endpoint |
| Token | `dev-only-token` | Auth token (match `BRIDGE_TOKEN` in `.env`) |

## Without Hardware

The CursorPilot Desktop app provides a **Virtual Console** UI that simulates the same actions. The same engine endpoints are used by both the simulated UI and the real plugin, ensuring identical behavior.
