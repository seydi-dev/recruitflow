namespace RecruitFlow.Core.DTOs.Jobs;

public class JobDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public DateTime PostedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string CreatedByFullName { get; set; } = string.Empty;
    public int ApplicationCount { get; set; }
}

public class CreateJobDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public bool PublishImmediately { get; set; } = false;
}

public class UpdateJobDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Department { get; set; }
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
}

public class JobQueryParams
{
    public string? Search { get; set; }
    public string? Department { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
