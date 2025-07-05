import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, username, publicKey } = body;

    if (!content || !username || !publicKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ipfs = await pinata.upload.public.json({
      creator: publicKey,
      username,
      content,
      createdAt: new Date().toISOString(),
    });

    if (!ipfs?.cid) {
      throw new Error("IPFS upload failed.");
    }

    return NextResponse.json({ ipfs_hash: ipfs.cid }, { status: 200 });
  } catch (err: any) {
    console.error("Pinata upload failed", err);
    return NextResponse.json({ error: err.message || "Failed to upload to IPFS" }, { status: 500 });
  }
}