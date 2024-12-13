# Chat WebSocket Stack - AWS CDK

This project is a WebSocket API implemented using AWS CDK. It deploys the following AWS resources:
- DynamoDB Table
- AWS Lambda functions for `$connect` and `$disconnect` routes
- API Gateway WebSocket API

## Prerequisites

Before running this project, ensure you have the following tools installed and configured:

1. **Node.js**: Version 16 or higher.
2. **AWS CLI**: Ensure it's configured with a profile that has permissions to create resources (IAM, DynamoDB, Lambda, API Gateway, etc.).
   ```bash
   aws configure
   ```
3. **AWS CDK**: Install globally using npm:
   ```bash
   npm install -g aws-cdk
   ```
4. Verify the existence of a `cdk.json` file with the following content (or similar):
   ```json
   {
     "app": "npx ts-node bin/app.ts"
   }
   ```

## Directory Structure

The project follows the typical AWS CDK structure:

- **bin/**: Contains the entry point file (e.g., `app.ts`) to initialize the stack.
- **lib/**: Contains the stack file, such as `chat-websocket-stack.ts`.

Ensure all necessary files are in the correct directories.

## Steps to Deploy and Test

### 1. Install Dependencies
Run the following command in the **project root directory** to install all dependencies:
```bash
npm install
```

### 2. Build the Project
Compile the TypeScript code into JavaScript:
```bash
npm run build
```

### 3. Validate the CDK Stack
Check the stack's syntax and ensure it generates a valid CloudFormation template:
```bash
cdk synth
```
This step ensures there are no syntax errors in your code.

### 4. Deploy to AWS
Deploy the stack to your AWS account:
```bash
cdk deploy
```
- Confirm the deployment by typing `y` when prompted.
- The deployment output will include the WebSocket API endpoint (e.g., `wss://{id}.execute-api.{region}.amazonaws.com/production`).

### 5. Test the WebSocket API

#### Obtain the WebSocket URL
After deployment, note the WebSocket endpoint URL displayed in the deployment output.

#### Test Using WebSocket Client
You can test the WebSocket API using tools like:
- [Postman](https://www.postman.com/)
- WebSocket libraries like `ws` in Node.js

Connect to the WebSocket endpoint and test the `$connect` and `$disconnect` routes.

### 6. Monitor Logs
To ensure the Lambda functions are working as expected, view the logs using AWS CloudWatch:
```bash
cdk logs -f
```

### 7. Destroy Resources (Optional)
If you want to clean up all AWS resources created by this stack:
```bash
cdk destroy
```

## Notes
- **Run all commands in the root directory of the project** to ensure they execute correctly.
- Ensure your AWS CLI profile is set up correctly if you are using multiple profiles. Use:
  ```bash
  cdk deploy --profile <aws-profile>
  ```

Feel free to raise issues or ask for help if you encounter errors during deployment!

