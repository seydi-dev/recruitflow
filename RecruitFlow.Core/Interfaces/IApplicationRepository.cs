using RecruitFlow.Core.DTOs.Applications;
using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.Interfaces;

public interface IApplicationRepository
{
    Task<Application?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Application>> GetAllAsync(ApplicationQueryParams query, CancellationToken ct = default);
    Task<int> CountAsync(ApplicationQueryParams query, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid jobId, Guid candidateId, CancellationToken ct = default);
    Task AddAsync(Application application, CancellationToken ct = default);
    Task UpdateAsync(Application application, CancellationToken ct = default);
}
