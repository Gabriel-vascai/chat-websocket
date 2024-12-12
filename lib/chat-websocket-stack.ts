import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ChatWebsocketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for connections
    const connectionsTable = new dynamodb.Table(this, "ConnectionsTable", {
      partitionKey: {
        name: "connectionId",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/testing only
    });

    // Lambda function to handle $connect
    const connectHandler = new lambda.Function(this, "ConnectHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "connect.handler",
      code: lambda.Code.fromAsset("functions"),
      environment: {
        TABLE_NAME: connectionsTable.tableName,
      },
    });

    // Lambda function to handle $disconnect
    const disconnectHandler = new lambda.Function(this, "DisconnectHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "disconnect.handler",
      code: lambda.Code.fromAsset("functions"),
      environment: {
        TABLE_NAME: connectionsTable.tableName,
      },
    });

    // Lambda function to handle sendMessage
    const sendMessageHandler = new lambda.Function(this, "SendMessageHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "sendMessage.handler",
      code: lambda.Code.fromAsset("functions"),
      environment: {
        TABLE_NAME: connectionsTable.tableName,
      },
    });

    // Lambda function to handle $default
    const defaultHandler = new lambda.Function(this, "DefaultHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "default.handler",
      code: lambda.Code.fromAsset("functions"),
    });

    // Grant DynamoDB permissions to Lambdas
    connectionsTable.grantReadWriteData(connectHandler);
    connectionsTable.grantReadWriteData(disconnectHandler);
    connectionsTable.grantReadWriteData(sendMessageHandler);

    // WebSocket API
    const webSocketApi = new apigatewayv2.WebSocketApi(this, "WebSocketApi", {
      connectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          "ConnectIntegration",
          connectHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          "DisconnectIntegration",
          disconnectHandler
        ),
      },
      defaultRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration(
          "DefaultIntegration",
          defaultHandler
        ),
      },
    });

    webSocketApi.addRoute("sendMessage", {
      integration: new integrations.WebSocketLambdaIntegration(
        "SendMessageIntegration",
        sendMessageHandler
      ),
    });

    // Deploy WebSocket API
    new apigatewayv2.WebSocketStage(this, "WebSocketStage", {
      webSocketApi,
      stageName: "production",
      autoDeploy: true,
    });

    // Outputs
    new cdk.CfnOutput(this, "WebSocketEndpoint", {
      value: webSocketApi.apiEndpoint,
    });
  }
}
