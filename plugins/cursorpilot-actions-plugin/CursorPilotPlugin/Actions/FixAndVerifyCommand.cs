// FixAndVerifyCommand — a Command the user assigns to a button on the Logitech device.
// Triggers the full AI patch pipeline: test -> collect -> Gemini -> validate -> apply -> retest.

namespace Loupedeck.CursorPilotPlugin
{
    using System;

    /// <summary>
    /// Command action "Fix &amp; Verify". When the assigned button is pressed, it calls the
    /// CursorPilot Engine's <c>POST /api/fix</c> endpoint over the localhost bridge.
    /// </summary>
    public class FixAndVerifyCommand : PluginDynamicCommand
    {
        private readonly LocalhostBridgeClient _bridge = new LocalhostBridgeClient();

        public FixAndVerifyCommand()
            : base(displayName: "Fix & Verify",
                   description: "Run the AI patch pipeline: detect failures, generate a fix, validate, apply, and re-verify",
                   groupName: "CursorPilot")
        {
        }

        protected override void RunCommand(String actionParameter)
        {
            PluginLog.Info("Fix & Verify command triggered");

            // RunCommand must return promptly; run the bridge call off the UI thread.
            _ = _bridge.FixAsync().ContinueWith(t =>
            {
                if (t.IsFaulted)
                {
                    PluginLog.Error(t.Exception, "Fix command failed");
                }
                else
                {
                    PluginLog.Info("Fix result: " + t.Result);
                }
            });
        }
    }
}
