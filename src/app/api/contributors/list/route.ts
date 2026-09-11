import { NextResponse } from "next/server";
import { listContributorsByPeriod } from "@/services/setic/setic-client";

function isValidDateFormat(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function diffInDays(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diff = endDate.getTime() - startDate.getTime();

  return diff / (1000 * 60 * 60 * 24);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const dataInicio = String(body.dataInicio ?? "").trim();
    const dataFim = String(body.dataFim ?? "").trim();

    if (!dataInicio || !dataFim) {
      return NextResponse.json(
        {
          message: "Data inicial e data final são obrigatórias.",
        },
        { status: 400 }
      );
    }

    if (!isValidDateFormat(dataInicio) || !isValidDateFormat(dataFim)) {
      return NextResponse.json(
        {
          message: "As datas devem estar no formato AAAA-MM-DD.",
        },
        { status: 400 }
      );
    }

    const days = diffInDays(dataInicio, dataFim);

    if (days < 0) {
      return NextResponse.json(
        {
          message: "A data final não pode ser anterior à data inicial.",
        },
        { status: 400 }
      );
    }

    if (days >= 30) {
      return NextResponse.json(
        {
          message: "O período de consulta deve ser inferior a 30 dias.",
        },
        { status: 400 }
      );
    }

    const data = await listContributorsByPeriod({
      dataInicio,
      dataFim,
    });

    return NextResponse.json({
      message: data.mensagem,
      contributors: data.ListarContribuinte ?? [],
    });
  } catch (error) {
    console.error("[SETIC-FP] Falha ao listar contribuintes:", error);

    return NextResponse.json(
      {
        message: "Erro ao listar contribuintes.",
      },
      { status: 500 }
    );
  }
}
