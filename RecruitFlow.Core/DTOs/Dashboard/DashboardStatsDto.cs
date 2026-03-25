namespace RecruitFlow.Core.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int TotalApplications { get; set; }
    public int PendingApplications { get; set; }
    public int InterviewsThisWeek { get; set; }
    public int OffersExtended { get; set; }
    public Dictionary<string, int> ApplicationsByStatus { get; set; } = [];
    public IEnumerable<JobApplicationCountDto> TopJobs { get; set; } = [];
}

public class JobApplicationCountDto
{
    public string JobTitle { get; set; } = string.Empty;
    public int Count { get; set; }
}
