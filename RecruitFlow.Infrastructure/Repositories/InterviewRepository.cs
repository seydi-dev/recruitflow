using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Repositories;

public class InterviewRepository(AppDbContext context) : IInterviewRepository
{
    public async Task<IEnumerable<Interview>> GetAllAsync(CancellationToken ct = default) =>
        await context.Interviews
            .Include(i => i.Interviewer)
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .Include(i => i.Evaluation)
            .AsNoTracking()
            .OrderBy(i => i.ScheduledAt)
            .ToListAsync(ct);

    public async Task<Interview?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await context.Interviews
            .Include(i => i.Interviewer)
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .Include(i => i.Evaluation)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<IEnumerable<Interview>> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default) =>
        await context.Interviews
            .Include(i => i.Interviewer)
            .Include(i => i.Evaluation)
            .AsNoTracking()
            .Where(i => i.ApplicationId == applicationId)
            .OrderBy(i => i.ScheduledAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Interview>> GetUpcomingByInterviewerAsync(Guid interviewerId, CancellationToken ct = default) =>
        await context.Interviews
            .Include(i => i.Application).ThenInclude(a => a.Candidate)
            .Include(i => i.Application).ThenInclude(a => a.Job)
            .AsNoTracking()
            .Where(i => i.InterviewerId == interviewerId
                     && i.ScheduledAt >= DateTime.UtcNow
                     && i.Status == InterviewStatus.Scheduled)
            .OrderBy(i => i.ScheduledAt)
            .ToListAsync(ct);

    public async Task AddAsync(Interview interview, CancellationToken ct = default)
    {
        interview.Id = Guid.NewGuid();
        context.Interviews.Add(interview);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Interview interview, CancellationToken ct = default)
    {
        context.Interviews.Update(interview);
        await context.SaveChangesAsync(ct);
    }

}
