const META_GRAPH_BASE = "https://graph.facebook.com/v21.0";

function getMetaConfig() {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const igUserId = process.env.META_INSTAGRAM_BUSINESS_ID;

  if (!accessToken || !igUserId) {
    throw new Error("Missing META_ACCESS_TOKEN or META_INSTAGRAM_BUSINESS_ID env vars");
  }

  return { accessToken, igUserId };
}

async function metaFetch(path: string, init: RequestInit = {}): Promise<any> {
  const response = await fetch(`${META_GRAPH_BASE}${path}`, init);
  const data = await response.json();

  if (!response.ok || data.error) {
    const message = data.error?.message ?? `Meta API error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// Step 1: Create a media container (image). Returns creation_id.
export async function createMediaContainer(imageUrl: string, caption: string): Promise<string> {
  const { accessToken, igUserId } = getMetaConfig();

  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken
  });

  const data = await metaFetch(`/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  if (!data.id) {
    throw new Error("Meta did not return a creation_id for the media container");
  }

  return data.id;
}

// Step 1b: Create a scheduled media container. Returns creation_id.
export async function createScheduledMediaContainer(
  imageUrl: string,
  caption: string,
  scheduledTime: Date
): Promise<string> {
  const { accessToken, igUserId } = getMetaConfig();

  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    published: "false",
    scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000).toString(),
    access_token: accessToken
  });

  const data = await metaFetch(`/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  if (!data.id) {
    throw new Error("Meta did not return a creation_id for the scheduled media container");
  }

  return data.id;
}

// Step 2: Publish a media container. Returns the published post ID.
export async function publishMediaContainer(creationId: string): Promise<string> {
  const { accessToken, igUserId } = getMetaConfig();

  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken
  });

  const data = await metaFetch(`/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  if (!data.id) {
    throw new Error("Meta did not return a post ID after publishing");
  }

  return data.id;
}

// Check token validity and expiry.
export async function getTokenStatus(): Promise<{ valid: boolean; expiresAt: Date | null; appId: string }> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!accessToken || !appId || !appSecret) {
    return { valid: false, expiresAt: null, appId: appId ?? "" };
  }

  try {
    const data = await metaFetch(
      `/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
    );

    const tokenData = data.data;
    const expiresAt = tokenData?.expires_at
      ? new Date(tokenData.expires_at * 1000)
      : null;

    return {
      valid: tokenData?.is_valid ?? false,
      expiresAt,
      appId
    };
  } catch {
    return { valid: false, expiresAt: null, appId };
  }
}
