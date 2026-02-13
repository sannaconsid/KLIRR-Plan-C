import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const createConnection = async () => {
  if (connection) return connection;

  const signalR = await import("@microsoft/signalr");
  connection = new signalR.HubConnectionBuilder()
    .withUrl("http://192.168.26.108/chatHub", {
      withCredentials: true
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Debug)
    .build();

  return connection;
};