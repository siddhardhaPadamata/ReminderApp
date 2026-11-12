using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReminderApp.Api.Data;
using ReminderApp.Api.DTOs;
using ReminderApp.Api.Models;
using ReminderApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
namespace ReminderApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) && string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            return BadRequest(new { message = "At least one of Email or Phone Number is required." });
        }

        var userExists = await _context.Users.AnyAsync(u =>
            (!string.IsNullOrEmpty(request.Email) && u.Email == request.Email) ||
            (!string.IsNullOrEmpty(request.PhoneNumber) && u.PhoneNumber == request.PhoneNumber));

        if (userExists)
            return Conflict(new { message = "A user with this Email or Phone already exists." });

        var user = new User
        {
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.SaveRefreshTokenAsync(user.Id, refreshToken);

        return Ok(new AuthResponse(user.Id, user.Email, user.PhoneNumber, accessToken, refreshToken));
    }
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Email == request.Identifier || u.PhoneNumber == request.Identifier);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.SaveRefreshTokenAsync(user.Id, refreshToken);

        return Ok(new AuthResponse(user.Id, user.Email, user.PhoneNumber, accessToken, refreshToken));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var isValid = await _tokenService.ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
        if (!isValid)
            return Unauthorized(new { message = "Invalid or expired refresh token." });

        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null)
            return Unauthorized(new { message = "User not found." });

        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.SaveRefreshTokenAsync(user.Id, newRefreshToken);

        return Ok(new AuthResponse(user.Id, user.Email, user.PhoneNumber, newAccessToken, newRefreshToken));
    }

    [HttpPost("logout/{userId:guid}")]
    public async Task<IActionResult> Logout(Guid userId)
    {
        await _tokenService.RevokeRefreshTokenAsync(userId);
        return NoContent();
    }
}