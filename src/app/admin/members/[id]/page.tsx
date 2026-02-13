import { notFound } from "next/navigation";
import { getMemberFull, getCountries, getCities } from "@/lib/admin/actions";
import { MemberDetailClient } from "@/components/admin/member-detail-client";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data;
  try {
    data = await getMemberFull(id);
  } catch {
    notFound();
  }

  const { profile, registrations, vipSubs, matchResults, matchmakingProfile, partners } = data;
  if (!profile) notFound();

  const [countries, cities] = await Promise.all([getCountries(), getCities()]);

  return (
    <MemberDetailClient
      profile={profile}
      registrations={registrations}
      vipSubs={vipSubs}
      matchResults={matchResults}
      matchmakingProfile={matchmakingProfile}
      partners={partners}
      countries={countries}
      cities={cities}
    />
  );
}
