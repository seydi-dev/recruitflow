using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitFlow.Core.DTOs.Evaluations;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Recruiter")]
public class EvaluationsController(IEvaluationService evaluationService) : ControllerBase
{
    [HttpGet("interview/{interviewId:guid}")]
    public async Task<IActionResult> GetByInterview(Guid interviewId, CancellationToken ct) =>
        Ok(await evaluationService.GetByInterviewAsync(interviewId, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEvaluationDto dto, CancellationToken ct)
    {
        var eval = await evaluationService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetByInterview), new { interviewId = dto.InterviewId }, eval);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEvaluationDto dto, CancellationToken ct) =>
        Ok(await evaluationService.UpdateAsync(id, dto, ct));
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await evaluationService.GetAllAsync(ct));
}
