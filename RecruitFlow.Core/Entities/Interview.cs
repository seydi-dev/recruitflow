namespace RecruitFlow.Core.Entities;

public class Interview
{
    public Guid Id { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public InterviewType Type { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
    public InterviewStatus Status { get; set; }

    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public Guid InterviewerId { get; set; }
    public User Interviewer { get; set; } = null!;

    public Evaluation? Evaluation { get; set; }
}

public enum InterviewType { Phone, Video, OnSite }
public enum InterviewStatus { Scheduled, Completed, Cancelled, NoShow }
