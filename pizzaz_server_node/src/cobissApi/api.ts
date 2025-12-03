import {
  CobissApiResponse,
  CobissApiRequest,
  cobissApiResponseSchema,
  cobissApiRequestSchema,
} from "./schema.js";

export const search = async (
  params: CobissApiRequest
): Promise<CobissApiResponse> => {
  const response = await fetch(
    "https://api.skills.browser-use.com/skill/e3afda0b-9490-467d-82f5-cd7cc166d00e/execute",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parameters: params,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  // NOTE: don't validate response schema yet, just return as is
  return data as CobissApiResponse;
};

const api = {
  search,
};

export default api;
