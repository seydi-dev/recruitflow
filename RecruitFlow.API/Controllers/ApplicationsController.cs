using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitFlow.Core.DTOs.Applications;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController(IApplicationService applicationService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<IActionResult> GetAll([FromQuery] ApplicationQueryParams query, CancellationToken ct) =>
        Ok(await applicationService.GetApplicationsAsync(query, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await applicationService.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> Apply([FromBody] CreateApplicationDto dto, CancellationToken ct)
    {
        var candidateId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var app = await applicationService.CreateAsync(dto, candidateId, ct);
        return CreatedAtAction(nameof(GetById), new { id = app.Id }, app);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateApplicationStatusDto dto, CancellationToken ct) =>
        Ok(await applicationService.UpdateStatusAsync(id, dto.Status, ct));

    [HttpPost("{id:guid}/withdraw")]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> Withdraw(Guid id, CancellationToken ct)
    {
        var candidateId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await applicationService.WithdrawAsync(id, candidateId, ct);
        return NoContent();
    }
}
