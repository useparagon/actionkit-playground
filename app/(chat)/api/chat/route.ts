import { createAISDKTools } from "@agentic/ai-sdk";
import { FirecrawlClient } from "@agentic/firecrawl";
import {
  convertToCoreMessages,
  CoreTool,
  createDataStreamResponse,
  jsonSchema,
  Message,
  streamText,
  tool as aiTool,
  NoSuchToolError,
  InvalidToolArgumentsError,
  ToolExecutionError,
  DataStreamWriter,
} from "ai";
import type { JSONSchema7 } from "json-schema";
import { z } from "zod";

import { customModel } from "@/ai";
import { auth, ExtendedSession, userWithToken } from "@/app/(auth)/auth";
import { deleteChatById, getChatById, saveChat } from "@/db/queries";

import { ActionInput, ParagraphTypes } from "@/lib/paragon/useParagon";
import { setTimeout } from "timers/promises";

export type FunctionTool = {
  type: "function";
  function: { name: string; description: string; parameters: JSONSchema7 };
};

export async function POST(request: Request) {
  let firecrawl: FirecrawlClient | undefined;
  if (process.env.FIRECRAWL_API_KEY) {
    firecrawl = new FirecrawlClient();
  }

  const {
    id,
    messages,
    systemPrompt,
    tools,
    actions,
    modelName = "gpt-4o",
    modelProvider = "openai",
  }: {
    id: string;
    messages: Array<Message>;
    systemPrompt: string;
    tools: ParagraphTypes[string];
    actions: FunctionTool[];
    modelProvider: string;
    modelName: string;
  } = await request.json();

  const session = await userWithToken();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages);
  return createDataStreamResponse({
    execute(dataStream: DataStreamWriter) {
      const result = streamText({
        model: customModel({}),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 5,
        tools: {
          ...(firecrawl ? createAISDKTools(firecrawl) : {}),
          ...Object.fromEntries(
            actions.map((tool) => {
              return [
                tool.function.name,
                aiTool({
                  description: tool.function.description,
                  parameters: jsonSchema(tool.function.parameters),
                  execute: async (params: any, { toolCallId }) => {
                    dataStream.writeMessageAnnotation({
                      type: "tool-call-input",
                      toolCallId,
                      params,
                    });
                    try {
                      const r = await fetch(
                        `https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`,
                        {
                          method: "POST",
                          body: JSON.stringify({
                            action: tool.function.name,
                            parameters: params,
                          }),
                          headers: {
                            Authorization: `Bearer ${session.paragonUserToken}`,
                            "Content-Type": "application/json",
                          },
                          signal: AbortSignal.timeout(10000),
                        }
                      );
                      const output = await r.json();
                      if (!r.ok) {
                        throw new Error(JSON.stringify(output, null, 2));
                      }
                      return output;
                    } catch (err) {
                      if (err instanceof Error) {
                        if (err.name === "AbortError") {
                          return {
                            error: {
                              message: "Function timed out after 10s.",
                            },
                          };
                        }
                        return {
                          error: {
                            message: err.message,
                          },
                        };
                      }
                      return err;
                    }
                  },
                }),
              ];
            })
          ),
        },
        onFinish: async ({ response: { messages: responseMessages } }) => {
          if (session.user && session.user.id) {
            try {
              await saveChat({
                id,
                messages: [...coreMessages, ...responseMessages],
                email: session.user.email,
                systemPrompt,
                tools: actions.map((action) => ({
                  name: action.function.name,
                })),
                modelName,
                modelProvider,
              });
            } catch (error) {
              console.error("Failed to save chat", error);
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });
      result.mergeIntoDataStream(dataStream);
    },
    onError(error) {
      console.error(error);
      if (NoSuchToolError.isInstance(error)) {
        return "The model tried to call a unknown tool.";
      } else if (InvalidToolArgumentsError.isInstance(error)) {
        return "The model called a tool with invalid arguments.";
      } else if (ToolExecutionError.isInstance(error)) {
        return "An error occurred during tool execution. " + error.message;
      } else {
        return "An unknown error occurred.";
      }
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
