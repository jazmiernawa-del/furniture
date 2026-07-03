// Creates (or finds) an auth user and sets their profile role to 'admin'.
// Usage: SUPA_URL=.. SUPA_SERVICE=.. EMAIL=.. PASSWORD=.. node scripts/make-admin.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPA_URL;
const service = process.env.SUPA_SERVICE;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

if (!url || !service || !email) {
  console.error("Need SUPA_URL, SUPA_SERVICE, EMAIL.");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find(
      (u) => u.email?.toLowerCase() === targetEmail.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

let userId;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: process.env.FULL_NAME ?? null },
});

if (createErr) {
  if (/already been registered|already exists/i.test(createErr.message)) {
    const existing = await findUserByEmail(email);
    if (!existing) {
      console.error("User exists but could not be found:", createErr.message);
      process.exit(1);
    }
    userId = existing.id;
    if (password) {
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    }
    console.log("ℹ️  User already existed — reused and updated.");
  } else {
    console.error("createUser failed:", createErr.message);
    process.exit(1);
  }
} else {
  userId = created.user.id;
  console.log("✅ Created auth user.");
}

// Ensure a profile row exists (the trigger normally creates it), then promote.
await admin.from("profiles").upsert({ id: userId, role: "admin" }, { onConflict: "id" });
const { data: profile, error: profErr } = await admin
  .from("profiles")
  .select("id, role, full_name")
  .eq("id", userId)
  .single();

if (profErr) {
  console.error("profile update failed:", profErr.message);
  process.exit(1);
}

console.log("✅ Admin set. Profile:", profile);
console.log("   user id:", userId, "email:", email);
