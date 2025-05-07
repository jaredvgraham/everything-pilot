import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import User, { IUser } from "@/app/backend/models/userModel";
import { connectDB } from "@/app/backend/config/mongo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.split("/api")[0];

// Dummy fallback for createRecurringPrice if not present
function createRecurringPrice(plan: string) {
  if (plan === "basic") return 500;
  if (plan === "pro") return 1500;
  return 0;
}

// Dummy fallback for connectDB if not present

async function getOrCreateCustomerId(user: IUser) {
  const customerId = user.customerId;
  if (!customerId) {
    console.log("Creating customer");
    const customer = await stripe.customers.create({
      email: user.email,
    });
    return customer.id;
  }
  return customerId;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { plan } = await req.json();
    if (user.plan === plan) {
      return NextResponse.json(
        { message: "User already subscribed to this plan" },
        { status: 400 }
      );
    }
    const recurringPrice = createRecurringPrice(plan);
    if (recurringPrice === 0) {
      return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
    }
    const recurringStripePrice = await stripe.prices.create({
      unit_amount: recurringPrice,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { type: "indefinite" },
      product_data: { name: plan },
    });
    // get or create customer Id
    const customerId = await getOrCreateCustomerId(user);
    user.customerId = customerId;
    await user.save();
    // Create a checkout session for the purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,

      line_items: [
        {
          price: recurringStripePrice.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${BASE_URL}/`,
      cancel_url: `${BASE_URL}/pricing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const { newPlan } = await req.json();
    if (user.plan === newPlan) {
      return NextResponse.json(
        { message: "User already subscribed to this plan" },
        { status: 400 }
      );
    }
    const recurringPrice = createRecurringPrice(newPlan);
    if (recurringPrice === 0) {
      return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
    }
    const recurringStripePrice = await stripe.prices.create({
      unit_amount: recurringPrice,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { type: "indefinite" },
      product_data: { name: newPlan },
    });
    // get or create customer Id
    const customerId = await getOrCreateCustomerId(user);
    // Create a checkout session for the purchase
    if (!user.subscriptionId) {
      return NextResponse.json(
        { message: "No active subscription" },
        { status: 400 }
      );
    }
    const subscription = await stripe.subscriptions.retrieve(
      user.subscriptionId
    );
    const updatedSubscription = await stripe.subscriptions.update(
      user.subscriptionId,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subscription.items.data[0].id,
            price: recurringStripePrice.id,
          },
        ],
        proration_behavior: "create_prorations",
      }
    );
    user.plan = newPlan;
    await user.save();
    return NextResponse.json({ status: 200, message: "Subscription updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
