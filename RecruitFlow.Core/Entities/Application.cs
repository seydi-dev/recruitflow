namespace RecruitFlow.Core.Entities;

public class Application
{
    public Guid Id { get; set; }
    public ApplicationStatus Status { get; set; }
    public string? CoverLetter { get; set; }
    public string? ResumeUrl { get; set; }
    public DateTime AppliedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;

    public Guid CandidateId { get; set; }
    public User Candidate { get; set; } = null!;

    public ICollection<Interview> Interviews { get; set; } = [];
}

public enum ApplicationStatus
{
    Pending = 0,
    Reviewing = 1,
    Interview = 2,
    Offer = 3,
    Rejected = 4,
    Withdrawn = 5
}
