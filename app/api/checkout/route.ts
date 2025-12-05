import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // For now this is a dummy checkout endpoint.
    // We'll replace this with Xendit integration later.

    // Log items server-side (during dev)
    // eslint-disable-next-line no-console
    console.log("Dummy checkout received:", body);

    return NextResponse.json({ status: "success", message: "Dummy checkout created" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: "error", message: "Failed to create checkout" }, { status: 500 });
  }
}
