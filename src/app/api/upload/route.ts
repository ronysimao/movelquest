import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

const ALLOWED_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-excel", // xls
    "application/pdf",
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * POST /api/upload — Upload file and create a carga record
 * Body: FormData with file
 */
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

        if (!file) {
            return NextResponse.json(
                { error: "Nenhum arquivo enviado" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    error: "Formato de arquivo inválido. Apenas XLSX e PDF são aceitos.",
                },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "Arquivo excede o limite de 50MB" },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Upload to Supabase Storage
        const timestamp = Date.now();
        const storagePath = `uploads/${timestamp}_${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from("cargas")
            .upload(storagePath, fileBuffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json(
                { error: "Erro ao fazer upload do arquivo" },
                { status: 500 }
            );
        }

        // Create carga record
        const { data: carga, error: insertError } = await supabase
            .from("cargas")
            .insert({
                nome_arquivo: file.name,
                storage_path: storagePath, // Salvando o caminho para exclusão futura
                status: "processando",
                registros_processados: 0,
                usuario_id: session.id,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert carga error:", insertError);
            return NextResponse.json(
                { error: "Erro ao registrar carga" },
                { status: 500 }
            );
        }

        // Trigger Windmill processing workflow
        const WINDMILL_URL = process.env.WINDMILL_BASE_URL || "https://rys-wks-windmill-server.u190ym.easypanel.host";
        console.log(`Triggering Windmill job for carga ${carga.id} at ${WINDMILL_URL}...`);

        try {
            const wmResponse = await fetch(
                `${WINDMILL_URL}/api/w/admins/jobs/run/p/f/movelquest/process_xlsx`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.WINDMILL_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                        supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
                        carga_id: carga.id,
                        storage_path: storagePath,
                        filename: file.name,
                    }),
                }
            );

            if (!wmResponse.ok) {
                const wmError = await wmResponse.text();
                console.error("Windmill trigger failed:", wmResponse.status, wmError);
                // We don't fail the upload, but log the error
            } else {
                console.log("Windmill job triggered successfully");
            }
        } catch (wmErr) {
            console.error("Error triggering Windmill:", wmErr);
        }

        return NextResponse.json({
            success: true,
            carga,
            message: "Arquivo enviado com sucesso. Processamento iniciado.",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
