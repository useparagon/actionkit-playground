import { FunctionTool } from "@/app/(chat)/api/chat/route";
import ConnectSDK from "@useparagon/connect/ConnectSDK";
import { useCallback, useEffect, useRef, useState } from "react";

export type ParagraphTypes = Record<
  string,
  {
    title: string;
    name: string;
    output: any[];
    inputs: ActionInput[];
  }[]
>;

export type ActionInput = {
  id: string;
  title: string;
  type: string;
  subtitle?: string;
  placeholder?: string;
  required?: boolean;
  values?: Array<{ value: string; dependentInputs?: ActionInput[] }>;
};

let paragon: ConnectSDK | undefined;

export default function useParagon(paragonUserToken: string) {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof paragon === "undefined") {
      paragon = new ConnectSDK();
    }
  }, []);

  const [user, setUser] = useState(paragon ? paragon.getUser() : null);
  const [error, setError] = useState();
  const [actionTypes, setActionTypes] = useState<{
    [action: string]: FunctionTool[];
  }>({});

  const updateUser = useCallback(async () => {
    if (!paragon) {
      return;
    }
    const authedUser = paragon.getUser();
    if (authedUser.authenticated) {
      const r = await fetch(
        `https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!}/actions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${paragonUserToken}`,
          },
        }
      );
      const tools = await r.json();
      if (r.ok) {
        setActionTypes(tools.actions);
      }

      setUser({ ...authedUser });
    }
  }, []);

  // Listen for account state changes
  useEffect(() => {
    // @ts-ignore
    paragon.subscribe("onIntegrationInstall", updateUser);
    // @ts-ignore
    paragon.subscribe("onIntegrationUninstall", updateUser);
    return () => {
      // @ts-ignore
      paragon.unsubscribe("onIntegrationInstall", updateUser);
      // @ts-ignore
      paragon.unsubscribe("onIntegrationUninstall", updateUser);
    };
  }, []);

  useEffect(() => {
    if (!error && paragon) {
      paragon
        .authenticate(
          process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!,
          paragonUserToken
        )
        .then(updateUser)
        .catch(setError);
    }
  }, [error, paragonUserToken]);

  return {
    paragon,
    user,
    error,
    updateUser,
    actionTypes,
  };
}
