using Microsoft.EntityFrameworkCore;
using ReminderApp.Api.Data;
using ReminderApp.Api.Services;

namespace ReminderApp.Api.BackgroundJobs;

public class ReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReminderBackgroundService> _logger;

    public ReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<ReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderBackgroundService started running.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDueRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred processing reminder background jobs.");
            }

            // Run once per day (or adjust to an hourly check)
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task ProcessDueRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var thirtyDaysLater = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));

        // 1. Process Pending Bills Due Tomorrow
        var dueBills = await context.Bills
            .Include(b => b.User)
            .Where(b => b.DueDate == tomorrow && (int)b.Status == 0 && !b.ReminderSent)
            .ToListAsync();

        foreach (var bill in dueBills)
        {
            var subject = $"Payment Reminder: {bill.Title} is due tomorrow";
            var text = $"Hello, your bill '{bill.Title}' for ₹{bill.Amount:F2} is due on {bill.DueDate}. Please pay before the due date.";
            var html = $"<h3>Bill Reminder</h3><p>Your bill <strong>{bill.Title}</strong> for <strong>₹{bill.Amount:F2}</strong> is due tomorrow (<strong>{bill.DueDate}</strong>).</p>";

            if (!string.IsNullOrEmpty(bill.User?.Email))
            {
                await notifications.SendEmailAsync(bill.User.Email, subject, text, html);
            }

            if (!string.IsNullOrEmpty(bill.User?.PhoneNumber))
            {
                await notifications.SendSmsAsync(bill.User.PhoneNumber, text);
            }

            bill.ReminderSent = true;
        }

        // 2. Process Warranties Expiring in 30 Days
        var expiringWarranties = await context.Warranties
            .Include(w => w.User)
            .Where(w => w.ExpiryDate == thirtyDaysLater && !w.ReminderSent)
            .ToListAsync();

        foreach (var warranty in expiringWarranties)
        {
            var subject = $"Warranty Alert: {warranty.ItemName} expires in 30 days";
            var text = $"Hello, the warranty for '{warranty.ItemName}' expires on {warranty.ExpiryDate}. Make sure to inspect the product or service it if needed.";
            var html = $"<h3>Warranty Expiry Notice</h3><p>Your product <strong>{warranty.ItemName}</strong> has an active warranty expiring on <strong>{warranty.ExpiryDate}</strong>.</p>";

            if (!string.IsNullOrEmpty(warranty.User?.Email))
            {
                await notifications.SendEmailAsync(warranty.User.Email, subject, text, html);
            }

            if (!string.IsNullOrEmpty(warranty.User?.PhoneNumber))
            {
                await notifications.SendSmsAsync(warranty.User.PhoneNumber, text);
            }

            warranty.ReminderSent = true;
        }

        if (dueBills.Any() || expiringWarranties.Any())
        {
            await context.SaveChangesAsync();
            _logger.LogInformation("Dispatched {BillCount} bill reminders and {WarrantyCount} warranty alerts.", dueBills.Count, expiringWarranties.Count);
        }
    }
}