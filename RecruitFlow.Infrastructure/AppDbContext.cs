using Microsoft.EntityFrameworkCore;
using RecruitFlow.Core.Entities;

namespace RecruitFlow.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            e.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Job>(e =>
        {
            e.HasKey(j => j.Id);
            e.Property(j => j.Title).HasMaxLength(200).IsRequired();
            e.Property(j => j.Status).HasConversion<string>();
            e.Property(j => j.SalaryMin).HasPrecision(18, 2);
            e.Property(j => j.SalaryMax).HasPrecision(18, 2);

            e.HasOne(j => j.CreatedByUser)
             .WithMany()
             .HasForeignKey(j => j.CreatedByUserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Application>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Status).HasConversion<string>();
            e.HasIndex(a => new { a.JobId, a.CandidateId }).IsUnique();

            e.HasOne(a => a.Job)
             .WithMany(j => j.Applications)
             .HasForeignKey(a => a.JobId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.Candidate)
             .WithMany(u => u.Applications)
             .HasForeignKey(a => a.CandidateId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Interview>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Type).HasConversion<string>();
            e.Property(i => i.Status).HasConversion<string>();

            e.HasOne(i => i.Application)
             .WithMany(a => a.Interviews)
             .HasForeignKey(i => i.ApplicationId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(i => i.Interviewer)
             .WithMany(u => u.Interviews)
             .HasForeignKey(i => i.InterviewerId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Evaluation>(e =>
        {
            e.HasKey(ev => ev.Id);
            e.Property(ev => ev.Recommendation).HasConversion<string>();

            e.HasOne(ev => ev.Interview)
             .WithOne(i => i.Evaluation)
             .HasForeignKey<Evaluation>(ev => ev.InterviewId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasKey(rt => rt.Id);
            e.Property(rt => rt.Token).HasMaxLength(512).IsRequired();
            e.HasIndex(rt => rt.Token);

            e.HasOne(rt => rt.User)
             .WithMany(u => u.RefreshTokens)
             .HasForeignKey(rt => rt.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Properties.Any(p => p.Metadata.Name == "CreatedAt"))
                    entry.Property("CreatedAt").CurrentValue = now;
                if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
                    entry.Property("UpdatedAt").CurrentValue = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
                    entry.Property("UpdatedAt").CurrentValue = now;
            }
        }

        return await base.SaveChangesAsync(ct);
    }
}
