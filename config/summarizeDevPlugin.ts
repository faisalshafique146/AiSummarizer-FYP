import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "node:http";
import { buffer } from "node:stream/consumers";
import type { Plugin } from "vite";
import { handleSummarizeRequest } from "../api/summarize.ts";

function toWebHeaders(nodeHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();

  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (typeof value === "string") {
      headers.append(name, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    }
  }

  return headers;
}

function acceptsBody(method: string): boolean {
  return method !== "GET" && method !== "HEAD";
}

async function createWebRequest(request: IncomingMessage): Promise<Request> {
  const method = request.method ?? "GET";
  const requestInit: RequestInit = {
    headers: toWebHeaders(request.headers),
    method,
  };

  if (acceptsBody(method)) {
    requestInit.body = await buffer(request);
  }

  return new Request("http://localhost/api/summarize", requestInit);
}

async function writeWebResponse(
  webResponse: Response,
  response: ServerResponse,
): Promise<void> {
  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, name) => {
    response.setHeader(name, value);
  });
  response.end(Buffer.from(await webResponse.arrayBuffer()));
}

function localFailureResponse(): Response {
  return Response.json(
    {
      ok: false,
      error: {
        code: "UPSTREAM_FAILURE",
        message: "The local summarization endpoint could not process the request.",
        retryable: true,
      },
    },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}

async function serveSummarizeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  token: string | undefined,
): Promise<void> {
  try {
    const webRequest = await createWebRequest(request);
    const webResponse = await handleSummarizeRequest(webRequest, token);
    await writeWebResponse(webResponse, response);
  } catch {
    await writeWebResponse(localFailureResponse(), response);
  }
}

export function summarizeDevPlugin(token: string | undefined): Plugin {
  return {
    name: "hisumz-local-summarize-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/summarize", (request, response) => {
        void serveSummarizeRequest(request, response, token);
      });
    },
  };
}
