using Business.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EmberWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssueController
    {
        [HttpGet]
        public async Task<IActionResult> GetIssues([FromServices] EmberDbContext dbContext)
        {
            var issues = await dbContext.Issues
                .Include(i => i.State)
                .Include(i => i.Info)
                .ToListAsync();
            return new OkObjectResult(issues);
        }

        [HttpPost]
        public async Task<IActionResult> CreateIssue([FromServices] EmberDbContext dbContext, [FromBody] Issue newIssue)
        {
            dbContext.Issues.Add(newIssue);
            await dbContext.SaveChangesAsync();
            return new OkObjectResult(newIssue);
        }
    }
}
