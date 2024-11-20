"use client";

import * as React from "react";
import { RotatingLines } from "react-loader-spinner";
import { ChevronRight, CheckCircle2, XCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  input?: object | string;
  output?: object | string;
  isLoading?: boolean;
  error?: string;
}

export default function JsonViewer({
  input = {},
  output = {},
  isLoading = false,
  error,
}: JsonViewerProps) {
  const [inputExpanded, setInputExpanded] = React.useState(false);
  const [outputExpanded, setOutputExpanded] = React.useState(false);

  const formatJson = (data: object | string): string => {
    try {
      if (typeof data === "string") {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="w-full space-y-1 text-md">
      <div className="rounded-lg border bg-background">
        <button
          onClick={(e) => {
            setInputExpanded(!inputExpanded);
          }}
          className="flex w-full items-center justify-between p-3 hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                inputExpanded && "rotate-90"
              )}
            />
            <span className="font-semibold text-sm">Input</span>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </button>
        {inputExpanded && (
          <div className="border-t p-4">
            <pre className="whitespace-pre-wrap break-all text-xs">
              {formatJson(input)}
            </pre>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-background">
        <button
          onClick={() => setOutputExpanded(!outputExpanded)}
          className="flex w-full items-center justify-between p-3 hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                outputExpanded && "rotate-90"
              )}
            />
            <span className="font-semibold text-sm">Output</span>
          </div>
          {isLoading ? (
            <RotatingLines
              visible={true}
              width="20"
              strokeWidth="3"
              animationDuration="0.75"
              ariaLabel="rotating-lines-loading"
              strokeColor="gray"
            />
          ) : error ? (
            <XCircle className="h-5 w-5 text-destructive" />
          ) : output ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : null}
        </button>
        <div className={`border-t p-4 ${outputExpanded ? "" : "hidden"}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RotatingLines
                visible={true}
                width="20"
                strokeWidth="3"
                animationDuration="0.75"
                ariaLabel="rotating-lines-loading"
                strokeColor="gray"
              />
            </div>
          ) : error ? (
            <div className="text-destructive text-sm">
              <span className="font-semibold">Error: </span>
              <pre className="whitespace-pre-wrap break-all text-xs">
                {error}
              </pre>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-all text-xs">
              {formatJson(output)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
