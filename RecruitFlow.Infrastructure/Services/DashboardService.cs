using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.DTOs.Dashboard;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Services;

public class DashboardService(AppDbContext context) : IDashboardService
{
    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var weekStart = now.AddDays(-(int)now.DayOfWeek);

        // Séquentiel — EF Core DbContext n'est pas thread-safe
        var totalJobs        = await context.Jobs.CountAsync(ct);
        var activeJobs       = await context.Jobs.CountAsync(j => j.Status == JobStatus.Published, ct);
        var totalApps        = await context.Applications.CountAsync(ct);
        var pendingApps      = await context.Applications.CountAsync(a => a.Status == ApplicationStatus.Pending, ct);
        var interviewsWeek   = await context.Interviews.CountAsync(i => i.ScheduledAt >= weekStart && i.Status == InterviewStatus.Scheduled, ct);
        var offersExtended   = await context.Applications.CountAsync(a => a.Status == ApplicationStatus.Offer, ct);

        var byStatus = await context.Applications
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync(ct);

        var topJobs = await context.Jobs
            .Select(j => new JobApplicationCountDto { JobTitle = j.Title, Count = j.Applications.Count })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(ct);

        return new DashboardStatsDto
        {
            TotalJobs            = totalJobs,
            ActiveJobs           = activeJobs,
            TotalApplications    = totalApps,
            PendingApplications  = pendingApps,
            InterviewsThisWeek   = interviewsWeek,
            OffersExtended       = offersExtended,
            ApplicationsByStatus = byStatus.ToDictionary(x => x.Status, x => x.Count),
            TopJobs              = topJobs
        };
    }
}
