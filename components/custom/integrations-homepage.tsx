"use client";

import useParagon from "@/lib/paragon/useParagon";
import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Link from "next/link";
import {
  Search,
  Plug,
  ArrowRight,
  Zap,
  Shield,
  RefreshCw,
} from "lucide-react";

type Integration = {
  type: string;
  name: string;
  icon: string;
};

function IntegrationCard({
  integration,
  isConnected,
  actionCount,
  onConnect,
}: {
  integration: Integration;
  isConnected: boolean;
  actionCount: number;
  onConnect: () => void;
}) {
  return (
    <div className="group relative border border-border rounded-lg p-5 hover:border-foreground/20 hover:shadow-sm transition-all bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center p-1.5">
            <img
              src={integration.icon}
              alt={integration.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{integration.name}</h3>
            {actionCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {actionCount} action{actionCount !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>
        <div
          className={`rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1.5 ${
            isConnected
              ? "bg-green-400/20 text-green-600 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-green-500" : "bg-muted-foreground/40"
            }`}
          />
          {isConnected ? "Connected" : "Available"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={onConnect}>
            Configure
          </Button>
        ) : (
          <Button size="sm" className="w-full text-xs" onClick={onConnect}>
            <Plug className="w-3 h-3 mr-1.5" />
            Connect
          </Button>
        )}
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <Link href="/">
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function IntegrationCardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div>
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded mt-1.5" />
          </div>
        </div>
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 flex-1 bg-muted rounded-md" />
        <div className="h-8 w-8 bg-muted rounded-md" />
      </div>
    </div>
  );
}

export default function IntegrationsHomepage({
  session,
}: {
  session: { paragonUserToken?: string };
}) {
  const { user, paragon, actionTypes } = useParagon(
    session.paragonUserToken ?? ""
  );
  const integrations: Integration[] = paragon?.getIntegrationMetadata() ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "connected" | "available">(
    "all"
  );

  const isAuthenticated = user?.authenticated;

  const filteredIntegrations = useMemo(() => {
    let result = [...integrations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(query));
    }

    if (filter === "connected") {
      result = result.filter(
        (i) => isAuthenticated && user?.integrations?.[i.type]?.enabled
      );
    } else if (filter === "available") {
      result = result.filter(
        (i) => !isAuthenticated || !user?.integrations?.[i.type]?.enabled
      );
    }

    return result.sort((a, b) => {
      const aConnected =
        isAuthenticated && user?.integrations?.[a.type]?.enabled;
      const bConnected =
        isAuthenticated && user?.integrations?.[b.type]?.enabled;
      if (aConnected && !bConnected) return -1;
      if (bConnected && !aConnected) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [integrations, searchQuery, filter, user, isAuthenticated]);

  const connectedCount = integrations.filter(
    (i) => isAuthenticated && user?.integrations?.[i.type]?.enabled
  ).length;

  const totalActions = Object.values(actionTypes).reduce(
    (sum, actions) => sum + actions.length,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/paragon-no-text.svg" className="h-8" />
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">ActionKit</h1>
            <span className="uppercase rounded-sm bg-slate-800 dark:bg-slate-700 text-white text-[10px] px-1.5 py-0.5 font-bold">
              Beta
            </span>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Connect your favorite tools and services to ActionKit. Each
          integration exposes actions that AI agents can use to interact with
          third-party services on your behalf — read and write data, trigger
          workflows, and automate tasks across your stack.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <FeatureCard
          icon={Zap}
          title="AI-Native Actions"
          description="Every integration exposes structured actions that AI agents can call directly — no manual API plumbing required."
        />
        <FeatureCard
          icon={Shield}
          title="Secure OAuth Connections"
          description="Connect accounts through secure OAuth flows. Credentials are managed by Paragon and never exposed to your application."
        />
        <FeatureCard
          icon={RefreshCw}
          title="Real-Time Sync"
          description="Actions execute in real-time against live APIs. Your AI agent always works with the latest data from connected services."
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated ? (
              <>
                {connectedCount} connected &middot; {integrations.length}{" "}
                available &middot; {totalActions} total actions
              </>
            ) : (
              "Loading integrations..."
            )}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/">
            Open Playground
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center rounded-md border border-border overflow-hidden">
          {(["all", "connected", "available"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {!isAuthenticated
          ? Array.from({ length: 9 }).map((_, i) => (
              <IntegrationCardSkeleton key={i} />
            ))
          : filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.type}
                integration={integration}
                isConnected={
                  !!(
                    isAuthenticated &&
                    user?.integrations?.[integration.type]?.enabled
                  )
                }
                actionCount={actionTypes[integration.type]?.length ?? 0}
                onConnect={() => paragon!.connect(integration.type, {})}
              />
            ))}
      </div>

      {isAuthenticated && filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Plug className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No integrations found</p>
          <p className="text-xs mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      <div className="border-t border-border pt-6 mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.useparagon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
            >
              Paragon
            </a>
          </p>
          <a
            href="https://docs.useparagon.com/~/changes/VCSATz0qt64lvbGPABJk/api/actionkit/actionkit-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
