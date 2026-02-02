export const createConnection = async () => {
  const signalR = await import("@microsoft/signalr");
  return new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7298/chatHub", {
      withCredentials: true
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
};