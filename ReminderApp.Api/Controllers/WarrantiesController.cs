using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using ReminderApp.Api.Data;
using ReminderApp.Api.DTOs;
using ReminderApp.Api.Models;
using ReminderApp.Api.Services;

namespace ReminderApp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WarrantiesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly IDistributedCache _cache;

    public WarrantiesController(
        AppDbContext context,
        IFileStorageService fileStorage,
        IDistributedCache cache)
    {
        _context = context;
        _fileStorage = fileStorage;
        _cache = cache;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarrantyResponse>>> GetUserWarranties()
    {
        var userId = GetCurrentUserId();
        var warranties = await _context.Warranties
            .Where(w => w.UserId == userId)
            .OrderBy(w => w.ExpiryDate)
            .Select(w => new WarrantyResponse(
                w.Id,
                w.ItemName,
                w.Category,
                w.PurchaseDate,
                w.ExpiryDate,
                w.InvoicePhotoUrl,
                w.ItemPhotoUrl,
                w.Notes,
                w.ReminderSent
            ))
            .ToListAsync();

        return Ok(warranties);
    }

    [HttpPost]
    public async Task<ActionResult<WarrantyResponse>> CreateWarranty([FromBody] CreateWarrantyRequest request)
    {
        var userId = GetCurrentUserId();

        var warranty = new Warranty
        {
            UserId = userId,
            ItemName = request.ItemName,
            Category = request.Category,
            PurchaseDate = request.PurchaseDate,
            ExpiryDate = request.ExpiryDate,
            Notes = request.Notes,
            ReminderSent = false
        };

        _context.Warranties.Add(warranty);
        await _context.SaveChangesAsync();

        // Invalidate Redis search cache
        await _cache.RemoveAsync($"search:{userId}");

        return Ok(new WarrantyResponse(
            warranty.Id,
            warranty.ItemName,
            warranty.Category,
            warranty.PurchaseDate,
            warranty.ExpiryDate,
            warranty.InvoicePhotoUrl,
            warranty.ItemPhotoUrl,
            warranty.Notes,
            warranty.ReminderSent
        ));
    }

    [HttpPost("{id:guid}/upload-photos")]
    public async Task<IActionResult> UploadPhotos(
        Guid id,
        [FromForm] IFormFile? invoicePhoto,
        [FromForm] IFormFile? itemPhoto)
    {
        var userId = GetCurrentUserId();
        var warranty = await _context.Warranties.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
        if (warranty == null)
        {
            return NotFound(new { message = "Warranty item not found." });
        }

        if (invoicePhoto != null && invoicePhoto.Length > 0)
        {
            var invoicePath = await _fileStorage.SaveFileAsync(invoicePhoto, "warranties");
            warranty.InvoicePhotoUrl = invoicePath;
        }

        if (itemPhoto != null && itemPhoto.Length > 0)
        {
            var itemPath = await _fileStorage.SaveFileAsync(itemPhoto, "warranties");
            warranty.ItemPhotoUrl = itemPath;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            invoiceUrl = warranty.InvoicePhotoUrl,
            itemUrl = warranty.ItemPhotoUrl
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWarranty(Guid id)
    {
        var userId = GetCurrentUserId();

        var warranty = await _context.Warranties
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

        if (warranty == null) return NotFound(new { message = "Warranty not found" });

        // 1. Delete physical files from disk
        if (!string.IsNullOrEmpty(warranty.InvoicePhotoUrl))
        {
            _fileStorage.DeleteFileAsync(warranty.InvoicePhotoUrl);
        }

        if (!string.IsNullOrEmpty(warranty.ItemPhotoUrl))
        {
            _fileStorage.DeleteFileAsync(warranty.ItemPhotoUrl);
        }

        // 2. Remove entity from PostgreSQL
        _context.Warranties.Remove(warranty);
        await _context.SaveChangesAsync();

        // 3. Clear Redis search cache for this user
        await _cache.RemoveAsync($"search:{userId}");

        return NoContent(); // 204 No Content
    }
}