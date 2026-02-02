using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace WebApplication1
{
    public class ChatHub: Hub
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

            await Clients.Group(targetChannel).SendAsync("ReceiveMessage", ret_val);
        }
    }
}
