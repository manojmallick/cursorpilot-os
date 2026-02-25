// LocalhostBridgeClient — HTTP client for communicating with the CursorPilot Engine.
// The engine runs a bridge server at localhost:8787.

namespace CursorPilotPlugin.Bridge;

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

/// <summary>
/// HTTP client that communicates with the CursorPilot Engine bridge server.
/// All requests include the X-CursorPilot-Token header for authentication.
/// </summary>
public class LocalhostBridgeClient
{
    private readonly HttpClient _client;
    private readonly string _baseUrl;
    private readonly string _token;

    public string BaseUrl => _baseUrl;

    public LocalhostBridgeClient(
        string baseUrl = "http://localhost:8787",
        string token = "dev-only-token")
    {
        _baseUrl = baseUrl;
        _token = token;
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Add("X-CursorPilot-Token", _token);
    }

    /// <summary>
    /// Set the active mode (SAFE, PERF, SEC, REFACTOR).
    /// </summary>
    public async Task<string> SetModeAsync(string mode)
    {
        var body = JsonSerializer.Serialize(new { mode });
        var content = new StringContent(body, Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{_baseUrl}/api/mode", content);
        return await response.Content.ReadAsStringAsync();
    }

    /// <summary>
    /// Trigger the Fix & Verify pipeline.
    /// </summary>
    public async Task<string> FixAsync()
    {
        var body = JsonSerializer.Serialize(new { source = "plugin" });
        var content = new StringContent(body, Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{_baseUrl}/api/fix", content);
        return await response.Content.ReadAsStringAsync();
    }

    /// <summary>
    /// Trigger the Explain action.
    /// </summary>
    public async Task<string> ExplainAsync()
    {
        var content = new StringContent("{}", Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{_baseUrl}/api/explain", content);
        return await response.Content.ReadAsStringAsync();
    }

    /// <summary>
    /// Reset the demo repository to its broken state.
    /// </summary>
    public async Task<string> ResetAsync()
    {
        var content = new StringContent("{}", Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{_baseUrl}/api/reset", content);
        return await response.Content.ReadAsStringAsync();
    }

    /// <summary>
    /// Get the current evidence state from the engine.
    /// </summary>
    public async Task<string> GetEvidenceAsync()
    {
        var response = await _client.GetAsync($"{_baseUrl}/api/evidence");
        return await response.Content.ReadAsStringAsync();
    }
}
