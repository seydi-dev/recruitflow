using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitFlow.Core.Interfaces;

namespace RecruitFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Recruiter")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetStats(CancellationToken ct) =>
        Ok(await dashboardService.GetStatsAsync(ct));
}
