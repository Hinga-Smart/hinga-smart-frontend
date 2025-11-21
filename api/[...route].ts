import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server";
import serverless from "serverless-http";

// Create your Express app
const app = createServer();

// Wrap it with serverless-http
const handler = serverless(app);

// Export the Vercel function
export default async function (
  req: VercelRequest,
  res: VercelResponse
): Promise<any> {
  // serverless-http returns Promise<Object>, so Promise<any> is correct
  return handler(req, res);
}