"use client";

import React, { useState, useMemo } from "react";
import { LegalLayout, LegalSectionItem } from "@/components/legal/legal-layout";
import { Shield } from "lucide-react";

const SECTIONS: LegalSectionItem[] = [
  { id: "responsavel-apd", title: "Responsável pelo Tratamento e Tutela da APD", number: "1" },
  { id: "principios-legais", title: "Princípios Fundamentais do Tratamento (Lei 22/11)", number: "2" },
  { id: "categorias-dados", title: "Categorias de Dados Pessoais e Académicos Tratados", number: "3" },
  { id: "menores-saude", title: "Protecção de Dados de Alunos Menores e Saúde Escolar", number: "4" },
  { id: "finalidades-licitude", title: "Finalidades e Fundamentos Jurídicos de Licitude", number: "5" },
  { id: "direitos-titulares", title: "Direitos dos Titulares e Prazo Legal de 60 Dias", number: "6" },
  { id: "seguranca-ciberseguranca", title: "Segurança da Informação e Lei de Cibersegurança (Lei 9/26)", number: "7" },
  { id: "transferencia-internacional", title: "Transferência Internacional de Dados (Art. 33.º LPDP)", number: "8" },
  { id: "prazos-retencao", title: "Prazos de Conservação Académica (MED) e Fiscal (AGT)", number: "9" },
  { id: "cookies-canal-dpo", title: "Cookies Técnicos e Exercício de Direitos perante o DPO", number: "10" },
];

