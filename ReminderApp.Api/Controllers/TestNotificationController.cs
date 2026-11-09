using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReminderApp.Api.Services;

namespace ReminderApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestNotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<TestNotificationController> _logger;

    public TestNotificationController(
        INotificationService notificationService,
        ILogger<TestNotificationController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }
    
    [HttpPost("send-test-email")]
    [AllowAnonymous] // Keep anonymous for quick manual or Bruno/Postman testing
    public async Task<IActionResult> SendTestEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Recipient email is required." });
        }

        var subject = "ReminderApp: Test Alert Notification";
        var plainText = "This is a direct test dispatch from ReminderApp verifying SMTP connectivity.";
        var htmlContent = @"
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #2563eb;'>ReminderApp Test Notification</h2>
                <p>Your email service via Gmail SMTP is operating properly.</p>
                <p style='color: #6b7280; font-size: 12px;'>Dispatched at: " + DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC") + @"</p>
            </div>";

        await _notificationService.SendEmailAsync(email, subject, plainText, htmlContent);

        return Ok(new { message = $"Test email triggered for {email}. Check your inbox and terminal logs." });
    }
    [HttpPost("test-email")]
    public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
    {
        _logger.LogInformation("Sending test email to {Email}", request.ToEmail);

        var subject = "Smart Reminder - Test Email Notification";
        var plainText = "This is a test notification from your ReminderApp backend.";
        var htmlContent = "<h3>Smart Reminder Alert</h3><p>This is a <strong>test notification</strong> verifying your SendGrid configuration.</p>";

        await _notificationService.SendEmailAsync(request.ToEmail, subject, plainText, htmlContent);
        return Ok(new { message = $"Email dispatch attempted for {request.ToEmail}" });
    }

    [HttpPost("test-sms")]
    public async Task<IActionResult> TestSms([FromBody] TestSmsRequest request)
    {
        _logger.LogInformation("Sending test SMS to {PhoneNumber}", request.ToPhoneNumber);

        var message = "Smart Reminder: This is a test SMS alert verifying your Twilio integration.";

        await _notificationService.SendSmsAsync(request.ToPhoneNumber, message);
        return Ok(new { message = $"SMS dispatch attempted for {request.ToPhoneNumber}" });
    }
}

public record TestEmailRequest(string ToEmail);
public record TestSmsRequest(string ToPhoneNumber);