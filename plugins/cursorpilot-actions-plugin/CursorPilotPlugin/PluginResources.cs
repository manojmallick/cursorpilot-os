namespace Loupedeck.CursorPilotPlugin
{
    using System;
    using System.Reflection;

    // Helper for resolving image/resource files embedded in the plugin assembly.
    // Resource files must have a Build Action of "Embedded Resource".
    internal static class PluginResources
    {
        private static Assembly _assembly;

        public static void Init(Assembly assembly)
        {
            assembly.CheckNullArgument(nameof(assembly));
            PluginResources._assembly = assembly;
        }

        public static String FindFile(String fileName) => PluginResources._assembly.FindFileOrThrow(fileName);

        public static BitmapImage ReadImage(String resourceName) => PluginResources._assembly.ReadImage(PluginResources.FindFile(resourceName));
    }
}
