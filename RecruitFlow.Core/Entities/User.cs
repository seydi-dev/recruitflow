namespace RecruitFlow.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Application> Applications { get; set; } = [];
    public ICollection<Interview> Interviews { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}

public enum UserRole
{
    Admin = 0,
    Recruiter = 1,
    Candidate = 2
}
