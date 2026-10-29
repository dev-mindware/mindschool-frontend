"use client";

import React, { useEffect, useState } from "react";
import { GlobalModal, Icon, Skeleton, Tabs, TabsList, TabsTrigger } from "@/components";
import { Button } from "@/components/ui/button";
import { studentsService, type StudentCardPreviewData } from "@/services/students-service";
import { toast } from "sonner";
import QRCode from "qrcode";

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export function StudentIdCardModal({
  isOpen,
  onClose,
  studentId,
  studentName,
}: StudentIdCardModalProps) {
  const [data, setData] = useState<StudentCardPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  // QR real com o n.º de processo e a escola (antes era um ícone genérico que não lia nada)
  useEffect(() => {
    if (!data?.student.studentNumber) { setQrUrl(null); return; }
    // o mesmo endereço de verificação que o PDF imprime, para a pré-visualização e o cartão lerem igual
    const payload = data.verificationUrl ?? `MINDSCHOOL|${data.school.nif ?? ""}|${data.student.studentNumber}`;
    let cancelled = false;
    void QRCode.toDataURL(payload, { margin: 1, width: 192, errorCorrectionLevel: "M" }).then((url) => { if (!cancelled) setQrUrl(url); }).catch(() => { if (!cancelled) setQrUrl(null); });
    return () => { cancelled = true; };
  }, [data]);

  useEffect(() => {
    if (!isOpen || !studentId) return;

    let mounted = true;
    setLoading(true);
    studentsService
      .getCardData(studentId)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do cartão:", err);
        toast.error("Não foi possível carregar os dados do cartão.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, studentId]);

  const handleDownloadPdf = async () => {
    if (!studentId) return;
    try {
      setDownloading(true);
      toast.info("A gerar o PDF de alta resolução do cartão de estudante...");
      await studentsService.downloadCardPdf(studentId, studentName);
      toast.success("Cartão de estudante descarregado com sucesso!");
    } catch (err) {
      console.error("Erro ao descarregar PDF do cartão:", err);
      toast.error("Erro ao gerar o ficheiro PDF do cartão.");
    } finally {
      setDownloading(false);
    }
  };

  const palette = data?.palette ?? {
    primary: "#9956f6",
    dark: "#3b1768",
    medium: "#7c3aed",
    light: "#ddd6fe",
    pastel: "#f3e8ff",
    accent: "#9956f6",
    textDark: "#111827",
    textMuted: "#6b7280",
    cardBg: "#ffffff",
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      size="xl"
      title={
        <span className="flex items-center gap-2">
          <Icon name="CreditCard" className="w-4 h-4 text-primary" />
          Cartão de Estudante
        </span>
      }
      description={`${studentName} • ${data?.school.name || "MindSchool"}`}
      headerExtra={
        data?.school.primaryColor ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/40">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: data.school.primaryColor }}
            />
            <span className="font-mono text-muted-foreground">{data.school.primaryColor}</span>
          </div>
        ) : undefined
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={downloading}>
            Fechar
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={loading || downloading}
            className="gap-2"
            style={{ backgroundColor: palette.primary || "var(--primary)" }}
          >
            {downloading ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 animate-spin" />
                A descarregar...
              </>
            ) : (
              <>
                <Icon name="Download" className="w-4 h-4" />
                Descarregar PDF Oficial
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Alternador de Face: Frente / Verso */}
        <div className="flex items-center justify-between">
          <Tabs value={activeSide} onValueChange={(v) => setActiveSide(v as "front" | "back")}>
            <TabsList className="h-8">
              <TabsTrigger value="front" className="text-xs px-3">
                Frente
              </TabsTrigger>
              <TabsTrigger value="back" className="text-xs px-3">
                Verso
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Icon name="Sparkles" className="w-3 h-3 text-amber-500" />
            Tons automáticos da escola
          </div>
        </div>

        {/* Área do Cartão com aspecto CR80 (280x443px) */}
        <div className="p-4 flex items-center justify-center rounded-xs bg-muted/30">
          {loading ? (
            <div className="w-[280px] h-[443px] flex flex-col items-center justify-center gap-3 rounded-xs border border-border bg-card shadow-md p-6">
              <Skeleton className="size-16 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
              <div className="w-full space-y-2 pt-6">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="size-16 rounded-xs mt-auto" />
            </div>
          ) : (
            <div
              className="relative w-[280px] h-[443px] rounded-xs overflow-hidden border border-slate-200 shadow-xl select-none"
              style={{ backgroundColor: palette.cardBg }}
            >
              {/* ========================================================= */}
              {/* TEXTURA GEOMÉTRICA DO CANTO SUPERIOR ESQUERDO             */}
              {/* ========================================================= */}
              {/* no verso as texturas encolhem para os cantos: o nome da escola, o NIF e o rodapé ficam livres */}
              <div className={`absolute top-0 left-0 w-28 h-28 pointer-events-none z-10 origin-top-left ${activeSide === "back" ? "scale-[0.42]" : ""}`}>
                {/* Bloco 1: Pastel suave */}
                <div
                  className="absolute top-0 left-0 w-[88px] h-[60px]"
                  style={{ backgroundColor: palette.pastel }}
                />
                {/* Bloco 2: Médio topo */}
                <div
                  className="absolute top-0 left-[52px] w-[56px] h-[48px]"
                  style={{ backgroundColor: palette.medium }}
                />
                {/* Bloco 3: Escuro topo */}
                <div
                  className="absolute top-0 left-[92px] w-[42px] h-[48px]"
                  style={{ backgroundColor: palette.dark }}
                />
                {/* Bloco 4: Médio vertical lateral */}
                <div
                  className="absolute top-[44px] left-0 w-[56px] h-[80px]"
                  style={{ backgroundColor: palette.medium }}
                />
                {/* Bloco 5: Escuro lateral */}
                <div
                  className="absolute top-[108px] left-0 w-[44px] h-[52px]"
                  style={{ backgroundColor: palette.dark }}
                />
                {/* Bloco 6: Pastel flutuante */}
                <div
                  className="absolute top-[60px] left-[30px] w-[42px] h-[60px] shadow-sm"
                  style={{ backgroundColor: palette.pastel }}
                />
                {/* Linha de wireframe decorativa */}
                <div
                  className="absolute top-[18px] left-[48px] w-[60px] h-[52px] border"
                  style={{ borderColor: palette.accent }}
                />
              </div>

              {/* ========================================================= */}
              {/* TEXTURA GEOMÉTRICA DO CANTO INFERIOR DIREITO              */}
              {/* ========================================================= */}
              <div className={`absolute bottom-0 right-0 w-28 h-32 pointer-events-none z-10 origin-bottom-right ${activeSide === "back" ? "scale-[0.42]" : ""}`}>
                {/* Bloco 1: Escuro lateral direita */}
                <div
                  className="absolute bottom-0 right-0 w-[70px] h-[122px]"
                  style={{ backgroundColor: palette.dark }}
                />
                {/* Bloco 2: Médio inferior */}
                <div
                  className="absolute bottom-0 right-0 w-[82px] h-[82px]"
                  style={{ backgroundColor: palette.medium }}
                />
                {/* Bloco 3: Escuro base */}
                <div
                  className="absolute bottom-0 right-[22px] w-[56px] h-[60px]"
                  style={{ backgroundColor: palette.dark }}
                />
                {/* Bloco 4: Pastel flutuante superior */}
                <div
                  className="absolute bottom-[44px] right-[10px] w-[50px] h-[58px] shadow-sm"
                  style={{ backgroundColor: palette.pastel }}
                />
                {/* Bloco 5: Pastel flutuante base */}
                <div
                  className="absolute bottom-0 right-0 w-[50px] h-[60px]"
                  style={{ backgroundColor: palette.pastel }}
                />
                {/* Linha de wireframe decorativa */}
                <div
                  className="absolute bottom-[20px] right-[40px] w-[64px] h-[54px] border"
                  style={{ borderColor: palette.accent }}
                />
              </div>

              {/* ========================================================= */}
              {/* CONTEÚDO: FACE FRONTAL                                    */}
              {/* ========================================================= */}
              {activeSide === "front" ? (
                <div className="relative w-full h-full p-4 flex flex-col z-20">
                  {/* Topo: Emblema / Logotipo Escolar no canto superior direito */}
                  <div className="flex justify-end pr-1 pt-1">
                    <div
                      className="w-11 h-11 rounded-full border-2 p-0.5 flex items-center justify-center bg-white shadow-sm"
                      style={{ borderColor: palette.primary }}
                    >
                      {data?.school.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={data.school.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-contain rounded-full"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full border flex items-center justify-center"
                          style={{ borderColor: palette.medium, backgroundColor: palette.pastel }}
                        >
                          <Icon name="GraduationCap" className="w-5 h-5" style={{ color: palette.primary }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Título do Cartão */}
                  <div className="mt-2 text-center">
                    <h2
                      className="text-[11px] font-black tracking-widest uppercase"
                      style={{ color: palette.dark }}
                    >
                      CARTÃO DE ESTUDANTE
                    </h2>
                  </div>

                  {/* Foto do Aluno + Código de Barras Vertical */}
                  <div className="mt-3 flex items-center justify-center gap-3 pl-3">
                    {/* Moldura da Foto */}
                    <div
                      className="w-[112px] h-[138px] rounded-xs overflow-hidden border shadow-sm flex items-center justify-center bg-white"
                      style={{ borderColor: palette.light }}
                    >
                      {data?.student.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={data.student.photoUrl}
                          alt={data.student.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center"
                          style={{ backgroundColor: palette.pastel }}
                        >
                          <Icon name="User" className="w-12 h-12" style={{ color: palette.medium }} />
                          <span
                            className="text-[9px] font-medium mt-1 uppercase tracking-wider"
                            style={{ color: palette.textMuted }}
                          >
                            Foto 3x4
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Código de barras estilizado vertical */}
                    <div className="flex flex-col gap-[2px] py-1">
                      {[6, 2, 4, 1, 5, 2, 3, 6, 2, 4, 1, 3, 5, 2, 4, 6, 1, 3, 5, 2, 4, 6, 2, 3, 5].map(
                        (thickness, idx) => (
                          <div
                            key={idx}
                            className="w-4 rounded-[1px]"
                            style={{
                              height: `${thickness * 0.9}px`,
                              backgroundColor: palette.dark,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Dados do Aluno */}
                  <div className="mt-4 px-3 space-y-1.5 text-[10px]">
                    <div className="flex items-baseline">
                      <span className="w-16 font-bold" style={{ color: palette.dark }}>
                        Nome
                      </span>
                      <span className="font-bold mr-2" style={{ color: palette.dark }}>
                        :
                      </span>
                      <span
                        className="font-medium truncate max-w-[150px]"
                        style={{ color: palette.textDark }}
                      >
                        {data?.student.fullName || studentName}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="w-16 font-bold" style={{ color: palette.dark }}>
                        Nº Proc.
                      </span>
                      <span className="font-bold mr-2" style={{ color: palette.dark }}>
                        :
                      </span>
                      <span
                        className="font-mono font-medium"
                        style={{ color: palette.textDark }}
                      >
                        {data?.student.studentNumber || "---"}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="w-16 font-bold" style={{ color: palette.dark }}>
                        Turma
                      </span>
                      <span className="font-bold mr-2" style={{ color: palette.dark }}>
                        :
                      </span>
                      <span
                        className="font-medium truncate max-w-[150px]"
                        style={{ color: palette.textDark }}
                      >
                        {[data?.student.classLevel, data?.student.className].filter(Boolean).join(" • ") || "---"}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="w-16 font-bold" style={{ color: palette.dark }}>
                        Validade
                      </span>
                      <span className="font-bold mr-2" style={{ color: palette.dark }}>
                        :
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: palette.textDark }}
                      >
                        {data?.student.validity || "Ano Letivo"}
                      </span>
                    </div>
                  </div>

                  {/* Área da Assinatura (Canto inferior esquerdo) */}
                  <div className="mt-auto pl-3 pb-2">
                    <div className="w-20 flex flex-col items-center">
                      <svg viewBox="0 0 80 20" className="w-16 h-4">
                        <path
                          d="M 5,14 Q 20,4 32,15 T 55,6 Q 65,12 75,8"
                          fill="none"
                          stroke={palette.dark}
                          strokeWidth="1.2"
                        />
                      </svg>
                      <div
                        className="w-20 border-b mt-0.5"
                        style={{ borderColor: palette.dark }}
                      />
                      <span
                        className="text-[7.5px] mt-0.5 font-medium"
                        style={{ color: palette.textMuted }}
                      >
                        Assinatura do Aluno
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================= */
                /* CONTEÚDO: VERSO DO CARTÃO (TERMOS E CONTACTOS)            */
                /* ========================================================= */
                <div className="relative w-full h-full px-4 pt-12 pb-16 flex flex-col z-20">
                  {/* Cabeçalho do Verso */}
                  <div className="text-center pt-2">
                    <h3
                      className="text-[10px] font-black uppercase tracking-wider truncate"
                      style={{ color: palette.dark }}
                    >
                      {data?.school.name || "ESCOLA OFICIAL"}
                    </h3>
                    {data?.school.nif && (
                      <p
                        className="text-[8px] font-medium mt-0.5"
                        style={{ color: palette.textMuted }}
                      >
                        NIF: {data.school.nif}
                      </p>
                    )}
                    <div
                      className="w-3/4 mx-auto border-b my-2"
                      style={{ borderColor: palette.pastel }}
                    />
                  </div>

                  {/* QR Code de Validação */}
                  <div className="flex flex-col items-center justify-center my-auto py-2">
                    <div
                      className="w-24 h-24 p-1.5 rounded-xs border bg-white shadow-sm flex items-center justify-center"
                      style={{ borderColor: palette.light }}
                    >
                      {qrUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrUrl} alt={`QR do processo ${data?.student.studentNumber ?? ""}`} className="w-20 h-20" />
                      ) : (
                        <Icon name="QrCode" className="w-20 h-20" style={{ color: palette.dark }} />
                      )}
                    </div>
                    <span
                      className="text-[7.5px] font-medium mt-1.5 text-center max-w-[180px]"
                      style={{ color: palette.textMuted }}
                    >
                      Digitalize para ler o n.º de processo do aluno
                    </span>
                  </div>

                  {/* Termos e Condições */}
                  <div className="mt-auto px-1 space-y-1">
                    <span
                      className="text-[8px] font-bold block uppercase"
                      style={{ color: palette.dark }}
                    >
                      Termos e Condições
                    </span>
                    <p
                      className="text-[7px] leading-relaxed text-justify"
                      style={{ color: palette.textDark }}
                    >
                      1. Cartão pessoal e intransmissível para uso diário.
                      <br />
                      2. Obrigatório para identificação, acesso e biblioteca.
                      <br />
                      3. Em caso de extravio, contacte a secretaria.
                    </p>
                  </div>

                  {/* Rodapé institucional */}
                  <div
                    className="border-t pt-1.5 mt-2 text-center text-[6.5px]"
                    style={{ borderColor: palette.pastel, color: palette.textMuted }}
                  >
                    {[data?.school.address, data?.school.phone, data?.school.email]
                      .filter(Boolean)
                      .join(" • ") || "República de Angola • Ministério da Educação"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GlobalModal>
  );
}
