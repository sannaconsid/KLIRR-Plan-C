using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApplication1.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class ChannelsController : ControllerBase
    {
        private static readonly List<string> ChannelList = new()
        {
            "#Flödet",
            "Ledning",
            "Samordning",
            "Fält"
        };

    [HttpGet]
    public ActionResult<IEnumerable<string>> Get()
        {
            return Ok(ChannelList);
        }

    }
}
