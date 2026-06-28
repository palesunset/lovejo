#!/usr/bin/env node
/**
 * Creates or updates Supabase Auth users for Jo/Ru.
 *
 * Passwords are never stored in git — pass via environment variables:
 *
 *   node --env-file=.env.local supabase/seed-auth.mjs
 *
 * Required in env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SEED_JO_PASSWORD  (and optionally SEED_RU_PASSWORD)
 *
 * Optional email overrides:
 *   NEXT_PUBLIC_JO_EMAIL / NEXT_PUBLIC_USER_B_EMAIL
 *   NEXT_PUBLIC_RU_EMAIL / NEXT_PUBLIC_USER_A_EMAIL
 */

import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value?.trim()) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value.trim();
}

function resolveJoEmail() {
  return (
    process.env.NEXT_PUBLIC_JO_EMAIL ??
    process.env.NEXT_PUBLIC_USER_B_EMAIL ??
    "jurenzjesfil.salvio@gmail.com"
  )
    .trim()
    .toLowerCase();
}

function resolveRuEmail() {
  return (
    process.env.NEXT_PUBLIC_RU_EMAIL ??
    process.env.NEXT_PUBLIC_USER_A_EMAIL ??
    "sariaruel@gmail.com"
  )
    .trim()
    .toLowerCase();
}

async function upsertAuthUser(
  admin,
  email,
  password,
  displayName,
) {
  const { data: list, error: listError } = await admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existing = list.users.find(
    (user) => user.email?.trim().toLowerCase() === email,
  );

  if (existing) {
    const { error } = await admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });

    if (error) {
      throw error;
    }

    console.log(`Updated auth user: ${displayName} (${email})`);
    return existing.id;
  }

  const { data, error } = await admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (error) {
    throw error;
  }

  console.log(`Created auth user: ${displayName} (${email})`);
  return data.user.id;
}

async function ensureProfile(client, userId, email, displayName) {
  const { error } = await client.from("profiles").upsert(
    {
      id: userId,
      email,
      display_name: displayName,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }

  console.log(`Ensured profile: ${displayName}`);
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const joPassword = process.env.SEED_JO_PASSWORD?.trim();
  const ruPassword = process.env.SEED_RU_PASSWORD?.trim();

  if (!joPassword && !ruPassword) {
    console.error(
      "Set at least one of SEED_JO_PASSWORD or SEED_RU_PASSWORD",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (joPassword) {
    const joEmail = resolveJoEmail();
    const joId = await upsertAuthUser(
      supabase.auth.admin,
      joEmail,
      joPassword,
      "Jo",
    );
    await ensureProfile(supabase, joId, joEmail, "Jo");
  }

  if (ruPassword) {
    const ruEmail = resolveRuEmail();
    const ruId = await upsertAuthUser(
      supabase.auth.admin,
      ruEmail,
      ruPassword,
      "Ru",
    );
    await ensureProfile(supabase, ruId, ruEmail, "Ru");
  }

  console.log("Auth seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
