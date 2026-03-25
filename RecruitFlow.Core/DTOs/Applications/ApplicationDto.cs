using RecruitFlow.Core.Entities;

namespace RecruitFlow.Core.DTOs.Applications;

public class ApplicationDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CoverLetter { get; set; }
    public string? ResumeUrl { get; set; }
    public DateTime AppliedAt { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public Guid CandidateId { get; set; }
    public string CandidateFullName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public int InterviewCount { get; set; }
}

public class CreateApplicationDto
{
    public Guid JobId { get; set; }
    public string? CoverLetter { get; set; }
    public string? ResumeUrl { get; set; }
}

public class UpdateApplicationStatusDto
{
    public ApplicationStatus Status { get; set; }
}

public class ApplicationQueryParams
{
    public Guid? JobId { get; set; }
    public Guid? CandidateId { get; set; }
    public ApplicationStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
