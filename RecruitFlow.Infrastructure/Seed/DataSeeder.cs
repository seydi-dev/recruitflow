using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.Entities;

namespace RecruitFlow.Infrastructure.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var adminId = Guid.NewGuid();
        var recruiterId = Guid.NewGuid();
        var candidate1Id = Guid.NewGuid();
        var candidate2Id = Guid.NewGuid();

        var users = new[]
        {
            new User
            {
                Id = adminId,
                Email = "admin@recruitflow.dev",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                FirstName = "Admin",
                LastName = "RecruitFlow",
                Role = UserRole.Admin
            },
            new User
            {
                Id = recruiterId,
                Email = "recruiter@recruitflow.dev",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Recruiter123!"),
                FirstName = "Marie",
                LastName = "Tremblay",
                Role = UserRole.Recruiter
            },
            new User
            {
                Id = candidate1Id,
                Email = "candidate1@recruitflow.dev",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Candidate123!"),
                FirstName = "Jean",
                LastName = "Leblanc",
                Role = UserRole.Candidate
            },
            new User
            {
                Id = candidate2Id,
                Email = "candidate2@recruitflow.dev",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Candidate123!"),
                FirstName = "Sophie",
                LastName = "Gagnon",
                Role = UserRole.Candidate
            }
        };

        await context.Users.AddRangeAsync(users);

        var job1Id = Guid.NewGuid();
        var job2Id = Guid.NewGuid();

        var jobs = new[]
        {
            new Job
            {
                Id = job1Id,
                Title = "Développeur Full-Stack .NET / Angular",
                Description = "Rejoignez l'équipe numérique d'Hydro-Québec.",
                Department = "Technologies de l'information",
                Location = "Montréal, QC",
                Status = JobStatus.Published,
                SalaryMin = 85_000m,
                SalaryMax = 110_000m,
                PostedAt = DateTime.UtcNow.AddDays(-10),
                CreatedByUserId = recruiterId
            },
            new Job
            {
                Id = job2Id,
                Title = "Architecte Solutions Cloud",
                Description = "Conception d'architectures cloud-native.",
                Department = "Infrastructure",
                Location = "Québec, QC",
                Status = JobStatus.Published,
                SalaryMin = 110_000m,
                SalaryMax = 140_000m,
                PostedAt = DateTime.UtcNow.AddDays(-5),
                CreatedByUserId = recruiterId
            }
        };

        await context.Jobs.AddRangeAsync(jobs);

        var app1Id = Guid.NewGuid();

        var applications = new[]
        {
            new Application
            {
                Id = app1Id,
                JobId = job1Id,
                CandidateId = candidate1Id,
                Status = ApplicationStatus.Interview,
                CoverLetter = "Je suis très intéressé par ce poste.",
                AppliedAt = DateTime.UtcNow.AddDays(-8)
            },
            new Application
            {
                Id = Guid.NewGuid(),
                JobId = job1Id,
                CandidateId = candidate2Id,
                Status = ApplicationStatus.Reviewing,
                AppliedAt = DateTime.UtcNow.AddDays(-6)
            }
        };

        await context.Applications.AddRangeAsync(applications);

        var interviews = new[]
        {
            new Interview
            {
                Id = Guid.NewGuid(),
                ApplicationId = app1Id,
                InterviewerId = recruiterId,
                ScheduledAt = DateTime.UtcNow.AddDays(2),
                DurationMinutes = 60,
                Type = InterviewType.Video,
                MeetingUrl = "https://meet.google.com/abc-defg-hij",
                Status = InterviewStatus.Scheduled
            }
        };

        await context.Interviews.AddRangeAsync(interviews);
        await context.SaveChangesAsync();
    }
}
