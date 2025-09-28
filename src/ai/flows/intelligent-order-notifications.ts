'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligently determining when to send push notifications to waiters and customers
 *  based on order status changes and estimated preparation times.
 *
 * - intelligentOrderNotifications - A function that triggers the notification logic.
 * - IntelligentOrderNotificationsInput - The input type for the intelligentOrderNotifications function.
 * - IntelligentOrderNotificationsOutput - The return type for the intelligentOrderNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentOrderNotificationsInputSchema = z.object({
  orderId: z.string().describe('The unique identifier for the order.'),
  orderStatus: z.enum([
    'received',
    'sent_to_chef',
    'preparing',
    'ready',
    'delivered',
  ]).describe('The current status of the order.'),
  customerPhoneNumber: z.string().describe('The customer phone number to send notification to.'),
  waiterPhoneNumber: z.string().describe('The waiter phone number to send notification to.'),
  estimatedPrepTimeMinutes: z.number().optional().describe('The estimated preparation time in minutes.'),
});
export type IntelligentOrderNotificationsInput = z.infer<typeof IntelligentOrderNotificationsInputSchema>;

const IntelligentOrderNotificationsOutputSchema = z.object({
  customerNotificationSent: z.boolean().describe('Whether a notification was sent to the customer.'),
  waiterNotificationSent: z.boolean().describe('Whether a notification was sent to the waiter.'),
  notificationMessage: z.string().describe('The content of the notification message.'),
});
export type IntelligentOrderNotificationsOutput = z.infer<typeof IntelligentOrderNotificationsOutputSchema>;

export async function intelligentOrderNotifications(input: IntelligentOrderNotificationsInput): Promise<IntelligentOrderNotificationsOutput> {
  return intelligentOrderNotificationsFlow(input);
}

const notificationPrompt = ai.definePrompt({
  name: 'notificationPrompt',
  input: {schema: IntelligentOrderNotificationsInputSchema},
  output: {schema: IntelligentOrderNotificationsOutputSchema},
  prompt: `You are an intelligent notification system for a cafe.

  Based on the order status ({{{orderStatus}}}), order ID ({{{orderId}}}), and estimated preparation time ({{{estimatedPrepTimeMinutes}}} minutes), determine whether to send a push notification to the customer and/or the waiter.

  Consider the following:
  - Only notify the customer when there is significant change in the order status that they need to be aware of.
  - Only notify the waiter if their attention is required.
  - Avoid sending too many notifications to avoid annoying the customer and waiter.
  - If estimatedPrepTimeMinutes is available, use it to make a decision as to when to notify customer that the order is getting prepared or is ready.

  Return the customerNotificationSent and waiterNotificationSent boolean fields to indicate whether a notification should be sent to each.
  Return the notificationMessage field, to be the content of the notification.

  Output in JSON format.
  `,
});

const intelligentOrderNotificationsFlow = ai.defineFlow(
  {
    name: 'intelligentOrderNotificationsFlow',
    inputSchema: IntelligentOrderNotificationsInputSchema,
    outputSchema: IntelligentOrderNotificationsOutputSchema,
  },
  async input => {
    const {output} = await notificationPrompt(input);
    return output!;
  }
);
