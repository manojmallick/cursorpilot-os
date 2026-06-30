namespace Loupedeck.CursorPilotPlugin
{
    using System;

    // A helper class that forwards plugin log messages to the SDK-provided logger.
    internal static class PluginLog
    {
        private static PluginLogFile _logFile;

        public static void Init(PluginLogFile logFile) => PluginLog._logFile = logFile;

        public static void Verbose(String text) => PluginLog._logFile?.Verbose(text);

        public static void Info(String text) => PluginLog._logFile?.Info(text);

        public static void Warning(String text) => PluginLog._logFile?.Warning(text);

        public static void Error(String text) => PluginLog._logFile?.Error(text);

        public static void Error(Exception ex, String text) => PluginLog._logFile?.Error(ex, text);
    }
}
