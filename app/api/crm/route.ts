import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CrmAction } from "@/lib/crm-actions";
import { SESSION_COOKIE, verificarToken } from "@/lib/auth";
import { applyCrmAction, getCrmData } from "@/lib/supabase/crm";

export const runtime = "nodejs";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verificarToken(token);
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const user = await getUser();
  if (!user) return jsonError("No autorizado", 401);

  try {
    const data = await getCrmData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/crm] GET", error);
    return jsonError(
      error instanceof Error ? error.message : "No se pudieron cargar los datos",
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return jsonError("No autorizado", 401);

  let action: CrmAction;
  try {
    action = (await req.json()) as CrmAction;
  } catch {
    return jsonError("Peticion invalida", 400);
  }

  try {
    await applyCrmAction(action);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/crm] POST", error);
    return jsonError(
      error instanceof Error ? error.message : "No se pudo guardar el cambio",
    );
  }
}
