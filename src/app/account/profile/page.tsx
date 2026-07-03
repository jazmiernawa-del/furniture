import type { Metadata } from "next";

import { ProfileForm } from "@/components/profile-form";
import { requireUser, getProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/login?next=/account/profile");
  const profile = await getProfile();

  return (
    <>
      <p className="eyebrow">Your details</p>
      <h1 className="mt-3 font-serif text-4xl font-light text-foreground">
        Profile
      </h1>
      <p className="mt-3 text-muted-foreground">
        Manage the details we use for delivery and your account.
      </p>

      <div className="mt-10">
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? ""}
          email={user.email ?? ""}
        />
      </div>
    </>
  );
}
