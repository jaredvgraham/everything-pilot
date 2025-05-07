import { connectDB } from "@/app/backend/config/mongo";
import User from "@/app/backend/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.split("/api")[0];

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const { userId } = await auth();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const customerId = user.customerId;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${BASE_URL}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
}
