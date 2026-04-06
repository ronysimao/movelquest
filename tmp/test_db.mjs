import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
    const orgName = "Test Fabricante";
    const slug = "test-fab-" + Date.now().toString(36);
    const orgType = "fabricante";

    const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
            name: orgName,
            type: orgType,
            slug,
        })
        .select("id")
        .single();
        
    if (orgError) {
        console.error("ERRO ORGANIZACAO:", orgError);
        return;
    }
    console.log("Org:", org.id);
}

run();
