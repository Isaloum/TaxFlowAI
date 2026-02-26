import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

const PRICE_ID     = process.env.STRIPE_PRICE_ID!;      // per-seat monthly price
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.isaloumapps.com';
const TRIAL_DAYS   = 30;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/billing/status
// Return current subscription status for the logged-in accountant
// ─────────────────────────────────────────────────────────────────────────────
export const getBillingStatus = async (req: Request, res: Response) => {
  try {
    const accountantId = req.user!.sub;

    const accountant = await prisma.accountant.findUnique({
      where: { id: accountantId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        _count: { select: { clients: true } },
      },
    });

    if (!accountant) return res.status(404).json({ error: 'Accountant not found' });

    res.json({
      subscriptionStatus: accountant.subscriptionStatus,
      trialEndsAt:        accountant.trialEndsAt,
      currentPeriodEnd:   accountant.currentPeriodEnd,
      clientCount:        accountant._count.clients,
      hasStripe:          !!accountant.stripeSubscriptionId,
    });
  } catch (error) {
    console.error('Billing status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/billing/checkout
// Create a Stripe Checkout session (accountant subscribes)
// Quantity = number of current clients
// ─────────────────────────────────────────────────────────────────────────────
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const accountantId = req.user!.sub;

    const accountant = await prisma.accountant.findUnique({
      where: { id: accountantId },
      include: { _count: { select: { clients: true } } },
    });

    if (!accountant) return res.status(404).json({ error: 'Accountant not found' });

    // Create or reuse Stripe customer
    let customerId = accountant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: accountant.email,
        name:  accountant.firmName,
        metadata: { accountantId },
      });
      customerId = customer.id;
      await prisma.accountant.update({
        where: { id: accountantId },
        data:  { stripeCustomerId: customerId },
      });
    }

    const clientCount = Math.max(accountant._count.clients, 1); // min 1 seat

    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       'subscription',
      line_items: [{
        price:    PRICE_ID,
        quantity: clientCount,
      }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { accountantId },
      },
      success_url: `${FRONTEND_URL}/accountant/billing?success=true`,
      cancel_url:  `${FRONTEND_URL}/accountant/billing?canceled=true`,
      metadata: { accountantId },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/billing/portal
// Open Stripe Customer Portal (manage/cancel subscription)
// ─────────────────────────────────────────────────────────────────────────────
export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const accountantId = req.user!.sub;

    const accountant = await prisma.accountant.findUnique({
      where: { id: accountantId },
      select: { stripeCustomerId: true },
    });

    if (!accountant?.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   accountant.stripeCustomerId,
      return_url: `${FRONTEND_URL}/accountant/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/billing/webhook
// Stripe webhook — keeps DB in sync with subscription events
// Must be mounted BEFORE express.json() to receive raw body
// ─────────────────────────────────────────────────────────────────────────────
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig     = req.headers['stripe-signature'] as string;
  const secret  = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const accountantId = session.metadata?.accountantId;
        if (!accountantId || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await prisma.accountant.update({
          where: { id: accountantId },
          data: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus:   sub.status,
            currentPeriodEnd:     new Date((sub as any).current_period_end * 1000),
            trialEndsAt:          sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const accountantId = sub.metadata?.accountantId;
        if (!accountantId) break;

        await prisma.accountant.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            subscriptionStatus: sub.status,
            currentPeriodEnd:   new Date((sub as any).current_period_end * 1000),
            trialEndsAt:        sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        }).catch(() => {}); // ignore if accountant not found
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        await prisma.accountant.update({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data:  { subscriptionStatus: 'past_due' },
        }).catch(() => {});
        break;
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
  }

  res.json({ received: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — update seat quantity when client count changes
// Called from accountant.controller.ts on createClient / deleteClient
// ─────────────────────────────────────────────────────────────────────────────
export async function syncStripeSeats(accountantId: string): Promise<void> {
  try {
    const accountant = await prisma.accountant.findUnique({
      where: { id: accountantId },
      select: {
        stripeSubscriptionId: true,
        subscriptionStatus:   true,
        _count: { select: { clients: true } },
      },
    });

    if (!accountant?.stripeSubscriptionId) return; // no subscription yet
    if (!['active', 'trialing'].includes(accountant.subscriptionStatus)) return;

    const sub = await stripe.subscriptions.retrieve(accountant.stripeSubscriptionId);
    const itemId = sub.items.data[0]?.id;
    if (!itemId) return;

    await stripe.subscriptionItems.update(itemId, {
      quantity: Math.max(accountant._count.clients, 1),
    });
  } catch (error) {
    console.error('syncStripeSeats error:', error); // non-fatal
  }
}
