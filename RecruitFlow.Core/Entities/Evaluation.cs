namespace RecruitFlow.Core.Entities;

public class Evaluation
{
    public Guid Id { get; set; }
    public int TechnicalScore { get; set; }
    public int CommunicationScore { get; set; }
    public int CulturalFitScore { get; set; }
    public string? Comments { get; set; }
    public EvaluationRecommendation Recommendation { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid InterviewId { get; set; }
    public Interview Interview { get; set; } = null!;
}

public enum EvaluationRecommendation { StrongYes, Yes, Maybe, No, StrongNo }
