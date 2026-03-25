using RecruitFlow.Core.DTOs.Dashboard;

namespace RecruitFlow.Core.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default);
}
