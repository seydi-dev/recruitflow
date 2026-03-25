using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.DTOs.Evaluations;

public class EvaluationDto
{
    public Guid Id { get; set; }
    public int TechnicalScore { get; set; }
    public int CommunicationScore { get; set; }
    public int CulturalFitScore { get; set; }
    public int AverageScore => (TechnicalScore + CommunicationScore + CulturalFitScore) / 3;
    public string? Comments { get; set; }
    public string Recommendation { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid InterviewId { get; set; }
}

public class CreateEvaluationDto
{
    public Guid InterviewId { get; set; }
    public int TechnicalScore { get; set; }
    public int CommunicationScore { get; set; }
    public int CulturalFitScore { get; set; }
    public string? Comments { get; set; }
    public EvaluationRecommendation Recommendation { get; set; }
}

public class UpdateEvaluationDto
{
    public int? TechnicalScore { get; set; }
    public int? CommunicationScore { get; set; }
    public int? CulturalFitScore { get; set; }
    public string? Comments { get; set; }
    public EvaluationRecommendation? Recommendation { get; set; }
}
