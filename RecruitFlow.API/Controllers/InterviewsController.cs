using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitFlow.Core.DTOs.Interviews;
using RecruitFlow.Core.Interfaces;
using RecruitFlow.Infrastructure;
using RecruitFlow.Core.Entities;

namespace RecruitFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Recruiter")]
public class InterviewsController(IInterviewService interviewService, AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await interviewService.GetAllAsync(ct));

    [HttpGet("application/{applicationId:guid}")]
    public async Task<IActionResult> GetByApplication(Guid applicationId, CancellationToken ct) =>
        Ok(await interviewService.GetByApplicationAsync(applicationId, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await interviewService.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<IActionResult> Schedule([FromBody] CreateInterviewDto dto, CancellationToken ct)
    {
        var interview = await interviewService.ScheduleAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = interview.Id }, interview);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInterviewDto dto, CancellationToken ct) =>
        Ok(await interviewService.UpdateAsync(id, dto, ct));

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await interviewService.CancelAsync(id, ct);
        return NoContent();
    }
    [HttpPatch("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        var interview = await context.Interviews.FindAsync(new object[] { id }, ct);
        if (interview == null) return NotFound();
        interview.Status = InterviewStatus.Completed;
        await context.SaveChangesAsync(ct);
        return NoContent();
    }
}