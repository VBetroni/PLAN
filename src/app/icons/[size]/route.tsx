import { isIconSize, renderIcon } from "@/lib/pwa/icon";

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!isIconSize(size)) {
    return new Response("Not found", { status: 404 });
  }
  const response = renderIcon(size);
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}
