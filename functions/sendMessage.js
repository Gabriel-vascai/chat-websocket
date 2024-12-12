import { DynamoDBClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

export async function handler(event) {
  const client = new DynamoDBClient({});
  const apigateway = new ApiGatewayManagementApi({
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const command = new ScanCommand({ TableName: process.env.TABLE_NAME });
  try {
    const data = await client.send(command);
    const postCalls = data.Items.map(async ({ connectionId }) => {
      return apigateway.postToConnection({
        ConnectionId: connectionId,
        Data: event.body,
      });
    });
    await Promise.all(postCalls);
    return { statusCode: 200 };
  } catch (err) {
    console.error(err);
    return { statusCode: 500 };
  }
}
