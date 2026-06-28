import { GeneratedPost } from "@/types/content";

export type PostizImage = {
  id?: string;
  path?: string;
  url?: string;
};

type CreatePostInput = {
  integrationId: string;
  content: string;
  images?: PostizImage[];
  scheduledAt?: string;
  postType?: "post" | "reel" | "story";
  tags?: string[];
};

export class PostizClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl = process.env.POSTIZ_API_BASE_URL, apiKey = process.env.POSTIZ_API_KEY) {
    if (!baseUrl) throw new Error("Missing POSTIZ_API_BASE_URL");
    if (!apiKey) throw new Error("Missing POSTIZ_API_KEY");
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: this.apiKey,
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Postiz request failed: ${response.status} ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async listIntegrations() {
    return this.request<any[]>("/integrations");
  }

  async createInstagramPost(input: CreatePostInput) {
    const payload = {
      type: input.scheduledAt ? "schedule" : "draft",
      date: input.scheduledAt,
      shortLink: false,
      tags: input.tags ?? [],
      posts: [
        {
          integration: { id: input.integrationId },
          value: [
            {
              content: input.content,
              image: input.images ?? []
            }
          ],
          settings: {
            post_type: input.postType ?? "post"
          }
        }
      ]
    };

    return this.request("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  async scheduleGeneratedPosts(args: {
    integrationId: string;
    posts: GeneratedPost[];
    startDateIso: string;
    daysBetweenPosts?: number;
  }) {
    const daysBetweenPosts = args.daysBetweenPosts ?? 1;
    const start = new Date(args.startDateIso);
    const results = [];

    for (let index = 0; index < args.posts.length; index += 1) {
      const post = args.posts[index];
      const scheduledAt =
        post.scheduledAt ?? new Date(start.getTime() + index * daysBetweenPosts * 86_400_000).toISOString();
      const content = [post.hook, post.caption, post.cta, post.hashtags.join(" ")].filter(Boolean).join("\n\n");
      const postType = post.format === "reel_script" ? "reel" : post.format === "story" ? "story" : "post";

      const result = await this.createInstagramPost({
        integrationId: args.integrationId,
        content,
        scheduledAt,
        postType
      });

      results.push(result);
    }

    return results;
  }
}
