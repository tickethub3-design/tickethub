// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { email, name, entry_code, event_title, event_date, event_location } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TicketHub <noreply@tickethub.app>',
      to: email,
      subject: `🎫 Booking Confirmed — ${event_title} | TicketHub`,
      html: `
        <div style="background:#0a0f1e;color:#fff;font-family:Inter,sans-serif;padding:48px 32px;max-width:580px;margin:0 auto;border-radius:16px;">

          <!-- HEADER -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:48px;">
            <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#1A3C5E,#2E75B6);display:flex;align-items:center;justify-content:center;font-size:20px;">🎟️</div>
            <div>
              <span style="font-family:Georgia,serif;font-weight:900;font-size:22px;color:#fff;letter-spacing:-0.5px;">
                Ticket<span style="color:#2E75B6;">Hub</span>
              </span>
              <p style="color:rgba(255,255,255,0.25);font-size:10px;letter-spacing:3px;margin:2px 0 0;">BOOKING CONFIRMED</p>
            </div>
          </div>

          <!-- GREETING -->
          <p style="color:rgba(255,255,255,0.5);font-size:16px;margin:0 0 8px;">
            Hey <strong style="color:#fff;">${name}</strong>,
          </p>
          <p style="color:rgba(255,255,255,0.3);font-size:15px;line-height:1.8;margin:0 0 40px;">
            You're all set! Your spot has been officially confirmed.<br/>
            Show the QR entry code below at the door.
          </p>

          <!-- EVENT DETAILS -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(46,117,182,0.2);border-radius:14px;padding:24px;margin-bottom:20px;">
            <p style="color:rgba(255,255,255,0.2);font-size:10px;letter-spacing:3px;margin:0 0 12px;font-weight:700;">EVENT DETAILS</p>
            <p style="color:#fff;font-size:20px;font-weight:900;margin:0 0 12px;letter-spacing:-0.5px;">${event_title}</p>
            <p style="color:rgba(255,255,255,0.35);font-size:13px;margin:0 0 6px;">📅 ${event_date}</p>
            <p style="color:rgba(255,255,255,0.35);font-size:13px;margin:0;">📍 ${event_location}</p>
          </div>

          <!-- ENTRY CODE -->
          <div style="background:rgba(39,174,96,0.05);border:1px solid rgba(39,174,96,0.25);border-radius:14px;padding:40px 24px;text-align:center;margin-bottom:40px;">
            <p style="color:rgba(255,255,255,0.2);font-size:10px;letter-spacing:4px;margin:0 0 16px;font-weight:700;">YOUR ENTRY CODE</p>
            <p style="color:#27AE60;font-size:52px;font-weight:900;letter-spacing:14px;font-family:monospace;margin:0 0 12px;">${entry_code}</p>
            <p style="color:rgba(255,255,255,0.15);font-size:11px;margin:0;letter-spacing:1px;">Present this code at the entrance</p>
          </div>

          <!-- INSTRUCTIONS -->
          <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px 24px;margin-bottom:40px;">
            <p style="color:rgba(255,255,255,0.2);font-size:10px;letter-spacing:3px;font-weight:700;margin:0 0 12px;">ENTRY INSTRUCTIONS</p>
            <p style="color:rgba(255,255,255,0.3);font-size:13px;line-height:1.8;margin:0;">
              🪪 Valid photo ID matching the ticket holder name is required.<br/>
              ⚠️ Each code is valid for one scan only — non-transferable.<br/>
              🚫 No refunds or date changes after confirmation.
            </p>
          </div>

          <!-- FOOTER -->
          <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:24px;text-align:center;">
            <p style="color:rgba(255,255,255,0.15);font-size:12px;margin:0 0 4px;">
              See you at the event! 🎉
            </p>
            <p style="color:rgba(255,255,255,0.1);font-size:11px;margin:0;">
              © TicketHub — tickethub.app · All rights reserved
            </p>
          </div>

        </div>
      `
    }),
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})