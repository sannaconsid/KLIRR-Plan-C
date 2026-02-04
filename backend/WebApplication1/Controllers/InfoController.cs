using Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmberWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InfoController(InfoService infoService) : ControllerBase
    {

        [HttpPost]
        public async Task<IActionResult> AddInfo([FromBody] AddInfoDto info, CancellationToken cancellationToken)
        {
            await infoService.AddInfo(info, cancellationToken);
            return new OkResult();
        }

        [HttpGet("infoTypes")]
        public async Task<IActionResult> GetInfoTypes(CancellationToken cancellationToken)
        {
            var res = await infoService.GetInfoTypes(cancellationToken);
            return new OkObjectResult(res);
        }
    }
}
