// ExplainCommand — a Command the user assigns to a button on the Logitech device.
// Asks the AI to explain what's wrong without applying a fix.

namespace Loupedeck.CursorPilotPlugin
{
    using System;

    /// <summary>
    /// Command action "Explain Issue". When the assigned button is pressed, it calls the
    /// CursorPilot Engine's <c>POST /api/explain</c> endpoint over the localhost bridge.
    /// </summary>
    public class ExplainCommand : PluginDynamicCommand
    {
        private readonly LocalhostBridgeClient _bridge = new LocalhostBridgeClient();

        public ExplainCommand()
            : base(displayName: "Explain Issue",
                   description: "Ask the AI to explain the current test/lint failures",
                   groupName: "CursorPilot")
        {
        }

        protected override void RunCommand(String actionParameter)
        {
            PluginLog.Info("Explain command triggered");

            _ = _bridge.ExplainAsync().ContinueWith(t =>
            {
                if (t.IsFaulted)
                {
                    PluginLog.Error(t.Exception, "Explain command failed");
                }
                else
                {
                    PluginLog.Info("Explain result: " + t.Result);
                }
            });
        }
    }
}
