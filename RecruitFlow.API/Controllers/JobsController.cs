using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitFlow.Core.DTOs.Jobs;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JobsController(IJobService jobService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] JobQueryParams query, CancellationToken ct) =>
        Ok(await jobService.GetJobsAsync(query, ct));

    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublished(CancellationToken ct) =>
        Ok(await jobService.GetPublishedAsync(ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await jobService.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<IActionResult> Create([FromBody] CreateJobDto dto, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var job = await jobService.CreateAsync(dto, userId, ct);
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateJobDto dto, CancellationToken ct) =>
        Ok(await jobService.UpdateAsync(id, dto, ct));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await jobService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateJobStatusDto dto, CancellationToken ct) =>
        Ok(await jobService.UpdateStatusAsync(id, dto.Status, ct));
}

public record UpdateJobStatusDto(JobStatus Status);
