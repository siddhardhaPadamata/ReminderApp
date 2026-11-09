namespace ReminderApp.Api.Services;

public interface INotificationService
{
    Task SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent);
    Task SendSmsAsync(string toPhoneNumber, string message);
}