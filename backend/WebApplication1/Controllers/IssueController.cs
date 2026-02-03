using Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmberWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssueController(IssueService issueService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetIssues(CancellationToken cancellationToken)
        {
            var issues = await issueService.GetAllIssuesAsync(cancellationToken);
            return new OkObjectResult(issues);
        }

        [HttpPost]
        public async Task<IActionResult> AddIssue([FromBody] AddIssueDto issue, CancellationToken cancellationToken)
        {
            await issueService.AddIssue(issue, cancellationToken);
            return new OkResult();
        }

        [HttpPost("/{id}")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] UpdateStatusDto issue, CancellationToken cancellationToken)
        {
            await issueService.UpdateStatus(id, issue, cancellationToken);
            return new OkResult();
        }
    }
}
