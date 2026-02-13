using System;
using System.Collections.Generic;
using System.Text;

namespace Business.Services
{
    public interface IChatHub
    {
        Task RecieveIssue(object issue);
        Task RecieveInfo(object info);
    }
}
