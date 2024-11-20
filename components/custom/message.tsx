"use client";

import { Attachment, JSONValue, tool, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import JsonViewer from "./json-viewer";

export const Message = ({
  role,
  content,
  toolInvocations,
  attachments,
  annotations,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  annotations?: Array<JSONValue>;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full first-of-type:mt-4 pt-3 pb-1 rounded-lg ${role === "assistant" ? "" : "bg-neutral-50 dark:bg-neutral-800"}`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center shrink-0 text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && (
          <div className="text-zinc-800 dark:text-zinc-300">
            <p className="text-sm font-semibold mb-1">
              {role === "assistant" ? "Assistant" : "User"}
            </p>
            <div className="flex flex-col gap-2">
              {typeof content === "string" ? (
                <Markdown>{content as string}</Markdown>
              ) : (
                content
              )}
            </div>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation, index) => {
              const { toolName, toolCallId, state } = toolInvocation;
              if (toolName !== "firecrawl_scrape_url") {
                return (
                  <div key={toolCallId}>
                    <div
                      className={`pt-1 ${index === toolInvocations.length - 1 ? "mb-2" : "mb-0"}`}
                    >
                      <p className="flex items-center text-muted-foreground text-sm">
                        <Wrench className="mr-1 w-4" />{" "}
                        {state !== "result" ? "Calling" : "Called"} {toolName}{" "}
                        with:
                      </p>
                    </div>
                    <JsonViewer
                      input={toolInvocation.args}
                      output={state === "result" ? toolInvocation.result : null}
                      isLoading={state !== "result"}
                      error={
                        state === "result" && toolInvocation.result.error
                          ? toolInvocation.result.error.message
                          : null
                      }
                    />
                  </div>
                );
              }

              // below is old
              if (state === "call") {
                const { args } = toolInvocation;
              }
              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {((): React.ReactNode => {
                      switch (toolName) {
                        case "firecrawl_scrape_url":
                          return (
                            <p className="flex items-center text-muted-foreground text-sm">
                              <Wrench className="mr-1 w-4" /> Read&nbsp;
                              <span className="font-medium">
                                {toolInvocation.args.url}.
                              </span>
                            </p>
                          );
                        default:
                          return (
                            <div
                              className={`pt-1 ${index === toolInvocations.length - 1 ? "mb-3" : "mb-0"}`}
                            >
                              <p className="flex items-center text-muted-foreground text-sm">
                                <Wrench className="mr-1 w-4" /> Called{" "}
                                {toolName} with:
                              </p>
                              <pre className="text-sm bg-zinc-100 w-[50dvw] dark:bg-zinc-800 py-0.5 px-1 rounded-md overflow-x-scroll">
                                {JSON.stringify(result.params, null, 2)}
                              </pre>
                            </div>
                          );
                      }
                    })()}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId}>
                    <p className="flex items-center text-muted-foreground text-sm">
                      <Wrench className="mr-1 w-4" /> Calling {toolName}...
                    </p>
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full px-4 mt-2"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={`flex gap-4 w-full rounded-xl`}
      >
        <div className="size-[24px] flex flex-col justify-center items-center shrink-0 text-zinc-400">
          <BotIcon />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row text-muted-foreground items-center">
            <span className="mr-2">Thinking</span>
            <div className="h-1 w-1 mr-1 bg-zinc-400 rounded-full animate-bounce-more [animation-delay:-0.2s]"></div>
            <div className="h-1 w-1 mr-1 bg-zinc-400 rounded-full animate-bounce-more [animation-delay:-0.15s]"></div>
            <div className="h-1 w-1 mr-4 bg-zinc-400 rounded-full animate-bounce-more"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
