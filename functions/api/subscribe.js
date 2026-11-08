// POST /api/subscribe — adds an email to the "Homelab Dispatch" Resend audience.
// Env required: RESEND_API_KEY (secret), RESEND_AUDIENCE_ID (plain).
// Without them, returns 503 so the form can say "check back soon".

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid-body" }, 400);
  }

  // Honeypot: bots fill this, humans never see it.
  if (body.company) return json({ ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return json({ ok: false, error: "invalid-email" }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  const audienceId = env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    return json({ ok: false, error: "not-configured" }, 503);
  }

  let resp;
  try {
    resp = await fetch(
      `https://api.resend.com/audiences/${encodeURIComponent(audienceId)}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      }
    );
  } catch {
    return json({ ok: false, error: "upstream" }, 502);
  }

  if (resp.status === 201 || resp.status === 200) {
    return json({ ok: true });
  }
  // 409 etc: treat "already exists" as success for the user.
  let detail = "";
  try {
    detail = (await resp.json()).message || "";
  } catch {}
  if (resp.status === 409 || /already exists/i.test(detail)) {
    return json({ ok: true });
  }
  return json({ ok: false, error: "upstream" }, 502);
}
