"use client";

import React, { useState, useMemo } from "react";
import { LegalLayout, LegalSectionItem } from "@/components/legal/legal-layout";
import { Scale } from "lucide-react";

const SECTIONS: LegalSectionItem[] = [
  { id: "preambulo", title: "Preâmbulo e Aceitação Electrónica", number: "1" },
  { id: "identificacao", title: "Entidade Operadora e Foro Territorial", number: "2" },
  { id: "contas-seguranca", title: "Contas, Papéis, Isolamento Multi-Tenant e Segurança", number: "3" },
  { id: "regime-pedagogico", title: "Regime Académico, Pautas e Conformidade MED (Lei 17/16)", number: "4" },
  { id: "documentos-verificacao", title: "Emissão de Documentos Oficiais e Verificação Pública", number: "5" },
  { id: "portais-comunicacao", title: "Portais da Família/Aluno, Saúde Escolar e Serviços", number: "6" },
  { id: "faturacao-agt", title: "Propinas, Liquidações e Facturação Certificada AGT (MindGest)", number: "7" },
  { id: "sla-disponibilidade", title: "Níveis de Serviço (SLA), Manutenção e Salvaguarda", number: "8" },
  { id: "responsabilidade", title: "Limitação de Responsabilidade e Força Maior", number: "9" },
  { id: "rescisao-foro", title: "Cessação, Conservação do Acervo Escolar e Jurisdição", number: "10" },
];

