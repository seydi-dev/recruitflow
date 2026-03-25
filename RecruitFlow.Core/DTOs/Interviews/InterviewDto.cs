using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.DTOs.Interviews;

public class InterviewDto
{
    public Guid Id { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid ApplicationId { get; set; }
    public string CandidateFullName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string InterviewerFullName { get; set; } = string.Empty;
    public EvaluationSummaryDto? Evaluation { get; set; }
}

public class EvaluationSummaryDto
{
    public Guid Id { get; set; }
    public int AverageScore { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}

public class CreateInterviewDto
{
    public Guid ApplicationId { get; set; }
    public Guid InterviewerId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; } = 60;
    public InterviewType Type { get; set; }
    public string? MeetingUrl { get; set; }
}

public class UpdateInterviewDto
{
    public DateTime? ScheduledAt { get; set; }
    public int? DurationMinutes { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
    public InterviewStatus? Status { get; set; }
}
