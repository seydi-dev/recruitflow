using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.DTOs.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    UserRole Role = UserRole.Candidate
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiry,
    UserDto User
);

public record RefreshRequest(string RefreshToken);
public record RevokeRequest(string RefreshToken);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role
);
