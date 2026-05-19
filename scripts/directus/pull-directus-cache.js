import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, "astro/data/directus-cache");
const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD ?? "admin";
const localSources = {
  cities: path.join(outputDir, "cities.json"),
  services: path.join(outputDir, "services.json"),
  complexes: path.join(outputDir, "residential-complexes.json"),
};

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function writeJson(fileName, data) {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function directusToken(baseUrl) {
  if (process.env.DIRECTUS_TOKEN) {
    return process.env.DIRECTUS_TOKEN;
  }

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });

  if (!response.ok) {
    throw new Error(`Directus login failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.data.access_token;
}

async function directusItems(collection, token) {
  const baseUrl = process.env.DIRECTUS_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("DIRECTUS_URL is not set");
  }

  const url = new URL(`${baseUrl}/items/${collection}`);
  url.searchParams.set("limit", "-1");
  url.searchParams.set("sort", "sort");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Directus ${collection} request failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.data ?? [];
}

function normalizeServices(items) {
  return {
    services: items.map(({ sort: _sort, seo: _seo, ...item }) => item),
  };
}

function normalizeCities(items) {
  return {
    cities: items.map(({ slug, name, nameIn }) => ({ slug, name, nameIn })),
  };
}

function normalizeComplexes(items) {
  return {
    complexes: items.reduce((acc, item) => {
      if (!acc[item.city]) {
        acc[item.city] = [];
      }

      acc[item.city].push(item.name);
      return acc;
    }, {}),
  };
}

async function pullFromDirectus() {
  const baseUrl = process.env.DIRECTUS_URL.replace(/\/$/, "");
  const token = await directusToken(baseUrl);
  const [services, cities, complexes] = await Promise.all([
    directusItems("services", token),
    directusItems("cities", token),
    directusItems("residential_complexes", token),
  ]);

  return {
    services: normalizeServices(services),
    cities: normalizeCities(cities),
    complexes: normalizeComplexes(complexes),
  };
}

async function pullFromLocalBaseline() {
  return {
    services: await readJson(localSources.services),
    cities: await readJson(localSources.cities),
    complexes: await readJson(localSources.complexes),
  };
}

const source = process.env.DIRECTUS_URL ? "Directus" : "local baseline";
const data = process.env.DIRECTUS_URL ? await pullFromDirectus() : await pullFromLocalBaseline();

await writeJson("services.json", data.services);
await writeJson("cities.json", data.cities);
await writeJson("residential-complexes.json", data.complexes);

console.warn(
  `Directus cache updated from ${source}: ${data.services.services.length} services, ${data.cities.cities.length} cities.`
);
