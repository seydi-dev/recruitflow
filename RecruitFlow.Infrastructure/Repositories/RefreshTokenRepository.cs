using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _context;

    public RefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default)
        => await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token, ct);

    public async Task AddAsync(RefreshToken token, CancellationToken ct = default)
        => await _context.RefreshTokens.AddAsync(token, ct);

    public async Task RevokeAllForUserAsync(Guid userId, string? revokedByIp, CancellationToken ct = default)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ToListAsync(ct);

        foreach (var token in tokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = revokedByIp;
        }
    }
}
