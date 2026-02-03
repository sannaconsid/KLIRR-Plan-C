using Business.Data;
using Microsoft.EntityFrameworkCore;

namespace Business.Services
{
    public class AddInfoDto
    {
        public string Text { get; set; } = string.Empty;
        public int IssueId { get; set; }
    }


    public class InfoService(EmberDbContext dbContext)
    {
        public async Task AddInfo(AddInfoDto issueDto, CancellationToken cancellationToken)
        {
            var info = new Info()
            {
                InfoText = issueDto.Text,
                InfoTime = DateTime.UtcNow,
                IssueId = issueDto.IssueId,
            };

            dbContext.Infos.Add(info);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
