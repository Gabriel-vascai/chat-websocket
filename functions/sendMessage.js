import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

export async function handler(event) {
  // Configuration of DynamoDB Document Client
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  // Command to scan the connections table
  const ddbCommand = new ScanCommand({
    TableName: process.env.TABLE_NAME,
  });

  let connections;
  try {
    connections = await docClient.send(ddbCommand);
  } catch (err) {
    console.error("Erro ao buscar conexões no DynamoDB:", err);
    return {
      statusCode: 500,
    };
  }

  // Configuration of the API Gateway Management API
  const callbackAPI = new ApiGatewayManagementApiClient({
    apiVersion: "2018-11-29",
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  // Processing the received message
  const parsedBody = JSON.parse(event.body || "{}");
  const message = parsedBody.message || "Mensagem padrão";

  // Send messages to all connections (except the sender's)
  const sendMessages = connections.Items.map(async ({ connectionId }) => {
    if (connectionId !== event.requestContext.connectionId) {
      try {
        await callbackAPI.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify({ message }),
          })
        );
      } catch (e) {
        console.error(
          `Erro ao enviar mensagem para ConnectionId ${connectionId}:`,
          e
        );
      }
    }
  });

  try {
    await Promise.all(sendMessages);
  } catch (e) {
    console.error("Erro ao enviar mensagens:", e);
    return {
      statusCode: 500,
    };
  }

  return { statusCode: 200 };
}
