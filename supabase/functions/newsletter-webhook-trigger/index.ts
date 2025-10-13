// Supabase Edge Function to trigger n8n webhook when a new subscriber is added
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Starting newsletter webhook trigger function");

serve(async (req) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the payload from the request
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    // Check if this is an INSERT operation on blog_subscribers
    if (payload.type === 'INSERT' && payload.table === 'blog_subscribers') {
      const newSubscriber = payload.record;
      
      // Only trigger webhook for pending subscribers (new signups)
      if (newSubscriber.status === 'pending') {
        console.log("New pending subscriber detected, triggering webhook for:", newSubscriber.email);
        
        // Call our Next.js webhook automation endpoint
        const webhookUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') + '/api/admin/newsletter-webhook-automation';
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ subscriber: newSubscriber })
        });

        if (response.ok) {
          console.log("Webhook triggered successfully for:", newSubscriber.email);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Webhook triggered successfully',
              subscriber: newSubscriber.email
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } else {
          const errorText = await response.text();
          console.error("Webhook trigger failed:", response.status, errorText);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to trigger webhook',
              status: response.status,
              details: errorText
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      } else {
        console.log("Subscriber status is not 'pending', skipping webhook trigger");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Subscriber status is not pending, webhook not triggered',
            status: newSubscriber.status
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log("Event is not an INSERT on blog_subscribers, ignoring");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Event ignored, not a new subscriber INSERT',
          type: payload.type,
          table: payload.table
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in newsletter webhook trigger function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});