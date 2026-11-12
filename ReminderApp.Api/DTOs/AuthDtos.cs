using System.ComponentModel.DataAnnotations;
namespace ReminderApp.Api.DTOs
{
    public record RegisterRequest(
        string? Email,
        string? PhoneNumber,
        [Required] string Password);

    public record LoginRequest(
        string Identifier,
        [Required] string Password);

    public record AuthResponse(
        Guid UserId,
        string? Email,
        string? PhoneNuber,
        string AccessToken,
        string RefreshToken);
    public record RefreshTokenRequest(
        Guid UserId,
        string RefreshToken);
}
