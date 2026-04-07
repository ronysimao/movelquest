import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
// carga-processor importado dinamicamente para não carregar ExcelJS (23MB) no cold start

// Validação por extensão de arquivo (mais confiável que MIME type,
// pois o browser pode enviar 'application/octet-stream' para .xlsx)
const ALLOWED_EXTENSIONS = [".xlsx", ".csv", ".pdf"];

// Mapa de MIME types esperados por extensão (para corrigir o contentType no Storage)
const MIME_BY_EXTENSION: Record<string, string> = {
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".csv": "text/csv",
    ".pdf": "application/pdf",
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

function getFileExtension(filename: string): string {
    const match = filename.toLowerCase().match(/\.[^.]+$/);
    return match ? match[0] : "";
}

/**
 * POST /api/upload — Upload file and create a carga record
 * Body: FormData with file
 * Validação por extensão (não por MIME type) para maior compatibilidade.
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

        // Validar por extensão de arquivo
        const ext = getFileExtension(file.name);
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                {
                    error: `Formato não suportado. Aceitamos apenas .xlsx, .csv e .pdf. Você enviou: "${file.name}". Se seu arquivo for .xls, salve como .xlsx no Excel (Arquivo → Salvar como → .xlsx).`,
                },
                { status: 400 }
            );
        }

        // Validar tamanho
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "Arquivo excede o limite de 50MB" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Usar o MIME type correto baseado na extensão (ignorar o que o browser enviou)
        const correctMimeType = MIME_BY_EXTENSION[ext] || file.type;

        // Upload para o Supabase Storage
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const storagePath = `uploads/${timestamp}_${safeName}`;
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from("cargas")
            .upload(storagePath, fileBuffer, {
                contentType: correctMimeType,
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json(
                { error: "Erro ao fazer upload do arquivo" },
                { status: 500 }
            );
        }

        // Criar registro da carga no banco
        const { data: carga, error: insertError } = await supabase
            .from("cargas")
            .insert({
                nome_arquivo: file.name,
                storage_path: storagePath,
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

        // Acionar processamento diretamente (sem HTTP round-trip)
        // Fire-and-forget: a promise resolve em background sem bloquear a resposta
        console.log(`[Upload] Acionando processamento direto para carga ${carga.id}...`);
        import("@/lib/carga-processor").then(({ processarCarga }) => {
            processarCarga(carga.id).then((result: unknown) => {
                console.log(`[Upload] Processamento da carga ${carga.id} finalizado:`, result);
            }).catch((err: unknown) => {
                console.error(`[Upload] Erro no processamento da carga ${carga.id}:`, err);
            });
        }).catch((err: unknown) => {
            console.error(`[Upload] Erro ao carregar módulo carga-processor:`, err);
        });

        return NextResponse.json({
            success: true,
            carga,
            message: `Arquivo "${file.name}" enviado com sucesso. Processamento iniciado.`,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
