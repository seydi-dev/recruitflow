using RecruitFlow.Core.DTOs.Applications;
using RecruitFlow.Core.DTOs.Common;
using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.Interfaces;

public interface IApplicationService
{
    Task<PagedResult<ApplicationDto>> GetApplicationsAsync(ApplicationQueryParams query, CancellationToken ct = default);
    Task<ApplicationDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ApplicationDto> CreateAsync(CreateApplicationDto dto, Guid candidateId, CancellationToken ct = default);
    Task<ApplicationDto> UpdateStatusAsync(Guid id, ApplicationStatus status, CancellationToken ct = default);
    Task WithdrawAsync(Guid id, Guid candidateId, CancellationToken ct = default);
}
