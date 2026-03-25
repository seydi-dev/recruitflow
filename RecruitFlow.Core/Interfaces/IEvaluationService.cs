using RecruitFlow.Core.DTOs.Evaluations;

namespace RecruitFlow.Core.Interfaces;

public interface IEvaluationService
{
    Task<EvaluationDto> GetByInterviewAsync(Guid interviewId, CancellationToken ct = default);
    Task<EvaluationDto> CreateAsync(CreateEvaluationDto dto, CancellationToken ct = default);
    Task<EvaluationDto> UpdateAsync(Guid id, UpdateEvaluationDto dto, CancellationToken ct = default);
    Task<IEnumerable<EvaluationDto>> GetAllAsync(CancellationToken ct = default);
}
