import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server"; // or another auth provider
import { connectDB } from "@/app/backend/config/mongo";
import User, { IUser } from "@/app/backend/models/userModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId } = await auth(); // Get the current logged-in user
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the user from the database
    const user = (await User.findOne({ clerkId: userId })) as IUser;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscriptionId = user.subscriptionId; // Assuming you store Stripe subscription ID in the database
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    // Cancel the subscription using Stripe's API
    const deletedSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );

    // Update the user's subscription status in your database
    // user.subscriptionId = null;
    // user.plan = "none";
    // await user.save();

    return NextResponse.json({
      message: "Subscription canceled",
      subscription: deletedSubscription,
    });
  } catch (error: any) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