export default function PrivacyPage() {
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
      documentType="PRIVACY"
      title="Política de Privacidade e Protecção de Dados Pessoais"
      subtitle="Regulamento institucional para protecção de dados de estudantes, encarregados de educação, docentes e colaboradores escolares, isolamento multi-tenant e cumprimento integral da Lei n.º 22/11 perante a Agência de Protecção de Dados (APD) da República de Angola."
      version="2.4 / AO"
      effectiveDate="10 de Novembro de 2026"
      sections={filteredSections}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {/* 1. Responsável pelo Tratamento e APD */}
      <section id="responsavel-apd" className="space-y-4 pt-2 border-t border-border/40 first:border-t-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 1.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Responsável pelo Tratamento, Subcontratação e Tutela da APD
          </h2>
        </div>

        <p>
          1.1. A presente Política de Privacidade regula o tratamento de dados pessoais realizado no âmbito da plataforma de gestão escolar <strong>MindSchool</strong>, operada pela <strong>MINDWARE — Comércio e Serviços, Lda.</strong>, sociedade comercial de direito angolano com sede em Luanda, República de Angola.
        </p>

        <p>
          1.2. Todas as operações de tratamento de dados pessoais respeitam rigorosamente a <strong>Lei n.º 22/11, de 17 de Junho (Lei da Protecção de Dados Pessoais — LPDP da República de Angola)</strong>, sob supervisão da <strong>Agência de Protecção de Dados (APD)</strong>, criada pelo Decreto Presidencial n.º 214/16 e regulamentada pelo Decreto Presidencial n.º 202/21.
        </p>

        <p>
          1.3. A Mindware designou um Encarregado de Protecção de Dados (DPO) em Luanda, contactável directamente através do endereço <a href="mailto:dpo@mindware.ao" className="text-primary font-semibold hover:underline">dpo@mindware.ao</a>.
        </p>

        <div className="p-4 border border-border/80 bg-muted/20 rounded-none space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            <Shield className="h-4 w-4 text-primary" />
            <span>Autoridade Reguladora Nacional — APD Angola:</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Qualquer titular de dados ou representante legal de estudante menor que considere existir violação das disposições da Lei n.º 22/11 tem o direito de apresentar reclamação junto da <strong>Agência de Protecção de Dados (APD)</strong>, em Luanda ou através do portal oficial <a href="https://apd.ao" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">www.apd.ao</a>.
          </p>
        </div>
      </section>

      {/* 2. Princípios Fundamentais da Lei 22/11 */}
      <section id="principios-legais" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 2.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Princípios Fundamentais do Tratamento de Dados (Artigos 9.º a 13.º da LPDP)
          </h2>
        </div>

        <p>
          Em estrito cumprimento dos artigos 9.º a 13.º da Lei n.º 22/11, a arquitectura do MindSchool obedece aos seguintes princípios:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">a) Princípio da Transparência e Licitude (Art. 9.º)</span>
            <p className="text-muted-foreground">O tratamento ocorre apenas para finalidades académicas, pedagógicas, administrativas e fiscais legalmente previstas.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">b) Princípio da Finalidade Determinada (Art. 10.º)</span>
            <p className="text-muted-foreground">Os dados de alunos, encarregados e professores nunca são utilizados para fins comerciais alheios à actividade educativa da escola.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">c) Princípio da Proporcionalidade (Art. 11.º)</span>
            <p className="text-muted-foreground">Recolhem-se unicamente os atributos exigidos para a matrícula, avaliação escolar, emissão de documentos e facturação.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">d) Princípio da Exactidão e Integridade (Art. 12.º)</span>
            <p className="text-muted-foreground">Todas as rectificações de fichas e reapreciações de notas ficam registadas com histórico versionado e auditável.</p>
          </div>
        </div>
      </section>

      {/* 3. Categorias de Dados Tratados */}
      <section id="categorias-dados" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 3.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Categorias de Dados Pessoais e Académicos Tratados
          </h2>
        </div>

        <p>
          3.1. Consoante o perfil e o módulo utilizado pela instituição, o MindSchool processa as seguintes categorias de dados:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
          <li><strong>Dados de Identificação e Matrícula do Estudante:</strong> Nome completo, data de nascimento, género, número de processo escolar, tipo e número de documento de identificação (Cédula Pessoal, Bilhete de Identidade, Certidão de Nascimento ou Passaporte) cifrados em repouso.</li>
          <li><strong>Dados de Encarregados de Educação:</strong> Nome completo, grau de parentesco, contactos telefónicos, endereço de correio electrónico, profissão e Número de Identificação Fiscal (NIF) opcional para efeitos de emissão de factura-recibo.</li>
          <li><strong>Dados Académicos e de Assiduidade:</strong> Turmas, matrículas, avaliações contínuas, sistemáticas e periódicas, médias trimestrais e finais, presenças/faltas justificadas e deliberações de conselho de turma.</li>
          <li><strong>Dados de Docentes e Colaboradores:</strong> Nome completo, habilitações académicas, número de documento, vínculo contratual, registo de ponto por credencial QR e atribuição de turmas/disciplinas.</li>
          <li><strong>Dados de Segurança e Auditoria:</strong> Endereço IP, identificador de sessão, <em>User-Agent</em>, factores MFA/WebAuthn e trilha imutável de operações realizadas.</li>
        </ul>
      </section>

      {/* 4. Protecção de Dados de Alunos Menores e Saúde Escolar */}
      <section id="menores-saude" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 4.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Protecção Especial de Dados de Menores e Registos de Saúde Escolar
          </h2>
        </div>

        <p>
          4.1. <strong>Distinção de Responsabilidades (Escola vs. Mindware):</strong>
        </p>

        <div className="p-4 border border-border/80 bg-card rounded-none space-y-2 text-xs">
          <p>
            • A <strong>Instituição de Ensino Contratante</strong> actua na qualidade de <strong>Responsável pelo Tratamento</strong> perante os alunos, pais, encarregados de educação e funcionários, competindo-lhe assegurar a legitimidade da recolha no acto de candidatura e matrícula escolar.
          </p>
          <p>
            • A <strong>MINDWARE — Comércio e Serviços, Lda.</strong> actua na qualidade estrita de <strong>Subcontratante (Operadora Tecnológica)</strong>, tratando os dados unicamente segundo as instruções da escola e garantindo o isolamento técnico e criptográfico da infra-estrutura.
          </p>
        </div>

        <p>
          4.2. <strong>Dados Sensíveis de Saúde e Psicopedagogia:</strong> As informações médicas relevantes para o cuidado do estudante na escola (alergias, grupo sanguíneo, condições crónicas, atendimentos na enfermaria escolar e processos psicopedagógicos) são protegidas por permissões específicas de alto rigor (<code>student:read_health</code>, <code>health:read</code>, <code>psycho:read</code>) e nunca são expostas a docentes sem autorização nem a terceiros.
        </p>
      </section>

      {/* 5. Finalidades e Fundamentos Jurídicos de Licitude */}
      <section id="finalidades-licitude" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 5.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Finalidades do Tratamento e Fundamentos Jurídicos de Licitude
          </h2>
        </div>

        <p>
          O tratamento de dados pessoais no MindSchool assenta nos fundamentos previstos na Lei n.º 22/11:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-40">Obrigação Legal &amp; MED:</span>
            <span className="text-muted-foreground">Cumprimento das normas do Ministério da Educação (Lei n.º 17/16 e Lei n.º 32/20) para registo de matrículas, pautas de aproveitamento e emissão de certificados escolares.</span>
          </div>
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-40">Execução Contratual:</span>
            <span className="text-muted-foreground">Gestão da relação contratual de ensino entre a escola e o encarregado de educação, disponibilização do Portal da Família e prestação de serviços escolares (transporte, biblioteca e actividades).</span>
          </div>
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-40">Obrigação Fiscal &amp; AGT:</span>
            <span className="text-muted-foreground">Emissão e conservação de documentos fiscais certificados pela AGT (Decreto Presidencial n.º 292/18) através da integração com o MindGest Fiscal.</span>
          </div>
          <div className="p-3 border border-border/80 bg-muted/20 rounded-none flex items-start gap-3">
            <span className="font-semibold text-foreground shrink-0 w-40">Segurança &amp; Auditoria:</span>
            <span className="text-muted-foreground">Prevenção de fraude académica, detecção de acessos não autorizados e rastreabilidade integral de alterações a notas e documentos.</span>
          </div>
        </div>
      </section>

      {/* 6. Direitos dos Titulares e Prazo Legal de 60 Dias */}
      <section id="direitos-titulares" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 6.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Direitos dos Titulares e dos Encarregados de Educação (Artigos 24.º a 29.º da LPDP)
          </h2>
        </div>

        <p>
          Nos termos da Lei n.º 22/11, são garantidos aos titulares dos dados (ou aos encarregados de educação, no caso de estudantes menores) os seguintes direitos:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
          <li><strong>Direito de Informação e Acesso (Arts. 24.º e 25.º):</strong> Consultar de forma transparente os dados pessoais, notas, presenças e documentos emitidos respeitantes ao estudante.</li>
          <li><strong>Direito de Rectificação e Actualização (Art. 26.º):</strong> Solicitar junto da secretaria da escola a correcção de dados de identificação, contactos ou filiação inexactos.</li>
          <li><strong>Direito de Eliminação ou Anonimização (Art. 27.º):</strong> Solicitar a eliminação ou anonimização de dados pessoais que deixem de ser necessários, sem prejuízo dos prazos legais obrigatórios de conservação do registo académico (MED) e fiscal (AGT).</li>
          <li><strong>Direito de Oposição (Art. 28.º):</strong> Gerir preferências de notificações e opor-se a tratamentos não essenciais.</li>
        </ul>

        <div className="p-4 border border-primary/30 bg-primary/5 rounded-none space-y-2 text-xs">
          <span className="font-semibold text-foreground block">
            Prazo Legal de Resposta — Artigo 26.º da LPDP Angolana:
          </span>
          <p className="text-muted-foreground leading-relaxed">
            Os pedidos formais relativos ao exercício dos direitos de rectificação, actualização ou eliminação são apreciados e respondidos no prazo máximo legal de <strong>sessenta (60) dias úteis</strong> a contar da recepção do requerimento devidamente identificado.
          </p>
        </div>
      </section>

      {/* 7. Segurança da Informação e Lei de Cibersegurança (Lei 9/26) */}
      <section id="seguranca-ciberseguranca" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 7.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Segurança da Informação e Conformidade com a Lei da Cibersegurança (Lei n.º 9/26)
          </h2>
        </div>

        <p>
          7.1. O MindSchool aplica controlos de segurança de defesa em profundidade alinhados com a <strong>Lei n.º 9/26 (Lei da Cibersegurança da República de Angola)</strong>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">Cifra de Campo &amp; TLS 1.3</span>
            <p>Documentos de identificação e NIF são cifrados ao nível aplicacional e transmitidos exclusivamente via HTTPS/TLS 1.3.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">Argon2id &amp; Step-Up Auth</span>
            <p>Senhas protegidas com Argon2id, verificação contra listas de credenciais comprometidas e confirmação reforçada em acções sensíveis.</p>
          </div>
          <div className="p-3 border border-border/80 bg-card rounded-none space-y-1">
            <span className="font-semibold text-foreground block">RLS &amp; Cadeia de Hashes</span>
            <p>Isolamento forçado no PostgreSQL por escola (RLS) e <em>audit log</em> encadeado por SHA-256 à prova de adulteração.</p>
          </div>
        </div>
      </section>

      {/* 8. Transferência Internacional de Dados */}
      <section id="transferencia-internacional" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 8.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Transferência Internacional de Dados Pessoais (Artigo 33.º da LPDP)
          </h2>
        </div>

        <p>
          8.1. Em cumprimento do artigo 33.º da Lei n.º 22/11, qualquer processamento ou alojamento em infra-estrutura de nuvem localizada fora do território da República de Angola observa estritamente os requisitos de adequação e as salvaguardas contratuais e criptográficas exigidas pela Agência de Protecção de Dados (APD).
        </p>

        <p>
          8.2. Os centros de dados utilizados cumprem as normas internacionais ISO/IEC 27001 e SOC 2 Type II, com cifra integral de volumes e chaves sob controlo estrito da operadora.
        </p>
      </section>

      {/* 9. Prazos de Conservação e Retenção */}
      <section id="prazos-retencao" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 9.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Prazos de Conservação Académica e Fiscal
          </h2>
        </div>

        <p>
          O MindSchool inclui políticas automatizadas de retenção e anonimização que respeitam os prazos legais imperativos da legislação angolana:
        </p>

        {/* Tabela de Retenção */}
        <div className="border border-border/80 overflow-hidden rounded-none mt-2">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/80 text-foreground font-semibold">
              <tr>
                <th className="p-3">Categoria de Dados</th>
                <th className="p-3">Prazo de Retenção Legal</th>
                <th className="p-3">Fundamento Jurídico Angolano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3 font-medium text-foreground">Pautas Finais, Certificados e Histórico Escolar</td>
                <td className="p-3">Conservação permanente / arquivo histórico escolar</td>
                <td className="p-3">Lei de Bases do Sistema de Educação e Ensino (MED)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Documentos Fiscais, Cobranças e Liquidações</td>
                <td className="p-3">5 (cinco) anos fiscais</td>
                <td className="p-3">Código Geral Tributário de Angola &amp; Regras AGT</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Candidaturas Não Matriculadas</td>
                <td className="p-3">Anonimização após fecho do ciclo de admissão</td>
                <td className="p-3">Princípio da Proporcionalidade (Art. 11.º da Lei n.º 22/11)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Logs de Auditoria e Segurança</td>
                <td className="p-3">12 (doze) meses mínimo em arquivo verificável</td>
                <td className="p-3">Lei n.º 9/26 (Cibersegurança)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 10. Cookies Técnicos e Canal DPO */}
      <section id="cookies-canal-dpo" className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-none border border-primary/20">
            CAPÍTULO 10.º
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Cookies Estritamente Necessários, Contacto do DPO e Revisões
          </h2>
        </div>

        <p>
          10.1. O MindSchool utiliza exclusivamente <strong>cookies técnicos e de sessão HTTP-Only</strong> (como <code>access_token</code>, <code>refresh_token</code> e <code>user_role</code> assinado por HMAC) indispensáveis para a autenticação segura e protecção contra falsificação de pedidos (CSRF). A plataforma não utiliza cookies publicitários nem comercializa dados de estudantes ou encarregados com terceiros.
        </p>

        <p>
          10.2. Para o exercício de direitos ao abrigo da Lei n.º 22/11 ou esclarecimentos sobre privacidade, o titular pode contactar a secretaria da sua instituição de ensino ou o Encarregado de Protecção de Dados da Mindware através de <a href="mailto:dpo@mindware.ao" className="text-primary font-semibold hover:underline">dpo@mindware.ao</a>.
        </p>

        <p>
          10.3. Esta Política de Privacidade pode ser actualizada para reflectir novas directrizes da APD ou do MED, sendo a versão e data de vigência sempre identificadas no cabeçalho oficial desta página.
        </p>
      </section>
    </LegalLayout>
  );
}

