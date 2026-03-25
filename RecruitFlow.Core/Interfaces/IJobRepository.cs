using RecruitFlow.Core.DTOs.Jobs;
using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.Interfaces;

public interface IJobRepository
{
    Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Job>> GetPublishedAsync(CancellationToken ct = default);
    Task<IEnumerable<Job>> GetByRecruiterAsync(Guid recruiterId, CancellationToken ct = default);
    Task<IEnumerable<Job>> GetAllAsync(JobQueryParams query, CancellationToken ct = default);
    Task<int> CountAsync(JobQueryParams query, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Job job, CancellationToken ct = default);
    Task UpdateAsync(Job job, CancellationToken ct = default);
}
