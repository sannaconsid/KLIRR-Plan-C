using Business.Data;
using Microsoft.EntityFrameworkCore;

namespace Business.Services
{
    public class AddInfoDto
    {
        public string Text { get; set; } = string.Empty;
        public int IssueId { get; set; }
    }

    public class InfoTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
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
                TypeId = 1
            };

            dbContext.Infos.Add(info);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<InfoTypeDto>> GetInfoTypes(CancellationToken cancellationToken)
        {
            var i = await dbContext.InfoTypes.ToListAsync(cancellationToken);
            return [.. i.Select(a => new InfoTypeDto()
            {
                Id = a.Id,
                Name = a.Name
            })];
        }
    }
}
