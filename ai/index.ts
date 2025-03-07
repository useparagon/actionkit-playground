import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { azure } from "@ai-sdk/azure";
import {
  LanguageModelV1,
  experimental_wrapLanguageModel as wrapLanguageModel,
} from "ai";
import { customMiddleware } from "./custom-middleware";

export const customModel = ({
  type = "openai",
  model = "gpt-4o",
}: {
  type?: "openai" | "anthropic" | "azure";
  model?: string;
}) => {
  let languageModel: LanguageModelV1;
  if (type === "openai") {
    languageModel = openai(model);
  } else if (type === "anthropic") {
    languageModel = anthropic(model);
  } else if (type === "azure") {
    if (!process.env.AZURE_DEPLOYMENT_NAME) {
      throw new Error("AZURE_DEPLOYMENT_NAME is required for Azure models");
    }
    languageModel = azure(process.env.AZURE_DEPLOYMENT_NAME) as LanguageModelV1;
  } else {
    languageModel = openai(model);
  }
  return wrapLanguageModel({
    model: languageModel,
    middleware: customMiddleware,
  });
};
