import {
  getVipPlans,
  getVipBenefits,
  getVipSettings,
  getCountries,
} from "@/lib/admin/actions";
import { VipAdminContent } from "@/components/admin/vip-admin-content";

export default async function AdminVipPage() {
  const [plans, benefits, settings, countries] = await Promise.all([
    getVipPlans(),
    getVipBenefits(),
    getVipSettings(),
    getCountries(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">VIP Membership</h1>
      <VipAdminContent
        plans={plans}
        benefits={benefits}
        settings={settings}
        countries={countries}
      />
    </div>
  );
}
