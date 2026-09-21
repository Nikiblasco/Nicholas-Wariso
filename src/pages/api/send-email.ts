import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Resend API key missing in environment variables.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const body = await request.json();
    const { name, email, message } = body;

    // 1. Send notification to you
    const notification = await resend.emails.send({
     from: 'Portfolio Contact <hello@nicholaswariso.com>',
      to: ['NicholasWariso@gmail.com'],
      subject: `New Project Inquiry from ${name}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <blockquote>
          ${message}
        </blockquote>
      `,
    });

    if (notification.error) {
      console.error('Notification email failed:', notification.error);

      return new Response(
        JSON.stringify({
          error: 'Notification email failed',
          details: notification.error,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Send confirmation to client
    const confirmation = await resend.emails.send({
      from: 'Portfolio Contact <hello@nicholaswariso.com>',
      to: [email],
      subject: 'Thanks for reaching out!',
      html: `
        <h2>Got your message, ${name}!</h2>

        <p>
          Thanks for telling me about your project.
          I've received your request and will review what
          you're looking to automate or build.
        </p>

        <p>I'll get back to you shortly.</p>

        <br>

        <p>Best regards,</p>

        <p>
          <strong>Nicholas Wariso-Elvis</strong><br>
          Software for businesses
        </p>
      `,
    });

    if (confirmation.error) {
      console.error('Confirmation email failed:', confirmation.error);

      return new Response(
        JSON.stringify({
          error: 'Confirmation email failed',
          details: confirmation.error,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationId: notification.data?.id,
        confirmationId: confirmation.data?.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        error: 'Unexpected server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};