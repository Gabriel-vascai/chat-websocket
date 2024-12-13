import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  GetConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

export async function handler(event) {
  console.log("Default route triggered:", event);

  const connectionId = event.requestContext.connectionId;

  const callbackAPI = new ApiGatewayManagementApiClient({
    apiVersion: "2018-11-29",
    endpoint:
      "https://" +
      event.requestContext.domainName +
      "/" +
      event.requestContext.stage,
  });

  let connectionInfo;

  try {
    // Retrieving connection information
    connectionInfo = await callbackAPI.send(
      new GetConnectionCommand({
        ConnectionId: connectionId,
      })
    );
  } catch (e) {
    console.error("Error fetching connection info:", e);
    return {
      statusCode: 500,
      body: "Failed to retrieve connection information.",
    };
  }

  // Adding the connection ID to the collected information
  connectionInfo.connectionId = connectionId;

  try {
    // Sending a message to the client with the correct usage of the route
    await callbackAPI.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data:
          "Invalid action. Use the 'sendMessage' route to send a message. Connection info: " +
          JSON.stringify(connectionInfo),
      })
    );
  } catch (e) {
    console.error("Error sending message to connection:", e);
    return {
      statusCode: 500,
      body: "Failed to send message to client.",
    };
  }

  return {
    statusCode: 200,
    body: "Default route processed.",
  };
}
