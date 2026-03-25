using RecruitFlow.Core.DTOs.Common;
using RecruitFlow.Core.DTOs.Jobs;
using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.Interfaces;

public interface IJobService
{
    Task<PagedResult<JobDto>> GetJobsAsync(JobQueryParams query, CancellationToken ct = default);
    Task<IEnumerable<JobDto>> GetPublishedAsync(CancellationToken ct = default);
    Task<JobDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<JobDto> CreateAsync(CreateJobDto dto, Guid createdByUserId, CancellationToken ct = default);
    Task<JobDto> UpdateAsync(Guid id, UpdateJobDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<JobDto> UpdateStatusAsync(Guid id, JobStatus status, CancellationToken ct = default);
}
