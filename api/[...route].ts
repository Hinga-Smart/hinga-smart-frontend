import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server";
import serverless from "serverless-http";

const app = createServer();
const handler = serverless(app);

export default async function (
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return handler(req, res) as Promise<void>;
}

