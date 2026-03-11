import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

/**
 * DELETE /api/cargas/[id] — Delete a carga or cancel its processing
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.perfil !== "admin") {
            return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
        }

        const params = await context.params;
        const id = Number(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get the carga first to know the storage path
        const { data: carga, error: fetchError } = await supabase
            .from("cargas")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !carga) {
            return NextResponse.json({ error: "Carga não encontrada" }, { status: 404 });
        }

        // 2. Delete the record from Supabase table
        const { error: deleteError } = await supabase
            .from("cargas")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Error deleting carga:", deleteError);
            return NextResponse.json({ error: "Erro ao excluir carga" }, { status: 500 });
        }

        // 3. Delete the file from Storage
        if (carga.storage_path) {
            console.log(`Deleting storage file: ${carga.storage_path}`);
            const { error: storageError } = await supabase.storage
                .from("cargas")
                .remove([carga.storage_path]);
            
            if (storageError) {
                console.error("Error deleting storage file:", storageError);
                // We continue since the DB record is already gone, 
                // but we log it for admin investigation.
            }
        }

        return NextResponse.json({
            success: true,
            message: "Carga cancelada e excluída com sucesso",
        });
    } catch (error) {
        console.error("Delete carga error:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
