// ModeAdjustment — an Adjustment the user assigns to the dial/ring on the Logitech device.
// Rotations cycle through repair modes: SAFE -> PERF -> SEC -> REFACTOR.

namespace Loupedeck.CursorPilotPlugin
{
    using System;

    /// <summary>
    /// Adjustment action "Mode Selector". Rotating the dial cycles through CursorPilot
    /// repair modes and pushes the active mode to <c>POST /api/mode</c> over the bridge.
    /// The current mode is shown next to the dial.
    /// </summary>
    public class ModeAdjustment : PluginDynamicAdjustment
    {
        private static readonly String[] Modes = { "SAFE", "PERF", "SEC", "REFACTOR" };
        private Int32 _currentIndex = 0;
        private readonly LocalhostBridgeClient _bridge = new LocalhostBridgeClient();

        public ModeAdjustment()
            : base(displayName: "Mode Selector",
                   description: "Rotate to cycle modes: Safe, Performance, Security, Refactor",
                   groupName: "CursorPilot",
                   hasReset: true)
        {
        }

        protected override void ApplyAdjustment(String actionParameter, Int32 diff)
        {
            // Wrap the index in both directions.
            this._currentIndex = (((this._currentIndex + diff) % Modes.Length) + Modes.Length) % Modes.Length;
            this.PushMode();
        }

        // Reset returns to the first (SAFE) mode.
        protected override void RunCommand(String actionParameter)
        {
            this._currentIndex = 0;
            this.PushMode();
        }

        protected override String GetAdjustmentValue(String actionParameter) => Modes[this._currentIndex];

        private void PushMode()
        {
            var mode = Modes[this._currentIndex];
            this.AdjustmentValueChanged();
            PluginLog.Info("Mode adjustment: " + mode);

            _ = _bridge.SetModeAsync(mode).ContinueWith(t =>
            {
                if (t.IsFaulted)
                {
                    PluginLog.Error(t.Exception, "Mode adjustment failed");
                }
                else
                {
                    PluginLog.Info("Mode set to: " + mode);
                }
            });
        }
    }
}
