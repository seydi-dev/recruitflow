using RecruitFlow.Core.DTOs.Evaluations;
using RecruitFlow.Core.DTOs.Interviews;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Services;

public class InterviewService(IInterviewRepository interviewRepository) : IInterviewService
{
    public async Task<IEnumerable<InterviewDto>> GetByApplicationAsync(Guid applicationId, CancellationToken ct = default) =>
        (await interviewRepository.GetByApplicationIdAsync(applicationId, ct)).Select(MapToDto);

    public async Task<InterviewDto> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        MapToDto(await interviewRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Entretien {id} introuvable"));

    public async Task<InterviewDto> ScheduleAsync(CreateInterviewDto dto, CancellationToken ct = default)
    {
        var interview = new Interview { ApplicationId = dto.ApplicationId, InterviewerId = dto.InterviewerId, ScheduledAt = dto.ScheduledAt, DurationMinutes = dto.DurationMinutes, Type = dto.Type, MeetingUrl = dto.MeetingUrl, Status = InterviewStatus.Scheduled };
        await interviewRepository.AddAsync(interview, ct);
        return MapToDto((await interviewRepository.GetByIdAsync(interview.Id, ct))!);
    }

    public async Task<InterviewDto> UpdateAsync(Guid id, UpdateInterviewDto dto, CancellationToken ct = default)
    {
        var interview = await interviewRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Entretien {id} introuvable");
        if (dto.ScheduledAt.HasValue)     interview.ScheduledAt = dto.ScheduledAt.Value;
        if (dto.DurationMinutes.HasValue) interview.DurationMinutes = dto.DurationMinutes.Value;
        if (dto.MeetingUrl is not null)   interview.MeetingUrl = dto.MeetingUrl;
        if (dto.Notes is not null)        interview.Notes = dto.Notes;
        if (dto.Status.HasValue)          interview.Status = dto.Status.Value;
        await interviewRepository.UpdateAsync(interview, ct);
        return MapToDto(interview);
    }

    public async Task CancelAsync(Guid id, CancellationToken ct = default)
    {
        var interview = await interviewRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Entretien {id} introuvable");
        interview.Status = InterviewStatus.Cancelled;
        await interviewRepository.UpdateAsync(interview, ct);
    }

    private static InterviewDto MapToDto(Interview i) => new()
    {
        Id = i.Id, ScheduledAt = i.ScheduledAt, DurationMinutes = i.DurationMinutes,
        Type = i.Type.ToString(), MeetingUrl = i.MeetingUrl, Notes = i.Notes, Status = i.Status.ToString(),
        ApplicationId = i.ApplicationId,
        CandidateFullName = $"{i.Application?.Candidate?.FirstName} {i.Application?.Candidate?.LastName}".Trim(),
        JobTitle = i.Application?.Job?.Title ?? string.Empty,
        InterviewerFullName = $"{i.Interviewer?.FirstName} {i.Interviewer?.LastName}".Trim(),
        Evaluation = i.Evaluation is null ? null : new EvaluationSummaryDto
        {
            Id = i.Evaluation.Id,
            AverageScore = (i.Evaluation.TechnicalScore + i.Evaluation.CommunicationScore + i.Evaluation.CulturalFitScore) / 3,
            Recommendation = i.Evaluation.Recommendation.ToString()
        }
    };
    public async Task<IEnumerable<InterviewDto>> GetAllAsync(CancellationToken ct = default) =>
            (await interviewRepository.GetAllAsync(ct)).Select(MapToDto);
}