export default function TermsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return SECTIONS;
    const term = searchTerm.toLowerCase();
    return SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(term) ||
        sec.number?.includes(term)
    );
  }, [searchTerm]);

  return (
    <LegalLayout
      documentType="TERMS"
      title="Termos Gerais de Utilização e Contrato de Prestação de Serviços SaaS"
      subtitle="Regulamento contratual aplicável à plataforma de gestão escolar, académica, pedagógica, pautas oficiais do MED, propinas e facturação electrónica certificada pela AGT, em estrita conformidade com o ordenamento jurídico da República de Angola."
      version="2.4 / AO"
      effectiveDate="10 de Novembro de 2026"
      sections={filteredSections}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {/* 1. Preâmbulo e Aceitação Electrónica */}
      <section id="preambulo" className="space-y-4 pt-2 border-t border-border/40 first:border-t-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 1.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Preâmbulo, Objecto e Aceitação Contratual Electrónica
          </h2>
        </div>

        <p>
          1.1. O presente Contrato de Prestação de Serviços em regime de <em>Software as a Service</em> (doravante designado por <strong>&ldquo;Contrato&rdquo;</strong> ou <strong>&ldquo;Termos de Utilização&rdquo;</strong>) regula o acesso e utilização da plataforma tecnológica integrada de gestão escolar <strong>MindSchool</strong> (acessível através dos domínios oficiais do ecossistema <code>mindware.ao</code> e subdomínios associados), propriedade da <strong>MINDWARE — Comércio e Serviços, Lda.</strong>
        </p>

        <p>
          1.2. A celebração do presente contrato e a adesão institucional realizam-se por via electrónica, ao abrigo do artigo 18.º e seguintes da <strong>Lei n.º 23/11, de 20 de Junho (Lei das Comunicações Electrónicas e dos Serviços da Sociedade da Informação)</strong>. A activação da conta institucional, a definição da credencial de acesso pelo Titular ou o uso continuado da plataforma constituem declaração expressa, inequívoca e vinculativa de concordância com todas as cláusulas aqui estipuladas.
        </p>

        <p>
          1.3. A plataforma destina-se a instituições de ensino público, privado e público-privado (ensino pré-escolar, primário, I e II ciclos do ensino secundário geral, técnico-profissional e formação de professores), grupos educativos, corpo docente, secretarias escolares, encarregados de educação e alunos que operem no território da República de Angola.
        </p>

        <div className="p-4 border border-border/80 bg-muted/20 rounded-none space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            <Scale className="h-4 w-4 text-primary" />
            <span>Validade Probatória no Direito Angolano:</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nos termos do Código Civil Angolano e da Lei n.º 23/11, os registos informáticos, a cadeia criptográfica de auditoria (<em>hash-chained audit log</em>), os instantâneos de fecho de pauta e os comprovativos de autenticação gerados pelo sistema constituem meio idóneo de prova das operações académicas, administrativas e financeiras praticadas na instituição.
          </p>
        </div>
      </section>

      {/* 2. Entidade Operadora e Foro Territorial */}
      <section id="identificacao" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 2.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Identificação da Entidade Operadora e Foro Territorial
          </h2>
        </div>

        <p>
          2.1. A plataforma MindSchool é desenvolvida, gerida e mantida pela sociedade comercial de direito angolano <strong>MINDWARE — Comércio e Serviços, Lda.</strong>, com sede social em Luanda, Província de Luanda, República de Angola.
        </p>

        <p>
          2.2. Quaisquer comunicações oficiais, notificações judiciais ou pedidos de esclarecimento contratuais devem ser remetidos por escrito para a sede social da empresa ou endereçados ao correio electrónico institucional <a href="mailto:juridico@mindware.ao" className="text-primary font-semibold hover:underline">juridico@mindware.ao</a>.
        </p>
      </section>

      {/* 3. Contas de Utilizador, Papéis e Segurança Multi-Tenant */}
      <section id="contas-seguranca" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 3.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Contas de Utilizador, Governação de Permissões e Isolamento Multi-Tenant
          </h2>
        </div>

        <p>
          3.1. Cada instituição de ensino contratante opera num ambiente multi-tenant estritamente isolado através de políticas de segurança ao nível da linha na base de dados (<strong>PostgreSQL Row-Level Security — RLS</strong>) e chaves de integridade relacional por escola, garantindo que alunos, matrículas, avaliações, pautas, propinas e documentos são tecnicamente inacessíveis a outras instituições.
        </p>

        <p>
          3.2. A Direção Geral (<strong>Titular</strong>) da instituição é responsável pela administração dos utilizadores internos (Direção Pedagógica, Secretaria, Financeiro e Professores), bem como pela personalização das permissões atribuíveis às funções operacionais da sua escola, dentro dos limites anti-escalada de privilégios impostos pela plataforma.
        </p>

        <p>
          3.3. As palavras-passe são protegidas através do algoritmo de derivação criptográfica <strong>Argon2id</strong>, complementado por autenticação multifactor (MFA TOTP / WebAuthn Passkeys) e reautenticação de confirmação (<em>Step-Up Authentication</em>) para operações críticas. É obrigação indelegável de cada utilizador preservar a confidencialidade das suas credenciais.
        </p>
      </section>

      {/* 4. Regime Académico, Pautas e Conformidade MED */}
      <section id="regime-pedagogico" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 4.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Titularidade dos Dados Académicos, Pautas e Conformidade com o MED (Leis n.º 17/16 e 32/20)
          </h2>
        </div>

        <p>
          4.1. As regras de cálculo de aproveitamento (MAC, MAS, MT, MFD, Exames Finais e Deliberações de Conselho de Turma) implementadas no MindSchool respeitam as normas pedagógicas do <strong>Ministério da Educação da República de Angola (MED)</strong> e a <strong>Lei de Bases do Sistema de Educação e Ensino (Lei n.º 17/16, de 7 de Outubro, alterada pela Lei n.º 32/20, de 12 de Agosto)</strong>.
        </p>

        <p>
          4.2. <strong>Propriedade Exclusiva do Acervo Escolar:</strong> Todos os registos de alunos, fichas de encarregados, sumários de aulas, planos de ensino, pautas, minipautas e mapas estatísticos constituem propriedade institucional exclusiva da Escola contratante, sob tutela regulamentar do MED. A Mindware não reivindica qualquer direito de propriedade sobre os dados introduzidos pela instituição.
        </p>

        <p>
          4.3. <strong>Controlo de Acesso por Atributos Pedagógicos (ABAC):</strong> O lançamento e alteração de notas e presenças por parte de docentes encontra-se tecnicamente restrito às turmas e disciplinas que lhes foram formalmente atribuídas no ano lectivo activo, sendo vedada qualquer alteração após o fecho oficial da pauta pela Direção Pedagógica, salvo mediante processo auditado de reapreciação de nota ou reabertura fundamentada.
        </p>

        {/* Tabela de Responsabilidades Académicas e Fiscais */}
        <div className="border border-border/80 overflow-hidden rounded-none mt-3">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/80 text-foreground font-semibold">
              <tr>
                <th className="p-3">Domínio / Registo</th>
                <th className="p-3">Entidade Titular / Autoridade</th>
                <th className="p-3">Âmbito de Intervenção MindSchool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3 font-medium text-foreground">Pautas, Minipautas e Actas de Conselho</td>
                <td className="p-3">Instituição de Ensino &amp; MED</td>
                <td className="p-3">Cálculo determinístico, fecho com instantâneo imutável e arquivo</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Mapas Estatísticos Oficiais</td>
                <td className="p-3">Direção da Escola &amp; Auditoria MED</td>
                <td className="p-3">Consolidação de indicadores, homologação e exportação auditada</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Declarações, Boletins e Certificados</td>
                <td className="p-3">Secretaria / Direção da Escola</td>
                <td className="p-3">Emissão numerada com código de verificação pública anti-fraude</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Facturas-Recibo e Liquidações</td>
                <td className="p-3">Instituição de Ensino &amp; AGT</td>
                <td className="p-3">Liquidação financeira e certificação fiscal via conector MindGest</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Emissão de Documentos Oficiais e Verificação Pública */}
      <section id="documentos-verificacao" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 5.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Emissão de Documentos Académicos e Autenticidade Electrónica
          </h2>
        </div>

        <p>
          5.1. Os documentos emitidos através do MindSchool (declarações de matrícula, termos de frequência, boletins de notas, certificados e diplomas) recebem numeração sequencial única por escola e ano, acompanhada de resumo criptográfico (<em>SHA-256 snapshot hash</em>) e código de verificação pública.
        </p>

        <p>
          5.2. A consulta pública de verificação de autenticidade expõe unicamente a validade do documento, o tipo, o número oficial e as iniciais mascaradas do titular, protegendo integralmente os dados pessoais do estudante contra exposição indevida.
        </p>
      </section>

      {/* 6. Portais da Família/Aluno, Saúde Escolar e Serviços */}
      <section id="portais-comunicacao" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 6.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Portal do Encarregado e do Aluno, Saúde Escolar e Serviços Complementares
          </h2>
        </div>

        <p>
          6.1. O acesso de Encarregados de Educação através do Portal da Família restringe-se estritamente aos educandos aos quais estejam formalmente vinculados na ficha escolar, respeitando as permissões granulares de consulta pedagógica (<code>can_view_grades</code>) e financeira (<code>can_view_finance</code>) definidas pela secretaria da instituição.
        </p>

        <p>
          6.2. Os registos de clínica escolar, restrições médicas e acompanhamento psicopedagógico constituem dados pessoais sensíveis, cujo acesso na plataforma é estritamente reservado aos perfis autorizados da instituição, em conformidade com a Lei da Protecção de Dados Pessoais (Lei n.º 22/11).
        </p>
      </section>

      {/* 7. Facturação Fiscal Certificada AGT (MindGest) */}
      <section id="faturacao-agt" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 7.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Regime Financeiro, Subscrições e Facturação Fiscal Certificada pela AGT
          </h2>
        </div>

        <p>
          7.1. Todos os preços dos planos de subscrição do MindSchool e as cobranças de propinas escolares são expressos em <strong>Kwanzas (AOA)</strong>, observando o regime aplicável do Imposto sobre o Valor Acrescentado (IVA) nos termos da <strong>Lei n.º 7/19, de 24 de Abril (Código do IVA de Angola)</strong>.
        </p>

        <p>
          7.2. Quando a escola se encontra integrada com o sistema de facturação <strong>MindGest</strong>, a liquidação de propinas e emolumentos desencadeia a emissão de Facturas-Recibo (FR) certificadas pela Administração Geral Tributária (AGT) ao abrigo do <strong>Decreto Presidencial n.º 292/18 (Regime Jurídico das Facturas e Documentos Equivalentes)</strong>. Eventuais estornos ou notas de crédito sobre documentos fiscais já emitidos processam-se exclusivamente no sistema fiscal certificado MindGest, de acordo com as normas tributárias angolanas.
        </p>

        <p>
          7.3. <strong>Continuidade Pedagógica e Estado da Subscrição:</strong> Em caso de expiração do período de avaliação (<em>trial</em>) ou atraso na renovação da subscrição, a plataforma aplica políticas graduais que preservam a integridade e a consulta dos dados académicos e permitem a regularização da subscrição sem perda de registos históricos.
        </p>
      </section>

      {/* 8. Níveis de Serviço (SLA) e Manutenção */}
      <section id="sla-disponibilidade" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 8.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Níveis de Serviço (SLA), Disponibilidade e Salvaguarda de Dados
          </h2>
        </div>

        <p>
          8.1. A Mindware compromete-se a assegurar uma taxa média mensal de disponibilidade da plataforma de <strong>99,5%</strong> (noventa e nove vírgula cinco por cento), excluindo janelas programadas de manutenção preventiva.
        </p>

        <p>
          8.2. As intervenções técnicas planeadas que impliquem indisponibilidade temporária serão comunicadas com antecedência mínima de 48 (quarenta e oito) horas e realizadas preferencialmente fora do horário lectivo (entre as 22:00 e as 05:00, fuso horário de Luanda — <code>Africa/Luanda</code>).
        </p>

        <p>
          8.3. São realizadas cópias de segurança diárias automatizadas da base de dados e dos documentos emitidos, com verificação de integridade e retenção estruturada.
        </p>
      </section>

      {/* 9. Limitação de Responsabilidade e Força Maior */}
      <section id="responsabilidade" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 9.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Limitação de Responsabilidade e Força Maior
          </h2>
        </div>

        <p>
          9.1. Nenhuma das partes será responsável pelo incumprimento temporário das suas obrigações quando este resulte de motivo de <strong>Força Maior ou Caso Fortuito</strong>, nos termos do artigo 790.º do Código Civil Angolano, incluindo:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
          <li>Interrupções prolongadas na rede pública de energia eléctrica (ENDE) ou nas redes nacionais de telecomunicações;</li>
          <li>Cortes ou avarias em cabos submarinos internacionais de fibra óptica que servem a República de Angola (WACS, SACS, SAT-3, 2Africa);</li>
          <li>Catástrofes naturais, estados de emergência ou determinações imperativas das autoridades públicas angolanas.</li>
        </ul>

        <p>
          9.2. A responsabilidade contratual global da Mindware perante a instituição contratante, por danos directos comprovados judicialmente, fica limitada ao montante total pago pela instituição à Mindware nos últimos 12 (doze) meses de subscrição precedentes ao evento.
        </p>
      </section>

      {/* 10. Cessação, Conservação do Acervo Escolar e Jurisdição */}
      <section id="rescisao-foro" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CLÁUSULA 10.ª
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Cessação Contratual, Exportação do Acervo Escolar e Foro Competente
          </h2>
        </div>

        <p>
          10.1. A instituição pode solicitar a não renovação da subscrição a qualquer momento através do Titular da conta, mantendo-se o acesso pleno até ao termo do ciclo contratado em vigor.
        </p>

        <p>
          10.2. <strong>Garantia de Portabilidade e Arquivo Escolar:</strong> Em caso de cessação contratual, a Mindware assegura um período mínimo de carência de <strong>30 (trinta) dias consecutivos</strong> para que a instituição possa exportar integralmente o seu arquivo académico, pautas, fichas de alunos e relatórios financeiros em formatos abertos e auditáveis.
        </p>

        <p>
          10.3. <strong>Foro da Comarca de Luanda:</strong> Para dirimir qualquer litígio emergente da interpretação, validade ou execução do presente Contrato que não seja solucionado por via amigável no prazo de 30 dias, é exclusivamente competente o <strong>Tribunal da Comarca de Luanda</strong>, com expressa renúncia a qualquer outro.
        </p>

        <p>
          10.4. O presente contrato rege-se integralmente pelas leis em vigor na <strong>República de Angola</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}

