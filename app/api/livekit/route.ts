import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
 const room = req.nextUrl.searchParams.get("room");
 const userId = req.nextUrl.searchParams.get("userId");
 const username = req.nextUrl.searchParams.get("username");

 if (!room) {
  return NextResponse.json(
   { error: 'Missing "room" query parameter' },
   { status: 400 }
  );
 }

 if (!userId) {
  return NextResponse.json(
   { error: "Missing user ID query parameter" },
   { status: 400 }
  );
 }

 if (!username) {
  return NextResponse.json(
   { error: "Missing user query parameter" },
   { status: 400 }
  );
 }

 const apiKey = process.env.LIVEKIT_API_KEY;
 const apiSecret = process.env.LIVEKIT_API_SECRET;
 const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

 if (!apiKey || !apiSecret || !wsUrl) {
  return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
 }

 const at = new AccessToken(apiKey, apiSecret, {
  identity: username,
  metadata: userId
 });
 at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

 return NextResponse.json({ token: await at.toJwt() });
}
