namespace RecruitFlow.Core.Entities;

public class Job
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public JobStatus Status { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public DateTime PostedAt { get; set; }
    public DateTime? ClosedAt { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public ICollection<Application> Applications { get; set; } = [];
}

public enum JobStatus
{
    Draft = 0,
    Published = 1,
    Closed = 2
}
