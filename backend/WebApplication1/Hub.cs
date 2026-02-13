using Business.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace WebApplication1
{
    public class ChatHub: Hub<IChatHub>
    {
        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "#Flödet");
            await base.OnConnectedAsync();
        }

        public async Task SwitchChannel(string? oldChannel, string newChannel)
        {
            if (!string.IsNullOrEmpty(oldChannel) && oldChannel != newChannel)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldChannel);
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, newChannel);
        }

        public async Task SendInfo(int issueId, string text, string channel)
        {
            var ret_val = new
            {
                issueId = issueId,
                text = text,
                timestamp = DateTime.Now
            };
            await Clients.All.RecieveInfo(ret_val);
        }

        public async Task SendMessage(string type, string text, string channel)
        {
            Console.WriteLine($"Type: {type}, Channel: {channel}, Text: {text}");

            string targetChannel = type switch
            {
                "beslut" => "Ledning",
                "observation" => "Ledning",
                _ => channel
            };

            var ret_val = new
            {
                id = Guid.NewGuid(),
                timestamp = DateTime.Now,
                type = type,
                channel = targetChannel,
                text = text
            };

            await Clients.Group(targetChannel).RecieveInfo(ret_val);
        }
    }
}
