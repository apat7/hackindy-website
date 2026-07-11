import { promises as fs } from "fs";
import path from "path";
import { getDb } from "@/lib/firestore";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const COLLECTION = "subscribers";

// Fallback while Firebase credentials aren't configured — local JSON is fine
// for dev, but Vercel's filesystem is ephemeral, so set up .env.local (see
// .env.local.example) before launch.
async function saveToLocalFile(email) {
  const file = path.join(process.cwd(), "data", "subscribers.json");
  await fs.mkdir(path.dirname(file), { recursive: true });
  let list = [];
  try {
    list = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    // first subscriber — start a fresh list
  }
  if (!list.some((entry) => entry.email === email)) {
    list.push({ email, at: new Date().toISOString() });
    await fs.writeFile(file, JSON.stringify(list, null, 2));
  }
}

async function saveToFirestore(db, email, request) {
  // doc id = email → natural dedupe; create() refuses overwrites so a
  // re-subscribe keeps the original signup date
  const doc = db.collection(COLLECTION).doc(email);
  try {
    await doc.create({
      email,
      createdAt: new Date(),
      source: "teaser-2027",
      userAgent: request.headers.get("user-agent") || null,
    });
  } catch (err) {
    if (err.code !== 6) throw err; // 6 = ALREADY_EXISTS — fine, they're on the list
  }
}

export async function POST(request) {
  let email = "";
  try {
    ({ email } = await request.json());
  } catch {
    // fall through to validation error
  }
  email = (email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { ok: false, error: "Enter a valid email." },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    if (db) {
      await saveToFirestore(db, email, request);
    } else {
      await saveToLocalFile(email);
    }
  } catch (err) {
    console.error("subscribe failed:", err);
    return Response.json(
      { ok: false, error: "Couldn't save that — try again in a minute." },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}
