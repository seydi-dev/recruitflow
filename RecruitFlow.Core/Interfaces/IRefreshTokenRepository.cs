using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task AddAsync(RefreshToken token, CancellationToken ct = default);
    Task RevokeAllForUserAsync(Guid userId, string? revokedByIp, CancellationToken ct = default);
}
