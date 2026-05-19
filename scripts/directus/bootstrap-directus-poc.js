import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const directusUrl = process.env.DIRECTUS_URL ?? "http://127.0.0.1:8055";
const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD ?? "admin";
const seedPath = path.join(process.cwd(), "directus/seed/plastering-poc.json");

async function request(pathname, options = {}) {
  const response = await fetch(`${directusUrl}${pathname}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method ?? "GET"} ${pathname} failed: ${response.status} ${body}`);
  }

  return response.json();
}

async function login() {
  const payload = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });

  return payload.data.access_token;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function ignoreExisting(action) {
  try {
    await action();
  } catch (error) {
    if (!String(error.message).includes("already exists")) {
      throw error;
    }
  }
}

async function ensureCollection(token, collection, icon) {
  await ignoreExisting(() =>
    request("/collections", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        collection,
        meta: {
          icon,
          singleton: false,
        },
        schema: {},
      }),
    }),
  );
}

async function ensureField(token, collection, field) {
  await ignoreExisting(() =>
    request(`/fields/${collection}`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(field),
    }),
  );
}

function idField() {
  return {
    field: "id",
    type: "uuid",
    meta: {
      hidden: true,
      interface: "input",
      readonly: true,
    },
    schema: {
      is_primary_key: true,
    },
  };
}

function stringField(field, required = false) {
  return {
    field,
    type: "string",
    meta: {
      interface: "input",
      required,
    },
    schema: {
      is_nullable: !required,
    },
  };
}

function textField(field) {
  return {
    field,
    type: "text",
    meta: {
      interface: "input-multiline",
    },
    schema: {},
  };
}

function integerField(field) {
  return {
    field,
    type: "integer",
    meta: {
      interface: "input",
    },
    schema: {},
  };
}

function jsonField(field) {
  return {
    field,
    type: "json",
    meta: {
      interface: "input-code",
      options: {
        language: "json",
      },
    },
    schema: {},
  };
}

async function ensureSchema(token) {
  const collections = [
    ["services", "construction"],
    ["cities", "location_city"],
    ["residential_complexes", "apartment"],
    ["pages", "article"],
  ];

  for (const [collection, icon] of collections) {
    await ensureCollection(token, collection, icon);
    await ensureField(token, collection, idField());
  }

  for (const field of [
    stringField("slug", true),
    stringField("name", true),
    stringField("nameShort"),
    stringField("serviceType"),
    stringField("heroImage"),
    stringField("heroVideo"),
    textField("description"),
    textField("keywords"),
    stringField("buttonText"),
    stringField("priceFrom"),
    jsonField("advantages"),
    jsonField("seo"),
    integerField("sort"),
  ]) {
    await ensureField(token, "services", field);
  }

  for (const field of [
    stringField("slug", true),
    stringField("name", true),
    stringField("nameIn", true),
    integerField("sort"),
  ]) {
    await ensureField(token, "cities", field);
  }

  for (const field of [
    stringField("city", true),
    stringField("name", true),
    integerField("sort"),
  ]) {
    await ensureField(token, "residential_complexes", field);
  }

  for (const field of [
    stringField("slug", true),
    stringField("title"),
    textField("description"),
    stringField("canonical"),
    jsonField("content"),
    jsonField("seo"),
  ]) {
    await ensureField(token, "pages", field);
  }
}

async function upsertByFilter(token, collection, filter, item) {
  const params = new URLSearchParams();

  for (const [field, value] of Object.entries(filter)) {
    params.set(`filter[${field}][_eq]`, value);
  }

  const existing = await request(`/items/${collection}?${params.toString()}`, {
    headers: authHeaders(token),
  });

  if (existing.data.length > 0) {
    await request(`/items/${collection}/${existing.data[0].id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(item),
    });
    return;
  }

  await request(`/items/${collection}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(item),
  });
}

async function importSeed(token) {
  const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));

  for (const service of seed.services) {
    await upsertByFilter(token, "services", { slug: service.slug }, service);
  }

  for (const city of seed.cities) {
    await upsertByFilter(token, "cities", { slug: city.slug }, city);
  }

  for (const item of seed.residential_complexes) {
    await upsertByFilter(
      token,
      "residential_complexes",
      { city: item.city, name: item.name },
      item,
    );
  }
}

const token = await login();

await ensureSchema(token);
await importSeed(token);

console.warn("Directus PoC schema and seed data are ready.");
