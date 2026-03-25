using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RecruitFlow.Core.DTOs.Auth;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IRefreshTokenRepository _refreshRepo;
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(
        IUserRepository userRepo,
        IRefreshTokenRepository refreshRepo,
        AppDbContext context,
        IConfiguration config)
    {
        _userRepo = userRepo;
        _refreshRepo = refreshRepo;
        _context = context;
        _config = config;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ip, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        return await GenerateAuthResponseAsync(user, ip, ct);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ip, CancellationToken ct = default)
    {
        var exists = await _userRepo.GetByEmailAsync(request.Email, ct);
        if (exists != null)
            throw new InvalidOperationException("Email already in use");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role
        };

        await _userRepo.AddAsync(user, ct);
        await _context.SaveChangesAsync(ct);

        return await GenerateAuthResponseAsync(user, ip, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string rawToken, string? ip, CancellationToken ct = default)
    {
        var hashed = HashToken(rawToken);
        var stored = await _refreshRepo.GetByTokenAsync(hashed, ct)
            ?? throw new UnauthorizedAccessException("Invalid refresh token");

        if (!stored.IsActive)
            throw new UnauthorizedAccessException("Refresh token expired or revoked");

        stored.RevokedAt = DateTime.UtcNow;
        stored.RevokedByIp = ip;
        await _context.SaveChangesAsync(ct);

        return await GenerateAuthResponseAsync(stored.User, ip, ct);
    }

    public async Task RevokeAsync(string rawToken, string? ip, CancellationToken ct = default)
    {
        var hashed = HashToken(rawToken);
        var stored = await _refreshRepo.GetByTokenAsync(hashed, ct)
            ?? throw new UnauthorizedAccessException("Invalid refresh token");

        stored.RevokedAt = DateTime.UtcNow;
        stored.RevokedByIp = ip;
        await _context.SaveChangesAsync(ct);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user, string? ip, CancellationToken ct)
    {
        var accessToken = GenerateAccessToken(user);
        var expiry = DateTime.UtcNow.AddMinutes(15);

        var rawRefresh = GenerateRawRefreshToken();
        var refreshEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = HashToken(rawRefresh),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = ip,
            UserId = user.Id
        };

        await _refreshRepo.AddAsync(refreshEntity, ct);
        await _context.SaveChangesAsync(ct);

        return new AuthResponse(
            AccessToken: accessToken,
            RefreshToken: rawRefresh,
            AccessTokenExpiry: expiry,
            User: new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role.ToString())        );
    }

    private string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRawRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
