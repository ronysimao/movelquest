import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.perfil !== "admin") {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const movelIdStr = formData.get("movel_id") as string | null;

        if (!file || !movelIdStr) {
            return NextResponse.json(
                { error: "Arquivo ou ID do móvel ausente" },
                { status: 400 }
            );
        }

        const movelId = parseInt(movelIdStr, 10);
        if (isNaN(movelId)) {
            return NextResponse.json(
                { error: "ID de móvel inválido" },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Formato de imagem inválido. Use JPG, PNG ou WEBP." },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "Imagem excede o limite de 5MB" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Sanitize file name for URL safety
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const storagePath = `${Date.now()}_${safeName}`;
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(arrayBuffer);

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from("moveis_imagens")
            .upload(storagePath, fileBuffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json(
                { error: "Erro ao fazer upload da imagem para o Storage" },
                { status: 500 }
            );
        }

        // Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from("moveis_imagens")
            .getPublicUrl(storagePath);

        const imagemUrl = publicUrlData.publicUrl;

        // Update Database
        const { error: updateError } = await supabase
            .from("moveis")
            .update({ imagem_url: imagemUrl })
            .eq("id", movelId);

        if (updateError) {
            console.error("DB update error:", updateError);
            return NextResponse.json(
                { error: "Erro ao atualizar registro no banco" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            imagem_url: imagemUrl,
            message: "Imagem atualizada com sucesso.",
        });
    } catch (error) {
        console.error("Upload route error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.perfil !== "admin") {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const movelIdStr = searchParams.get("movel_id");

        if (!movelIdStr) {
            return NextResponse.json(
                { error: "ID do móvel ausente" },
                { status: 400 }
            );
        }

        const movelId = parseInt(movelIdStr, 10);
        const supabase = createAdminClient();

        // 1. Get the current image URL
        const { data: movel, error: fetchError } = await supabase
            .from("moveis")
            .select("imagem_url")
            .eq("id", movelId)
            .single();

        if (fetchError || !movel) {
            return NextResponse.json(
                { error: "Móvel não encontrado" },
                { status: 404 }
            );
        }

        if (movel.imagem_url) {
            // Extract file name from URL
            // Format is usually .../storage/v1/object/public/moveis_imagens/FILENAME
            const parts = movel.imagem_url.split("/");
            const fileName = parts[parts.length - 1];

            if (fileName) {
                // 2. Delete from Storage
                const { error: storageError } = await supabase.storage
                    .from("moveis_imagens")
                    .remove([fileName]);

                if (storageError) {
                    console.error("Storage delete error:", storageError);
                    // We continue even if storage delete fails (maybe file was already gone)
                }
            }
        }

        // 3. Update Database
        const { error: updateError } = await supabase
            .from("moveis")
            .update({ imagem_url: null })
            .eq("id", movelId);

        if (updateError) {
            console.error("DB update error:", updateError);
            return NextResponse.json(
                { error: "Erro ao atualizar banco de dados" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Imagem removida com sucesso.",
        });
    } catch (error) {
        console.error("Delete route error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
