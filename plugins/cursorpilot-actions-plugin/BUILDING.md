# Building the `.lplug4`

The Marketplace upload box accepts a **`.lplug4`**. Producing one requires
**`PluginApi.dll`** (referenced at build) and **`logiplugintool`** (packs/verifies),
both of which ship inside **LogiPluginService** (installed by Logi Options+). They are
**not redistributable**, so they can't be committed or vendored into a stock CI runner.

You're on macOS, so pick one of the paths below. **Option 0 (hosted CI) is the default
and needs no Windows machine of your own.**

---

## Option 0 — Hosted GitHub runner, auto-install (default, no setup)

The `package` job in `.github/workflows/build-plugin.yml` installs Logi Options+ on the
hosted `windows-latest` runner using Logitech's documented silent installer
(`logioptionsplus_installer.exe /quiet`). That places `PluginApi.dll` + `logiplugintool`
on disk — all the build and pack need (no GUI or device required). So a release is fully
hands-off:

```bash
git tag plugin-v1.0.1 && git push origin plugin-v1.0.1
```

→ CI installs the SDK, builds, packs, `verify`s, and attaches `CursorPilot_1_0.lplug4` to
the `plugin-v1.0.1` release.

Notes:
- The install adds ~2–4 min per release build. Set repo variable `INSTALL_LOGI_SDK=false`
  to disable it (e.g. when using a self-hosted runner that already has the SDK).
- Installing Logitech's installer in CI is unofficial-for-CI but only uses files you're
  licensed to use to build your own plugin. If a runner image change ever breaks it, fall
  back to Option A/B/C below.

---

## Option A — Local Windows machine (most reliable)

Use any Windows 10/11 box (physical, Boot Camp, Parallels, or a VM).

1. Install **Logi Options+** → it installs LogiPluginService (provides `PluginApi.dll` + `logiplugintool`).
2. Install the **.NET 8 SDK**.
3. Clone the repo and build + pack:

   ```powershell
   cd plugins\cursorpilot-actions-plugin
   dotnet build CursorPilotPlugin.sln -c Release
   logiplugintool pack ./bin/Release/ ./CursorPilot_1_0.lplug4
   logiplugintool verify ./CursorPilot_1_0.lplug4
   ```

4. Upload `CursorPilot_1_0.lplug4` at <https://marketplace.logi.com/contribute>.

**Trade-off:** manual, but zero infra. Best for a first submission.

---

## Option B — Self-hosted GitHub Actions runner (best for repeat releases)

The existing workflow (`.github/workflows/build-plugin.yml`) already auto-detects the SDK
and packs a `.lplug4` when it's present. Point it at a Windows runner that has Logi
Options+ installed:

1. On a Windows machine with **Logi Options+** and **.NET 8 SDK**, register a self-hosted
   runner: repo → **Settings → Actions → Runners → New self-hosted runner** (Windows x64),
   and give it a label such as `logi-sdk`.
2. Change the job target in `build-plugin.yml`:

   ```yaml
   # from:
   runs-on: windows-latest
   # to:
   runs-on: [self-hosted, windows, logi-sdk]
   ```

3. Push (or run the workflow manually). The `Detect Logi Actions SDK` step now finds the
   SDK, so the build + `logiplugintool pack`/`verify` steps run and upload the `.lplug4`
   as a workflow artifact you can download.

**Trade-off:** one-time runner setup; afterwards every push produces a downloadable `.lplug4`.
Keep the runner machine online when you want builds. The default `windows-latest` job stays
useful as a metadata-validation check on PRs.

---

## Option C — Ephemeral cloud Windows VM

If you don't have a Windows machine handy: spin up a short-lived Windows VM (Azure/AWS/GCP),
install Logi Options+ and the .NET 8 SDK, follow **Option A**, download the `.lplug4`, then
tear the VM down.

**Trade-off:** no local Windows needed; costs VM time and a GUI installer session. Fine for
one-off builds, overkill for routine releases.

---

## After you have a `.lplug4`

Run through the pre-submission gate in [`MARKETPLACE_LISTING.md`](./MARKETPLACE_LISTING.md):
`logiplugintool verify` passes · tested on device/Virtual Console · final icon in place ·
Developer Agreement accepted + EULA attached · all listing links resolve.
