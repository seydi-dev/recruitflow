using RecruitFlow.Core.DTOs.Applications;
using RecruitFlow.Core.DTOs.Common;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Services;

public class ApplicationService(IApplicationRepository applicationRepository, IJobRepository jobRepository) : IApplicationService
{
    public async Task<PagedResult<ApplicationDto>> GetApplicationsAsync(ApplicationQueryParams query, CancellationToken ct = default)
    {
        var apps  = await applicationRepository.GetAllAsync(query, ct);
        var total = await applicationRepository.CountAsync(query, ct);
        return new PagedResult<ApplicationDto> { Items = apps.Select(MapToDto), TotalCount = total, Page = query.Page, PageSize = query.PageSize };
    }

    public async Task<ApplicationDto> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        MapToDto(await applicationRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Candidature {id} introuvable"));

    public async Task<ApplicationDto> CreateAsync(CreateApplicationDto dto, Guid candidateId, CancellationToken ct = default)
    {
        if (!await jobRepository.ExistsAsync(dto.JobId, ct))
            throw new KeyNotFoundException($"Offre {dto.JobId} introuvable");
        if (await applicationRepository.ExistsAsync(dto.JobId, candidateId, ct))
            throw new InvalidOperationException("Vous avez déjà postulé à cette offre");

        var application = new Application { JobId = dto.JobId, CandidateId = candidateId, CoverLetter = dto.CoverLetter, ResumeUrl = dto.ResumeUrl, Status = ApplicationStatus.Pending };
        await applicationRepository.AddAsync(application, ct);
        return MapToDto((await applicationRepository.GetByIdAsync(application.Id, ct))!);
    }

    public async Task<ApplicationDto> UpdateStatusAsync(Guid id, ApplicationStatus status, CancellationToken ct = default)
    {
        var app = await applicationRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Candidature {id} introuvable");
        app.Status = status;
        await applicationRepository.UpdateAsync(app, ct);
        return MapToDto(app);
    }

    public async Task WithdrawAsync(Guid id, Guid candidateId, CancellationToken ct = default)
    {
        var app = await applicationRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Candidature {id} introuvable");
        if (app.CandidateId != candidateId) throw new UnauthorizedAccessException("Vous ne pouvez pas retirer cette candidature");
        app.Status = ApplicationStatus.Withdrawn;
        await applicationRepository.UpdateAsync(app, ct);
    }

    private static ApplicationDto MapToDto(Application a) => new()
    {
        Id = a.Id, Status = a.Status.ToString(), CoverLetter = a.CoverLetter, ResumeUrl = a.ResumeUrl,
        AppliedAt = a.AppliedAt, JobId = a.JobId, JobTitle = a.Job?.Title ?? string.Empty,
        CandidateId = a.CandidateId, CandidateFullName = $"{a.Candidate?.FirstName} {a.Candidate?.LastName}".Trim(),
        CandidateEmail = a.Candidate?.Email ?? string.Empty, InterviewCount = a.Interviews?.Count ?? 0
    };
}
