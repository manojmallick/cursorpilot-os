// ExplainCommand — Maps to Button B on the Logitech device.
// Asks the AI to explain what's wrong without applying a fix.

namespace CursorPilotPlugin.Actions;

using CursorPilotPlugin.Bridge;

/// <summary>
/// Command action: "Explain"
/// When the user presses the assigned button on the Logitech device,
/// this command calls the CursorPilot Engine's /api/explain endpoint.
/// </summary>
public class ExplainCommand
{
    private readonly LocalhostBridgeClient _bridge;

    public ExplainCommand()
    {
        _bridge = new LocalhostBridgeClient();
    }

    /// <summary>
    /// Called by the Actions SDK when the mapped button is pressed.
    /// </summary>
    public async Task ExecuteAsync()
    {
        Console.WriteLine("[CursorPilot] Explain command triggered");

        try
        {
            var result = await _bridge.ExplainAsync();
            Console.WriteLine("[CursorPilot] Explain result: " + result);
        }
        catch (Exception ex)
        {
            Console.WriteLine("[CursorPilot] Explain command failed: " + ex.Message);
        }
    }
}
