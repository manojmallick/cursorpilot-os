// ModeAdjustment — Maps to the Dial/Ring on the Logitech device.
// Rotations cycle through modes: SAFE → PERF → SEC → REFACTOR.

namespace CursorPilotPlugin.Actions;

using CursorPilotPlugin.Bridge;

/// <summary>
/// Adjustment action: "Mode Selector"
/// When the user rotates the dial/ring on the Logitech device,
/// this adjustment cycles through CursorPilot modes via /api/mode.
/// </summary>
public class ModeAdjustment
{
    private static readonly string[] Modes = { "SAFE", "PERF", "SEC", "REFACTOR" };
    private int _currentIndex = 0;
    private readonly LocalhostBridgeClient _bridge;

    public ModeAdjustment()
    {
        _bridge = new LocalhostBridgeClient();
    }

    /// <summary>
    /// Called by the Actions SDK when the dial/ring is rotated.
    /// </summary>
    /// <param name="ticks">Number of rotation ticks (positive = clockwise)</param>
    public async Task AdjustAsync(int ticks)
    {
        // Cycle through modes based on rotation direction
        _currentIndex = ((_currentIndex + ticks) % Modes.Length + Modes.Length) % Modes.Length;
        var newMode = Modes[_currentIndex];

        Console.WriteLine("[CursorPilot] Mode adjustment: " + newMode);

        try
        {
            var result = await _bridge.SetModeAsync(newMode);
            Console.WriteLine("[CursorPilot] Mode set to: " + newMode);
        }
        catch (Exception ex)
        {
            Console.WriteLine("[CursorPilot] Mode adjustment failed: " + ex.Message);
        }
    }
}
