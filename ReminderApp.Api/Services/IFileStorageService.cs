namespace ReminderApp.Api.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string subFolder);
    bool DeleteFileAsync(string? relativePath);
}