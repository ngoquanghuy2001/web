export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// Ví dụ dùng fetch thuần. Thay URL = endpoint AppSync của bạn
const APPSYNC_URL =
  "https://yuxnxoklonbarnboiyirs233we.appsync-api.ap-southeast-2.amazonaws.com/graphql";

export async function getTodos(jwt: string): Promise<Todo[]> {
  const query = /* GraphQL */ `
    query ListTodos {
      listTodos {
        items {
          id
          title
          completed
        }
      }
    }
  `;

  const res = await fetch(APPSYNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt, // AppSync + Cognito User Pool: dùng idToken
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AppSync error: ${res.status} - ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    console.error("GraphQL errors", json.errors);
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }

  return json.data.listTodos.items as Todo[];
}