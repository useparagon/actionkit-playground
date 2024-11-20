import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  LanguageModelV1,
  experimental_wrapLanguageModel as wrapLanguageModel,
} from "ai";
import { customMiddleware } from "./custom-middleware";

export const customModel = ({
  type = "openai",
  model = "gpt-4o",
}: {
  type?: "openai" | "anthropic";
  model?: string;
}) =>
  wrapLanguageModel({
    model:
      type === "openai" ? openai(model) : (anthropic(model) as LanguageModelV1),
    middleware: customMiddleware,
  });
