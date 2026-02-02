import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const createConnection = async () => {
  if (connection) return connection;

  const signalR = await import("@microsoft/signalr");
  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7298/chatHub", {
      withCredentials: true
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  return connection;
};