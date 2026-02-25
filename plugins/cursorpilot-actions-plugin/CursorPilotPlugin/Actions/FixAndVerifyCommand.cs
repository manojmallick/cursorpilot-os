// FixAndVerifyCommand — Maps to Button A on the Logitech device.
// Triggers the full AI patch pipeline: test → collect → Gemini → validate → apply → retest.

namespace CursorPilotPlugin.Actions;

using CursorPilotPlugin.Bridge;

/// <summary>
/// Command action: "Fix & Verify"
/// When the user presses the assigned button on the Logitech device,
/// this command calls the CursorPilot Engine's /api/fix endpoint.
/// The engine runs the full AI-powered fix pipeline and returns evidence.
/// </summary>
public class FixAndVerifyCommand
{
    private readonly LocalhostBridgeClient _bridge;

    public FixAndVerifyCommand()
    {
        _bridge = new LocalhostBridgeClient();
    }

    /// <summary>
    /// Called by the Actions SDK when the mapped button is pressed.
    /// </summary>
    public async Task ExecuteAsync()
    {
        Console.WriteLine("[CursorPilot] Fix & Verify command triggered");

        try
        {
            var result = await _bridge.FixAsync();
            Console.WriteLine("[CursorPilot] Fix result status: " + result);
        }
        catch (Exception ex)
        {
            Console.WriteLine("[CursorPilot] Fix command failed: " + ex.Message);
        }
    }
}
