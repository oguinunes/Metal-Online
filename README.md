# Site Institucional — Odonto Metal (Sindicato dos Metalúrgicos de Guarulhos)

## Novidades desta versão
1. **Sábados até 12h por padrão:** Todo sábado já vem configurado no calendário com atendimento das `08h00 às 12h00`.
2. **Área Administrativa (Área ADM):**
   - Clique em **Área ADM** no menu superior e entre com a senha padrão: `odontometal2026` (pode ser alterada na linha 8 do `js/script.js`).
   - Com o modo ADM ativo, basta clicar em qualquer data no calendário para mudar a situação (**Atendimento Normal**, **Horário Especial / Reduzido** ou **Sem Atendimento — Feriado/Emenda**), além de publicar ou excluir novidades no mural.
3. **Agendamento WhatsApp com CPF para Sócios:**
   - **Sou Sócio:** Solicita **Nome Completo**, **Número da Carteirinha** e **CPF** (com máscara automática `000.000.000-00`).
   - **Sou Particular:** Solicita apenas o **Nome Completo**.

## Como configurar o número oficial do WhatsApp
Abra `js/script.js` e altere a linha 5 com o telefone real da clínica (`55` + `DDD` + `Número`):
```js
const CLINIC_WHATSAPP_NUMBER = "5511999999999";
```
