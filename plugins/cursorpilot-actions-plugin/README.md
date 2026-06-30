# CursorPilot Actions SDK Plugin

A **Logi Actions SDK** plugin (C#/.NET 8) that maps physical hardware controls to CursorPilot workflow actions.

## Actions Registered

| Action | SDK Type | Suggested Control | Engine Endpoint |
|--------|----------|-------------------|-----------------|
| **Fix & Verify** | `PluginDynamicCommand` | Button | `POST /api/fix` |
| **Explain Issue** | `PluginDynamicCommand` | Button | `POST /api/explain` |
| **Mode Selector** | `PluginDynamicAdjustment` | Dial/Ring | `POST /api/mode` |

## Architecture

```
Logitech Device → Logi Plugin Service → Plugin (C#) → HTTP Bridge → CursorPilot Engine (Node)
```

The plugin communicates with the CursorPilot Engine via **localhost HTTP** (`http://localhost:8787`), authenticated with the `X-CursorPilot-Token` header.

## Project Layout

```
cursorpilot-actions-plugin/
├── Directory.Build.props              # shared MSBuild output paths
├── CursorPilotPlugin.sln
└── CursorPilotPlugin/
    ├── CursorPilotPlugin.csproj       # references PluginApi.dll from LogiPluginService
    ├── CursorPilotPlugin.cs           # Plugin entry point (extends Loupedeck.Plugin)
    ├── PluginLog.cs                    # SDK log helper
    ├── PluginResources.cs             # embedded-resource helper
    ├── Actions/
    │   ├── FixAndVerifyCommand.cs     # PluginDynamicCommand
    │   ├── ExplainCommand.cs          # PluginDynamicCommand
    │   └── ModeAdjustment.cs          # PluginDynamicAdjustment
    ├── Bridge/
    │   └── LocalhostBridgeClient.cs   # HTTP client → CursorPilot Engine
    └── package/
        └── metadata/
            ├── LoupedeckPackage.yaml  # plugin manifest (Marketplace requirement)
            └── Icon256x256.png        # plugin icon (replace with final art)
```

> The Marketplace reads `LoupedeckPackage.yaml`, **not** a `manifest.json` — the SDK uses the
> Loupedeck package format. Distribution artifacts are `.lplug4` files.

## Prerequisites

- **Windows** (the Logi Actions SDK build toolchain is Windows-first; macOS is supported by the SDK but tooling is most reliable on Windows)
- **.NET 8 SDK**
- **Logi Options+** with the Logi Actions SDK / **LogiPluginService** installed — this provides:
  - `PluginApi.dll` (referenced by the build; **not** committed, not redistributable)
  - `logiplugintool` (packs and verifies `.lplug4` files)

## Build (Windows)

```bash
cd plugins/cursorpilot-actions-plugin
dotnet build CursorPilotPlugin.sln -c Release
```

Output lands in `bin/Release/` with `bin/` (binaries) and the copied `metadata/` folder beside it.

## Package into a `.lplug4`

```bash
# from plugins/cursorpilot-actions-plugin
logiplugintool pack ./bin/Release/ ./CursorPilot_1_0.lplug4
logiplugintool verify ./CursorPilot_1_0.lplug4
```

Naming convention: `pluginName_version.lplug4`.

> Don't have a Windows machine with the SDK? See [`BUILDING.md`](./BUILDING.md) for three ways
> to produce the `.lplug4` (local Windows, self-hosted CI runner, or an ephemeral cloud VM).

## Loading the Plugin Locally

1. Build on Windows (`dotnet build -c Release`) — the post-build step links the output into LogiPluginService for hot reload.
2. Start the CursorPilot Engine (`npm run dev` from the repo root) so the bridge listens at `http://localhost:8787`.
3. Open Logi Options+ → assign **Fix & Verify**, **Explain Issue**, and **Mode Selector** to your device buttons and dial.

## CI

`.github/workflows/build-plugin.yml` validates the package metadata on every push. It builds and
packs a real `.lplug4` **only when the runner has LogiPluginService installed** (a self-hosted
Windows runner with Logi Options+). Stock GitHub runners can't produce the `.lplug4` because
`PluginApi.dll` and `logiplugintool` are not redistributable — build those on a machine with the
SDK installed, or locally as above.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| Bridge URL | `http://localhost:8787` | Engine bridge endpoint |
| Token | `dev-only-token` | Auth token (match `BRIDGE_TOKEN` in `.env`) |

## Without Hardware

The CursorPilot Desktop app provides a **Virtual Console** UI that simulates the same actions. The same engine endpoints are used by both the simulated UI and the real plugin, ensuring identical behavior.

## Submitting to the Logitech Marketplace

1. Build + pack the `.lplug4` on a machine with LogiPluginService installed.
2. Test it against supported hardware and the Logi Plugin Service.
3. Accept the Logitech Marketplace Developer Agreement and ensure a EULA is provided (see `EULA.md` at the repo root).
4. Upload the `.lplug4` at <https://marketplace.logi.com/contribute> and complete the listing. Reviews take up to ~10 working days.
