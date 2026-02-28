"use client";

import dynamic from "next/dynamic";

const IntegrationsHomepage = dynamic(
  () => import("./integrations-homepage"),
  {
    loading: () => (
      <div className="max-w-5xl mx-auto px-6 py-8 pt-16">
        <div className="mb-10">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-5 animate-pulse"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div>
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded mt-1.5" />
                </div>
              </div>
              <div className="h-8 bg-muted rounded-md" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function IntegrationsHomepageWrapper({
  session,
}: {
  session: { paragonUserToken?: string };
}) {
  return <IntegrationsHomepage session={session} />;
}
