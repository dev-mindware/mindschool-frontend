# Plano — Área da Família (encarregado e aluno)

Estado em 2026-10-09. Objectivo: transformar o «Portal + Dashboard» actual numa área completa, onde o encarregado e o aluno resolvem sozinhos o que hoje exige uma ida à secretaria.

## Progresso (2026-10-09)

| Fase | Estado |
|---|---|
| A — Rotas `/familia/*`, menu e selector de educando (`?aluno=`) | Feita (`/portal` redirecciona para o dashboard) |
| B — Financeiro: por pagar, pagamentos e recibos (PDF), facturas, extracto anual | Feita (API `payments`, `receipt.pdf`, `statement`) |
| C — Documentos com cobrança automática | Feita: taxas em Propinas e Taxas, factura `servico_extra`, estado `aguarda_pagamento`, libertação ao pagar, isenção com motivo |
| D — Aproveitamento e disciplinas | Feita: evolução por trimestre (aluno vs. turma, mínimo, quartil), boletim informativo em PDF e disciplinas com professor e carga horária (API `subjects`, `performance`, `report-card.pdf`) |
| E — Provas online realizáveis | Feita: iniciar/continuar, temporizador, gravação automática, envio com confirmação e resultado (`/familia/provas/[id]`) |
| F — Biblioteca | Feita: catálogo, pedir livro, cancelar, empréstimos e renovação; a escola aprova/recusa em «Pedidos do portal» (Biblioteca Escolar) |
| G — Perfil | Feita: dados pessoais, edição de contactos, alteração de palavra-passe por link e centro de segurança (2FA, passkeys, sessões) |
| H — Horário e calendário | Feita: hoje/amanhã/semana, agenda e exportação ICS |

Fica por fazer (sugestões do plano, fora das fases): lembrete por email 2 dias antes da devolução de um livro; preferências de notificação por canal no perfil (a API já existe); ficha de ano completo no extracto em PDF.

Notas: a factura da taxa só aparece em «Por pagar» depois de certificada pelo Motor Fiscal (MindGest, ligação futura); em desenvolvimento certifica-se por SQL. Falta a validação visual das telas (pedido do utilizador: fica para depois).

## 1. O que já existe (não refazer)

| Área | Estado |
|---|---|
| Dashboard da família | Cards financeiros, facturas por pagar, comprovativos, notas, assiduidade, comunicados, eventos |
| Pagamento de propinas | Dados bancários da escola, submissão de comprovativo, validação, emails (API e portal prontos) |
| Portal (abas) | Notas, reapreciação, propinas, provas online (só lista), horário (grelha semanal), assiduidade, documentos (PDF), comunicados + calendário mensal, requerimentos |
| API | `portal:*` (notas, avaliações, facturas, horário, assiduidade, documentos, comunicados, calendário, provas, preferências), `payables`, `payment-submissions`, requerimentos |

## 2. Lacunas face ao pedido

| # | Pedido | Lacuna |
|---|---|---|
| 1 | Situação financeira: liquidado e pendente | Falta ver **liquidados** (recibos em PDF, extracto por ano) e um estado único por factura |
| 2 | Horários | Existe como aba; falta página própria, filtro por dia e "hoje/amanhã" |
| 3 | Calendários | Só mensal; falta lista/agenda, filtro por tipo e exportar (ICS) |
| 4 | Aproveitamento | Só tabela; falta evolução por trimestre, média vs. mínimo, ranking anónimo da turma, boletim PDF |
| 5 | Disciplinas | **Não existe**: lista de disciplinas do educando com professor, carga horária, programa e materiais |
| 6 | Provas online | Só lista; **falta realizar a prova** (a API de submissão já existe) e ver resultado/correcção |
| 7 | Editar perfil | **Não existe** para encarregado/aluno (contactos, morada, foto, password, 2FA, preferências) |
| 8 | Solicitar manual da biblioteca | **Não existe** portal da biblioteca (API só tem gestão interna) |
| 9 | Solicitar documento à secretaria com cobrança automática | Requerimentos existem, mas **sem preço nem factura**; documento sai sem pagamento |

## 3. Novo menu (Encarregado e Aluno)

1. **Início** (dashboard actual)
2. **Financeiro**: Por pagar · Pagamentos e recibos · Comprovativos · Dados bancários da escola
3. **Aproveitamento**: Notas · Evolução · Boletins · Reapreciação
4. **Horário**
5. **Calendário**
6. **Disciplinas**
7. **Provas Online**
8. **Biblioteca**
9. **Documentos e Pedidos**: Pedir documento · Os meus pedidos · Documentos emitidos
10. **Comunicados**
11. **O meu perfil**

