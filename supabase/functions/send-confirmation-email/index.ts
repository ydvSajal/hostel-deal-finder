import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationUrl: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, name }: ConfirmationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "BU_Basket <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your BU_Basket account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #333; margin: 0;">Welcome to BU_Basket!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}!</h2>
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              Thank you for signing up for BU_Basket - Bennett University's marketplace for students.
            </p>
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              To complete your registration and start buying and selling on our platform, please confirm your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: hsl(221.2 83.2% 53.3%); color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block; 
                        font-weight: 600; font-size: 16px;">
                Confirm Your Account
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin: 20px 0; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #0066cc; word-break: break-all; font-size: 14px;">
              ${confirmationUrl}
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with BU_Basket, you can safely ignore this email.</p>
            <p style="margin-top: 20px;">
              <strong>BU_Basket Team</strong><br>
              Bennett University Student Marketplace
            </p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);