export async function handler(event) {
  console.log("Default route triggered:", event);
  return {
    statusCode: 400,
    body: "Invalid action",
  };
}
