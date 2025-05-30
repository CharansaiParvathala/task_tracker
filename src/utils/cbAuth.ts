// src/utils/cbAuth.ts
import bcrypt from 'bcryptjs';

const CB_QUERY_URL = "https://cb.drr3tmw3bgdgggid.cloud.couchbase.com:18093/query/service";
const CB_USER = "saibalaji";
const CB_PASS = "Parvathala@97046";
const CB_AUTH = btoa(`${CB_USER}:${CB_PASS}`);

async function runQuery(statement: string): Promise<any[]> {
  const body = new URLSearchParams({ statement });

  const res = await fetch(CB_QUERY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${CB_AUTH}`,
    },
    body: body.toString(),
  });
  const json = await res.json();
  if (json.errors?.length) {
    const msg = json.errors.map((e: any) => e.msg).join(", ");
    throw new Error(msg);
  }
  return json.results || json.rows || [];
}

export async function cbSignup(
  name: string,
  email: string,
  password: string,
  phone: string
) {
  const key = `user::${email}`;

  // 1) Check existence by directly using USE KEYS
  const existRows = await runQuery(
    `SELECT META().id 
     FROM \`travel-sample\` 
     USE KEYS ["${key}"]`
  );
  if (existRows.length) {
    throw new Error("Email already in use");
  }

  // 2) Hash & insert
  const passwordHash = bcrypt.hashSync(password, 10);
  const userDoc = {
    type: "user",
    name,
    email,
    phone,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await runQuery(
    `INSERT INTO \`travel-sample\` (KEY, VALUE)
     VALUES ("${key}", ${JSON.stringify(userDoc)})`
  );
}

export async function cbLogin(
  email: string,
  password: string
): Promise<{ name: string; email: string }> {
  const key = `user::${email}`;

  // 1) Pull exactly that one document
  const rows = await runQuery(
    `SELECT name, passwordHash 
     FROM \`travel-sample\` 
     USE KEYS ["${key}"]`
  );
  if (!rows.length) {
    throw new Error("Invalid credentials");
  }

  // 2) Compare
  const { name, passwordHash } = rows[0];
  if (!bcrypt.compareSync(password, passwordHash)) {
    throw new Error("Invalid credentials");
  }

  return { name, email };
}
