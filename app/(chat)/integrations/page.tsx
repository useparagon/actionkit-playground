import { userWithToken } from "@/app/(auth)/auth";
import IntegrationsHomepageWrapper from "@/components/custom/integrations-homepage-wrapper";

export default async function IntegrationsPage() {
  const session = await userWithToken();
  return <IntegrationsHomepageWrapper session={session} />;
}