Aluno e encarregado partilham o menu; o encarregado com vários educandos tem selector global no cabeçalho (guardado na URL).

## 4. Fases

### Fase A — Fundação do menu e navegação (1–2 dias)
- Rotas próprias em `/familia/*` (ou `/portal/*`), com `PageWrapper` e permissões por papel.
- Selector de educando global (`?aluno=`), reutilizado em todas as páginas.
- Mover as abas actuais do portal para páginas, sem mudar a lógica.

### Fase B — Financeiro completo (2–3 dias) · pedido 1
- API: `GET portal/students/:id/payments` (pagamentos + recibo PDF por pagamento) e `GET portal/students/:id/statement?year=` (extracto: facturado, pago, saldo).
- UI: separadores **Pendentes** / **Liquidadas** (DataList com filtros por ano, tipo, método), botão «Descarregar recibo», estado único (por pagar, vencida, em análise, paga, parcialmente paga).
- Cartão «Resumo do ano» (facturado, pago, em dívida, multa de mora).

### Fase C — Pedir documentos com cobrança automática (3–4 dias) · pedido 9
- **Tabela de preços de documentos** em Configurações (declaração, boletim, certificado, 2.ª via de cartão…; valor por tipo; isento/pago).
- Modelo: `secretary_request` ganha `fee_amount`, `invoice_id`, estados `aguarda_pagamento → em_analise → concluido`.
- Ao abrir o pedido com preço > 0: cria **factura `servico_extra`** ligada à matrícula (certificação fiscal normal) e o pedido fica `aguarda_pagamento`.
- Pagamento (comprovativo validado ou caixa) liberta o pedido para a secretaria tratar; o documento só pode ser emitido com a factura paga (ou isenção registada com motivo).
- Emails: pedido aberto + instruções de pagamento, pagamento confirmado, documento pronto (já existem os modelos `secretary.*` e `document.issued`).
- UI: «Pedir documento» (tipo, finalidade, educando, preço visível antes de confirmar), «Os meus pedidos» com estado e botão «Pagar».

### Fase D — Aproveitamento e disciplinas (3 dias) · pedidos 4 e 5
- API: `GET portal/students/:id/subjects` (disciplina, professor, horas semanais, estado da pauta) e `GET .../performance` (médias por trimestre, mínimo, posição por quartil da turma, sem nomes).
- UI: gráfico de evolução por disciplina, alerta de disciplinas negativas, comparação com o mínimo, boletim PDF por trimestre, página de **Disciplinas** (cartões com professor e horário).

### Fase E — Provas online realizáveis (3–4 dias) · pedido 6
- UI para o aluno: lista (abertas, agendadas, concluídas) → ecrã de prova (temporizador, guardar respostas por questão, submissão com confirmação, retoma se a ligação cair).
- Resultado e correcção quando a escola confirmar; provas em Google Forms continuam com ligação externa.
- Anti-erro: guardar automaticamente cada resposta (a API já tem `PUT answers`), aviso de fecho de janela, uma tentativa por vez.

### Fase F — Biblioteca (3 dias) · pedido 8
- API: `GET portal/library/books` (catálogo com disponibilidade) e `POST portal/library/requests` (pedido de manual/empréstimo) → fica «pedido» até a biblioteca aprovar; empréstimo normal com prazo e renovações (regras actuais: 14 dias, 2 renovações, máx. 3 obras).
- Estados: pedido, aprovado, levantado, devolvido, em atraso; notificação e email quando aprovado e 2 dias antes do prazo.
- UI: pesquisa por título/disciplina/classe, «Pedir manual», «Os meus empréstimos» com renovar.
- Opcional: manuais **digitais** (PDF no armazenamento) por disciplina, visíveis só aos alunos dessa classe.

### Fase G — Perfil (2 dias) · pedido 7
- API: `GET/PATCH portal/me` (encarregado: telefone, email, morada, profissão; aluno: contactos e foto), com validação e auditoria; alteração de email exige confirmação.
- UI: dados pessoais, foto, password, 2FA (já existe no módulo de segurança), preferências de notificação por canal, sessões activas.
- Dados da escola sobre o educando (BI, turma) ficam **só de leitura**; pedidos de correcção seguem como requerimento.

