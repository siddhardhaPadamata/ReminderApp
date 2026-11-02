namespace ReminderApp.Api.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalFileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string subFolder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Cannot upload an empty file.");

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var targetDir = Path.Combine(webRoot, "uploads", subFolder);

        if (!Directory.Exists(targetDir))
            Directory.CreateDirectory(targetDir);

        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(targetDir, uniqueFileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/uploads/{subFolder}/{uniqueFileName}";
    }
    public bool DeleteFileAsync(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return false;

        try
        {
            // Normalize path: trims leading slashes and combines with WebRootPath
            var trimmedPath = relativeUrl.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
            var absolutePath = Path.Combine(_env.WebRootPath, trimmedPath);

            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
                return true;
            }
        }
        catch (Exception ex)
        {
            // Log warning or exception if required
            Console.WriteLine($"Error deleting file {relativeUrl}: {ex.Message}");
        }

        return false;
    }
}