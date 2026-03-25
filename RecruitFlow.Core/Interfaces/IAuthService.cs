using RecruitFlow.Core.DTOs.Auth;

namespace RecruitFlow.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default);
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(string refreshToken, string? ipAddress, CancellationToken ct = default);
    Task RevokeAsync(string refreshToken, string? ipAddress, CancellationToken ct = default);
}
