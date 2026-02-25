// CursorPilot Actions SDK Plugin — Entry Point
// This plugin integrates with the Logitech Actions SDK to expose
// CursorPilot workflow controls as hardware-mapped actions.

namespace CursorPilotPlugin;

using CursorPilotPlugin.Actions;
using CursorPilotPlugin.Bridge;

/// <summary>
/// Main plugin class for CursorPilot OS Logitech Actions SDK integration.
/// Registers Commands (buttons) and Adjustments (dial/ring) that communicate
/// with the CursorPilot Engine via a localhost HTTP bridge.
/// </summary>
public class Plugin
{
    private readonly LocalhostBridgeClient _bridge;

    public Plugin()
    {
        _bridge = new LocalhostBridgeClient();
    }

    /// <summary>
    /// Called by the Actions SDK runtime to initialize the plugin.
    /// Registers all available actions.
    /// </summary>
    public void Initialize()
    {
        Console.WriteLine("[CursorPilot] Plugin initialized");
        Console.WriteLine("[CursorPilot] Bridge target: " + _bridge.BaseUrl);

        // Actions are registered via SDK attributes/manifest.
        // The SDK runtime discovers classes decorated with appropriate attributes:
        //   - FixAndVerifyCommand  (Command: Button A)
        //   - ExplainCommand       (Command: Button B)
        //   - ModeAdjustment       (Adjustment: Dial/Ring)
    }

    /// <summary>
    /// Called when the plugin is being unloaded.
    /// </summary>
    public void Dispose()
    {
        Console.WriteLine("[CursorPilot] Plugin disposed");
    }
}
