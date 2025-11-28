export interface SensorData {
  DevAddr?: number;
  timestamp?: string;
  co2?: number;
  battery?: number;
  fire?: boolean;
  humidity?: number;
  maxT?: number;
  temperature?: number;
}

// Endpoint AppSync của bạn (giữ nguyên)
const APPSYNC_URL =
  "https://yuxnxoklonbarnboiyirs233we.appsync-api.ap-southeast-2.amazonaws.com/graphql";

/**
 * Gọi query getNodeData từ AppSync bằng JWT Cognito
 */
export async function getNodeData(
  jwt: string,
  devAddr: number,
  timestamp: string
): Promise<SensorData | null> {
  const query = /* GraphQL */ `
    query GetNodeData($DevAddr: Int!, $timestamp: String!) {
      getNodeData(DevAddr: $DevAddr, timestamp: $timestamp) {
        DevAddr
        timestamp
        co2
        battery
        fire
        humidity
        maxT
        temperature
      }
    }
  `;

  const res = await fetch(APPSYNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // AppSync auth = AMAZON_COGNITO_USER_POOLS nên dùng JWT ở Authorization
      Authorization: jwt,
    },
    body: JSON.stringify({
      query,
      variables: {
        DevAddr: devAddr,
        timestamp,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("AppSync HTTP error:", res.status, text);
    throw new Error(`AppSync error: ${res.status} - ${text}`);
  }

  const json = await res.json();
  console.log("AppSync raw response:", json);

  if (json.errors) {
    console.error("GraphQL errors", json.errors);
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }

  return json.data.getNodeData as SensorData | null;
}
