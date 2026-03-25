using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.DTOs.Jobs;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Repositories;

public class JobRepository(AppDbContext context) : IJobRepository
{
    public async Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await context.Jobs
            .Include(j => j.CreatedByUser)
            .Include(j => j.Applications)
            .AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == id, ct);

    public async Task<IEnumerable<Job>> GetPublishedAsync(CancellationToken ct = default) =>
        await context.Jobs
            .Include(j => j.CreatedByUser)
            .Include(j => j.Applications)
            .AsNoTracking()
            .Where(j => j.Status == JobStatus.Published)
            .OrderByDescending(j => j.PostedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Job>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default) =>
        await context.Jobs
            .Include(j => j.Applications)
            .AsNoTracking()
            .Where(j => j.CreatedByUserId == recruiterId)
            .OrderByDescending(j => j.PostedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Job>> GetAllAsync(JobQueryParams query, CancellationToken ct = default)
    {
        var q = context.Jobs
            .Include(j => j.CreatedByUser)
            .Include(j => j.Applications)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(j => j.Title.Contains(query.Search) || j.Department.Contains(query.Search));

        if (!string.IsNullOrWhiteSpace(query.Department))
            q = q.Where(j => j.Department == query.Department);

        return await q
            .OrderByDescending(j => j.PostedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(JobQueryParams query, CancellationToken ct = default)
    {
        var q = context.Jobs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(j => j.Title.Contains(query.Search) || j.Department.Contains(query.Search));
        if (!string.IsNullOrWhiteSpace(query.Department))
            q = q.Where(j => j.Department == query.Department);
        return await q.CountAsync(ct);
    }

    public async Task AddAsync(Job job, CancellationToken ct = default)
    {
        job.Id = Guid.NewGuid();
        job.PostedAt = DateTime.UtcNow;
        context.Jobs.Add(job);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Job job, CancellationToken ct = default)
    {
        context.Jobs.Update(job);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default) =>
        await context.Jobs.AnyAsync(j => j.Id == id, ct);
}
