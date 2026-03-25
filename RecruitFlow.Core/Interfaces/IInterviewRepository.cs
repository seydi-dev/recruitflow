using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.Interfaces;

public interface IInterviewRepository
{
    Task<IEnumerable<Interview>> GetAllAsync(CancellationToken ct = default);
    Task<Interview?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Interview>> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default);
    Task<IEnumerable<Interview>> GetUpcomingByInterviewerAsync(Guid interviewerId, CancellationToken ct = default);
    Task AddAsync(Interview interview, CancellationToken ct = default);
    Task UpdateAsync(Interview interview, CancellationToken ct = default);
}