### Fase H — Horário e calendário (1–2 dias) · pedidos 2 e 3
- Horário: «Hoje», «Amanhã», semana; destaque da próxima aula; exportar PDF.
- Calendário: mensal + agenda em lista, filtro (provas, feriados, reuniões, pagamentos), **exportar ICS**, vencimentos de propinas como eventos opcionais.

## 5. Sugestões adicionais (por valor)

**Alto valor**
1. **Pagamento parcial e plano de prestações**: o encarregado propõe pagar em 2–3 partes; a escola aprova e o sistema agenda os lembretes.
2. **Extracto e declaração de liquidação**: PDF do ano para efeitos de IRS/subsídios, gerado automaticamente.
3. **Alerta de dívida antes da prova/pauta**: aviso claro quando uma dívida vencida pode bloquear boletins ou matrícula (regra definida pela escola, nunca automática sem aviso).
4. **Notificações push/in-app com preferências por tipo** (propina a vencer, falta, nota publicada, prova marcada, comprovativo decidido).
5. **Justificação de faltas pelo portal**: upload de atestado, a escola aprova; o cartão «Faltas injustificadas» passa a accionável.
6. **Mensagens encarregado ↔ professor/director de turma**, com horário de atendimento e histórico (substitui chamadas e WhatsApp pessoais).

**Médio valor**
7. **Autorizações e inquéritos** (visitas de estudo, saída antecipada, consentimentos) com assinatura digital simples e prazo.
8. **Marcação de reuniões/atendimento** com a secretaria, financeiro ou direcção, com confirmação por email.
9. **Transporte escolar**: ver rota, paragem e horário; avisar atraso/alteração.
10. **Saúde**: ficha de saúde e vacinas editáveis pelo encarregado (leitura pela escola), alergias visíveis ao professor.
11. **Cartão do aluno digital (QR)** para acesso, biblioteca e lanche.
12. **Trabalhos de casa e materiais por disciplina** (a API de aulas e sumários já existe; falta publicar para a família).
13. **Resumo semanal por email** ao encarregado (notas novas, faltas, vencimentos, eventos).

**Qualidade e confiança**
14. **Multi-educando** com visão consolidada: total em dívida de todos os filhos e pagamento único.
15. **Acessibilidade e PWA**: instalável no telemóvel, modo escuro, tamanho de letra, funciona com ligação fraca (muito relevante em Angola).
16. **Linguagem simples** e português de Angola em todos os textos; ajuda contextual («Como pagar») e vídeo curto.
17. **Registo de actividade do utilizador** (quem viu/pagou/pediu) para suporte e auditoria.

## 6. Permissões e regras (transversais)

- O encarregado só vê educandos vinculados; `can_view_finance` / `can_view_grades` mantêm-se por vínculo. O aluno vê apenas os seus dados.
- Pedidos e pagamentos nunca expõem dados de outros alunos (404, não 403).
- Preço do documento fixado no momento do pedido (snapshot) para não mudar entre pedido e pagamento.
- Todas as acções com efeito (pedido, pagamento, alteração de perfil, pedido de livro) ficam auditadas e geram email/notificação.

## 7. Testes e verificação

- API: e2e por fase (pedido de documento gera factura; pagamento liberta; isenção exige motivo; biblioteca respeita limites; perfil audita alterações).
- Frontend: `tsc`, percurso manual com o utilizador `encarregado@demo.ao` e um aluno de demonstração (criar `aluno@demo.ao`), telemóvel (375 px) e tablet.
- Dados de demonstração: preços de documentos, manuais na biblioteca, prova online publicada e horário publicado.

## 8. Ordem recomendada e estimativa

Fase A → B → C (valor imediato e dinheiro para a escola) → D → E → F → G → H. Total estimado: **18–22 dias úteis** de uma pessoa; A–C são entregáveis em ~1 semana e já cobrem «situação financeira» e «pedir documento com pagamento automático».

## 9. Decisões que preciso de si

1. O documento só é emitido **depois de pago**, ou a secretaria pode emitir e a factura fica pendente?
2. Quais documentos são gratuitos e quais pagos (e valores)?
3. «Manual da biblioteca»: empréstimo físico apenas, ou também manual digital?
4. O aluno pode **pagar** sozinho (já activado) e **pedir documentos** em nome próprio, ou só o encarregado?
5. Usar rotas `/familia/*` novas ou manter `/portal/*`?
