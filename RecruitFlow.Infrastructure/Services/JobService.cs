using RecruitFlow.Core.DTOs.Common;
using RecruitFlow.Core.DTOs.Jobs;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.Infrastructure.Services;

public class JobService(IJobRepository jobRepository) : IJobService
{
    public async Task<PagedResult<JobDto>> GetJobsAsync(JobQueryParams query, CancellationToken ct = default)
    {
        var jobs  = await jobRepository.GetAllAsync(query, ct);
        var total = await jobRepository.CountAsync(query, ct);
        return new PagedResult<JobDto> { Items = jobs.Select(MapToDto), TotalCount = total, Page = query.Page, PageSize = query.PageSize };
    }

    public async Task<IEnumerable<JobDto>> GetPublishedAsync(CancellationToken ct = default) =>
        (await jobRepository.GetPublishedAsync(ct)).Select(MapToDto);

    public async Task<JobDto> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        MapToDto(await jobRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Offre {id} introuvable"));

    public async Task<JobDto> CreateAsync(CreateJobDto dto, Guid createdByUserId, CancellationToken ct = default)
    {
        var job = new Job
        {
            Title = dto.Title, Description = dto.Description, Department = dto.Department,
            Location = dto.Location, SalaryMin = dto.SalaryMin, SalaryMax = dto.SalaryMax,
            Status = dto.PublishImmediately ? JobStatus.Published : JobStatus.Draft,
            CreatedByUserId = createdByUserId
        };
        await jobRepository.AddAsync(job, ct);
        return MapToDto((await jobRepository.GetByIdAsync(job.Id, ct))!);
    }

    public async Task<JobDto> UpdateAsync(Guid id, UpdateJobDto dto, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Offre {id} introuvable");
        if (dto.Title is not null)       job.Title = dto.Title;
        if (dto.Description is not null) job.Description = dto.Description;
        if (dto.Department is not null)  job.Department = dto.Department;
        if (dto.Location is not null)    job.Location = dto.Location;
        if (dto.SalaryMin.HasValue)      job.SalaryMin = dto.SalaryMin;
        if (dto.SalaryMax.HasValue)      job.SalaryMax = dto.SalaryMax;
        await jobRepository.UpdateAsync(job, ct);
        return MapToDto(job);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Offre {id} introuvable");
        job.Status = JobStatus.Closed;
        job.ClosedAt = DateTime.UtcNow;
        await jobRepository.UpdateAsync(job, ct);
    }

    public async Task<JobDto> UpdateStatusAsync(Guid id, JobStatus status, CancellationToken ct = default)
    {
        var job = await jobRepository.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Offre {id} introuvable");
        job.Status = status;
        if (status == JobStatus.Closed) job.ClosedAt = DateTime.UtcNow;
        await jobRepository.UpdateAsync(job, ct);
        return MapToDto(job);
    }

    private static JobDto MapToDto(Job j) => new()
    {
        Id = j.Id, Title = j.Title, Description = j.Description, Department = j.Department,
        Location = j.Location, Status = j.Status.ToString(), SalaryMin = j.SalaryMin,
        SalaryMax = j.SalaryMax, PostedAt = j.PostedAt, ClosedAt = j.ClosedAt,
        CreatedByFullName = $"{j.CreatedByUser?.FirstName} {j.CreatedByUser?.LastName}".Trim(),
        ApplicationCount = j.Applications?.Count ?? 0
    };
}
