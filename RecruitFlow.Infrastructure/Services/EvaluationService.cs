using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.DTOs.Evaluations;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Services;

public class EvaluationService(AppDbContext context) : IEvaluationService
{
    public async Task<EvaluationDto> GetByInterviewAsync(Guid interviewId, CancellationToken ct = default) =>
        MapToDto(await context.Evaluations.AsNoTracking().FirstOrDefaultAsync(e => e.InterviewId == interviewId, ct)
            ?? throw new KeyNotFoundException($"Évaluation introuvable pour l'entretien {interviewId}"));

    public async Task<EvaluationDto> CreateAsync(CreateEvaluationDto dto, CancellationToken ct = default)
    {
        if (await context.Evaluations.AnyAsync(e => e.InterviewId == dto.InterviewId, ct))
            throw new InvalidOperationException("Une évaluation existe déjà pour cet entretien");

        var evaluation = new Evaluation
        {
            Id = Guid.NewGuid(), InterviewId = dto.InterviewId, TechnicalScore = dto.TechnicalScore,
            CommunicationScore = dto.CommunicationScore, CulturalFitScore = dto.CulturalFitScore,
            Comments = dto.Comments, Recommendation = dto.Recommendation, CreatedAt = DateTime.UtcNow
        };
        context.Evaluations.Add(evaluation);
        await context.SaveChangesAsync(ct);
        return MapToDto(evaluation);
    }

    public async Task<EvaluationDto> UpdateAsync(Guid id, UpdateEvaluationDto dto, CancellationToken ct = default)
    {
        var eval = await context.Evaluations.FindAsync([id], ct) ?? throw new KeyNotFoundException($"Évaluation {id} introuvable");
        if (dto.TechnicalScore.HasValue)    eval.TechnicalScore = dto.TechnicalScore.Value;
        if (dto.CommunicationScore.HasValue) eval.CommunicationScore = dto.CommunicationScore.Value;
        if (dto.CulturalFitScore.HasValue)  eval.CulturalFitScore = dto.CulturalFitScore.Value;
        if (dto.Comments is not null)       eval.Comments = dto.Comments;
        if (dto.Recommendation.HasValue)    eval.Recommendation = dto.Recommendation.Value;
        await context.SaveChangesAsync(ct);
        return MapToDto(eval);
    }
    public async Task<IEnumerable<EvaluationDto>> GetAllAsync(CancellationToken ct = default) =>
        await context.Evaluations
            .AsNoTracking()
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EvaluationDto
            {
                Id = e.Id,
                TechnicalScore = e.TechnicalScore,
                CommunicationScore = e.CommunicationScore,
                CulturalFitScore = e.CulturalFitScore,
                Comments = e.Comments,
                Recommendation = e.Recommendation.ToString(),
                CreatedAt = e.CreatedAt,
                InterviewId = e.InterviewId
            })
            .ToListAsync(ct);

    private static EvaluationDto MapToDto(Evaluation e) => new()
    {
        Id = e.Id, TechnicalScore = e.TechnicalScore, CommunicationScore = e.CommunicationScore,
        CulturalFitScore = e.CulturalFitScore, Comments = e.Comments,
        Recommendation = e.Recommendation.ToString(), CreatedAt = e.CreatedAt, InterviewId = e.InterviewId
    };

}
