// CursorPilot Actions SDK Plugin — Entry Point
// Integrates with the Logitech Actions SDK to expose CursorPilot workflow
// controls as hardware-mapped Commands (buttons) and an Adjustment (dial/ring).

namespace Loupedeck.CursorPilotPlugin
{
    using System;

    /// <summary>
    /// Main plugin class for the CursorPilot OS Logitech Actions SDK integration.
    /// Commands and adjustments that derive from <see cref="PluginDynamicCommand"/> and
    /// <see cref="PluginDynamicAdjustment"/> are discovered automatically by the runtime.
    /// They communicate with the CursorPilot Engine over a localhost HTTP bridge.
    /// </summary>
    public class CursorPilotPlugin : Plugin
    {
        // This is a universal plugin — it is not tied to a specific desktop application.
        public override Boolean HasNoApplication => true;

        // We only use the application API, not OS-level integration.
        public override Boolean UsesApplicationApiOnly => true;

        public CursorPilotPlugin()
        {
            PluginLog.Init(this.Log);
            PluginResources.Init(this.Assembly);
        }

        // Called when the plugin is loaded by the Logi Plugin Service.
        public override void Load() => PluginLog.Info("CursorPilot plugin loaded");

        // Called when the plugin is unloaded.
        public override void Unload() => PluginLog.Info("CursorPilot plugin unloaded");
    }
}
