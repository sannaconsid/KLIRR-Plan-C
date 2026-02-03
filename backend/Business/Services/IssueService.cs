using Business.Data;
using Microsoft.EntityFrameworkCore;

namespace Business.Services
{
    public class AddIssueDto
    {
        public string Title { get; set; } = string.Empty;
    }

    public class IssueDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string State { get; set; } = null!;
        public List<InfoDto> Info { get; set; } = null!;
    }

    public class InfoDto
    {
        public string Description { get; set; } = string.Empty;
        public string InfoType { get; set; } = null!;
        public DateTime DateTime { get; internal set; }
    }

    public class DetailedIssueDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string State { get; set; } = null!;
        public List<InfoDto> Info { get; set; } = null!;
    }

    public class UpdateStatusDto
    {
        public string NewState { get; set; } = null!;
    }

    public class IssueService(EmberDbContext dbContext)
    {
        public async Task<List<IssueDto>> GetAllIssuesAsync(CancellationToken cancellationToken)
        {
            var issueDtos =  await dbContext.Issues.Select(issue => new IssueDto()
            {
                Id = issue.Id,
                Title = issue.Name,
                State = issue.State
                
            }).ToListAsync(cancellationToken);

            var infos = await dbContext.Infos
                .Where(info => issueDtos.Select(i => i.Id).Contains(info.IssueId))
                .OrderByDescending(i => i.InfoTime)
                .Select(info => new InfoDto()
                {
                    
                    Description = info.InfoText,
                    InfoType = info.Type.Name,
                    DateTime = info.InfoTime
                })
                .Take(3)
                .ToListAsync(cancellationToken);

            foreach (var issueDto in issueDtos)
            {
                issueDto.Info = await dbContext.Infos
                    .Where(info => info.IssueId == issueDto.Id)
                    .OrderByDescending(i => i.InfoTime)
                    .Select(info => new InfoDto()
                    {

                        Description = info.InfoText,
                        InfoType = info.Type.Name,
                        DateTime = info.InfoTime
                    })
                    .Take(3)
                    .ToListAsync(cancellationToken);
            }

            return issueDtos;
        }

        public async Task<DetailedIssueDto?> GetDetailedIssue(int id, CancellationToken cancellationToken)
        {
            var issueDto = await dbContext.Issues.Where(issue => issue.Id == id)
                .Select(issue => new DetailedIssueDto()
            {
                Id = issue.Id,
                Title = issue.Name,
                State = issue.State,
                Info = issue.Infos.OrderByDescending(i => i.InfoTime).Select(info => new InfoDto()
                    {
                        Description = info.InfoText,
                        InfoType = info.Type.Name,
                        DateTime = info.InfoTime
                    }).ToList()
                }).FirstOrDefaultAsync(cancellationToken);

            return issueDto;
        }

        public async Task AddIssue(AddIssueDto issueDto, CancellationToken cancellationToken)
        {
            if (issueDto == null)
            {
                throw new ArgumentNullException(nameof(issueDto));
            }


            var issue = new Issue()
            {
                Name = issueDto.Title,
                State = Issue.StatusIwssueNew,
                TimeStart = DateTime.UtcNow
            };

            dbContext.Issues.Add(issue);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateStatus(int id, UpdateStatusDto dto, CancellationToken cancellationToken)
        {
            var issue = await dbContext.Issues.AsTracking().FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

            if (issue == null)
            {
                throw new Exception("Issue not found");
            }
            if (issue.State == Issue.StatusIssueClosed)
            {
                throw new Exception("Cannot change status of a closed issue");
            }

            switch (dto.NewState)
            {
                case Issue.StatusIssueOngoing:
                case Issue.StatusIssueParked:
                    break;

                case Issue.StatusIssueClosed:
                    issue.TimeClosed = DateTime.UtcNow;
                    break;
                default:
                    throw new Exception("Invalid state");
            }

            issue.State = dto.NewState;
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
