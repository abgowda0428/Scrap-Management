import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ================= CORS ================= */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ================= SERVER ================= */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    /* ================= READ BODY ================= */
    const body = await req.json();

    const {
      email,
      password,
      full_name,
      role,
      department,
      employee_id,
      username,
      shift,
      is_active,
    } = body;

    /* ================= VALIDATION ================= */
    if (
      !email ||
      !password ||
      !role ||
      !employee_id ||
      !username
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          required: [
            "email",
            "password",
            "role",
            "employee_id",
            "username",
          ],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          error: "Password must be at least 6 characters",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    /* ================= ADMIN CLIENT ================= */
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // 🔥 REQUIRED
    );

    /* ================= CREATE AUTH USER ================= */
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          error: "Auth creation failed",
          details: authError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = authData.user.id;

    /* ================= INSERT INTO public.users ================= */
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId, // 👈 MUST MATCH auth.users.id
        employee_id,
        username,
        full_name,
        email,
        role,
        department,
        shift,
        is_active: is_active ?? true,
      });

    if (insertError) {
      return new Response(
        JSON.stringify({
          error: "Database insert failed",
          details: insertError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    /* ================= SUCCESS ================= */
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: err?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
