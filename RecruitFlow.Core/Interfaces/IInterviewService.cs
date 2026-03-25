using RecruitFlow.Core.DTOs.Interviews;

namespace RecruitFlow.Core.Interfaces;

public interface IInterviewService
{
    Task<IEnumerable<InterviewDto>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<InterviewDto>> GetByApplicationAsync(Guid applicationId, CancellationToken ct = default);
    Task<InterviewDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<InterviewDto> ScheduleAsync(CreateInterviewDto dto, CancellationToken ct = default);
    Task<InterviewDto> UpdateAsync(Guid id, UpdateInterviewDto dto, CancellationToken ct = default);
    Task CancelAsync(Guid id, CancellationToken ct = default);
}