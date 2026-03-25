using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.DTOs.Applications;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Repositories;

public class ApplicationRepository(AppDbContext context) : IApplicationRepository
{
    public async Task<Application?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .Include(a => a.Interviews)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<IEnumerable<Application>> GetAllAsync(ApplicationQueryParams query, CancellationToken ct = default)
    {
        var q = context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .Include(a => a.Interviews)
            .AsNoTracking()
            .AsQueryable();

        if (query.JobId.HasValue)       q = q.Where(a => a.JobId == query.JobId);
        if (query.CandidateId.HasValue) q = q.Where(a => a.CandidateId == query.CandidateId);
        if (query.Status.HasValue)      q = q.Where(a => a.Status == query.Status);

        return await q
            .OrderByDescending(a => a.AppliedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(ApplicationQueryParams query, CancellationToken ct = default)
    {
        var q = context.Applications.AsQueryable();
        if (query.JobId.HasValue)       q = q.Where(a => a.JobId == query.JobId);
        if (query.CandidateId.HasValue) q = q.Where(a => a.CandidateId == query.CandidateId);
        if (query.Status.HasValue)      q = q.Where(a => a.Status == query.Status);
        return await q.CountAsync(ct);
    }

    public async Task<bool> ExistsAsync(Guid jobId, Guid candidateId, CancellationToken ct = default) =>
        await context.Applications.AnyAsync(a => a.JobId == jobId && a.CandidateId == candidateId, ct);

    public async Task AddAsync(Application application, CancellationToken ct = default)
    {
        application.Id = Guid.NewGuid();
        application.AppliedAt = DateTime.UtcNow;
        context.Applications.Add(application);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Application application, CancellationToken ct = default)
    {
        context.Applications.Update(application);
        await context.SaveChangesAsync(ct);
    }
}
