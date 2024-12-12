import { DynamoDBClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
export async function handler(event) {
  const command = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: { connectionId: event.requestContext.connectionId },
  });
  try {
    await client.send(command);
    return { statusCode: 200 };
  } catch (err) {
    console.error(err);
    return { statusCode: 500 };
  }
}
