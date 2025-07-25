using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace fx_backend.Controllers
{
    public class ExternalServiceHealthCheck : IHealthCheck
    {
        // Inject any services needed for the health check here
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ExternalServiceHealthCheck> _logger;

        public ExternalServiceHealthCheck(IHttpClientFactory httpClientFactory, ILogger<ExternalServiceHealthCheck> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Simulate checking an external API or service
                // Replace with actual logic to check your external dependencies
                var client = _httpClientFactory.CreateClient();
                // Example: Ping a well-known external service (replace with your actual dependency)
                var response = await client.GetAsync("https://www.google.com", cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return HealthCheckResult.Healthy("External service (Google) is reachable.");
                }
                else
                {
                    _logger.LogWarning("External service check failed with status code: {StatusCode}", response.StatusCode);
                    return HealthCheckResult.Degraded($"External service (Google) returned status {response.StatusCode}.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking external service health.");
                return HealthCheckResult.Unhealthy($"Failed to reach external service: {ex.Message}");
            }
        }
    }
    // --- END Health Checks Configuration ---
}
