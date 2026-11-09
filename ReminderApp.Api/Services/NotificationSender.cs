using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace ReminderApp.Api.Services;

public class NotificationService : INotificationService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IConfiguration configuration, ILogger<NotificationService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string plainTextMessage, string htmlMessage)
    {
        try
        {
            var email = new MimeMessage();

            var fromName = _configuration["Smtp:FromName"] ?? "ReminderApp";
            var fromEmail = _configuration["Smtp:Username"];

            email.From.Add(new MailboxAddress(fromName, fromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder
            {
                TextBody = plainTextMessage,
                HtmlBody = htmlMessage
            };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();

            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.Parse(_configuration["Smtp:Port"] ?? "587");
            var username = _configuration["Smtp:Username"];
            var password = _configuration["Smtp:Password"];

            // Connect over STARTTLS on port 587
            await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(username, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Email notification sent successfully to {Email} via Gmail SMTP", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} via Gmail SMTP", toEmail);
        }
    }

    public async Task SendSmsAsync(string toPhoneNumber, string message)
    {
        try
        {
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            var fromNumber = _configuration["Twilio:FromPhoneNumber"];

            _logger.LogInformation("Twilio config check: SID present={HasSid} (starts with '{SidPrefix}', length {SidLength}), AuthToken present={HasToken}, FromNumber={From}",
                !string.IsNullOrWhiteSpace(accountSid),
                accountSid?.Length >= 4 ? accountSid.Substring(0, 4) : "NONE",
                accountSid?.Length ?? 0,
                !string.IsNullOrWhiteSpace(authToken),
                fromNumber ?? "NONE");

            if (string.IsNullOrWhiteSpace(accountSid) || string.IsNullOrWhiteSpace(authToken) || string.IsNullOrWhiteSpace(fromNumber))
            {
                _logger.LogWarning("Twilio credentials missing. Skipping SMS dispatch.");
                return;
            }

            TwilioClient.Init(accountSid.Trim(), authToken.Trim());

            // Format Indian mobile numbers into standard E.164 (+91)
            var cleanDigits = new string(toPhoneNumber.Where(char.IsDigit).ToArray());
            var formattedNumber = cleanDigits.Length == 10
                ? "+91" + cleanDigits
                : (cleanDigits.Length == 12 && cleanDigits.StartsWith("91") ? "+" + cleanDigits : "+" + cleanDigits);

            var response = await MessageResource.CreateAsync(
                to: new PhoneNumber(formattedNumber),
                from: new PhoneNumber(fromNumber.Trim()),
                body: message
            );

            _logger.LogInformation("Twilio SMS sent to {Phone} (SID: {Sid})", formattedNumber, response.Sid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Twilio SMS dispatch failed for {Phone}", toPhoneNumber);
        }
    }
}