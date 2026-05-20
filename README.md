# ♿ Acessibilidade Digital — Dimensão A: Ferramentas de Teste e Diagnóstico
**Instituto J&F — Escola de Tecnologia**

---

## 👥 Integrantes

| Nome | GitHub | Área de Atuação |
|------|--------| --------------- |
| Gustavo Kenzo Shirahata Ota | [acessar](https://github.com/Gkso31) | Front-End e Design 🎨 |
| Matheus Rezende Nascimento Raimundo | [acessar](https://github.com/MatheussRezende) | Front-End e Dados 📊 |
| Pedro Yada Barbeitos | [acessar](https://github.com/yada071) | Back-End ⚙️ |
| Ryan Cursino Moraes | [acessar](https://github.com/ryancursinom) | Front-End e Dados 📊 |

---

## 🔍 Sobre esta pesquisa

Investigação da **Dimensão A — Ferramentas de Teste e Diagnóstico**, com foco na pergunta central:

> *Como os desenvolvedores descobrem e medem falhas de acessibilidade em sistemas digitais?*

---

## 💡 O que descobrimos (Principais Achados)

- 🔗 **Nenhuma ferramenta isolada é suficiente.** Ferramentas automatizadas como axe-core, Lighthouse e WAVE detectam falhas técnicas rapidamente, mas não conseguem avaliar completamente a experiência real do usuário — sendo necessária a combinação com testes manuais e leitores de tela. *(Deque Systems; NV Access)*

- 📊 **O PicPay obteve score 80 e o Banco Original, 86 no Lighthouse.** Ambos os sites do Grupo J&F apresentaram falhas detectáveis automaticamente, incluindo imagens sem atributo `alt`, botões sem nome acessível e problemas de contraste de cores. *(Testes realizados pelo grupo, abr. 2026)*

- 🧩 **O axe-core estrutura seus resultados em três categorias:** `violations` (erros), `passes` (corretos) e `incomplete` (necessita validação manual), retornando os dados em formato JSON e facilitando a integração em pipelines de desenvolvimento. *(Documentação oficial axe-core — npmjs.com)*

- 📐 **A acessibilidade deve ser incorporada desde o planejamento**, não como etapa final. Estudar as diretrizes WCAG e considerar diferentes perfis de usuário antes de escrever código reduz erros e retrabalho. *(W3C WAI — WCAG Guidelines)*

- 👁️ **Ferramentas como o WAVE adotam uma abordagem visual distinta:** ao sobrepor erros, alertas e estrutura diretamente na interface da página, facilitam a identificação de problemas sem exigir interpretação de JSON ou CLI. *(WebAIM — WAVE Tool)*

---

## 🛠️ Ferramentas de Teste e Diagnóstico

### ⚡ Ferramentas Automatizadas

> Realizam análises rápidas e identificam falhas comuns como falta de contraste, ausência de textos alternativos e erros de estrutura.

#### 🪓 axe-core

Motor de testes de acessibilidade flexível, desenvolvido para integrar com diferentes ambientes que analisam estruturas HTML. Analisa o DOM da página, aplica regras baseadas nos padrões WCAG e retorna resultados estruturados em JSON.

Retorna três categorias de resultado:

| Categoria | Descrição |
|-----------|-----------|
| `violations` | Erros detectados que violam padrões WCAG |
| `passes` | Verificações que passaram corretamente |
| `incomplete` | Itens que necessitam de validação manual |

Integra-se com Selenium WebDriver (via Axe-WebDriverJS) e plataformas como BrowserStack.

---

#### 🔦 Google Lighthouse

Ferramenta de auditoria do Google, disponível no Chrome DevTools, via CLI ou em pipelines de CI/CD. Avalia acessibilidade, desempenho e SEO, atribuindo uma **pontuação de 0 a 100** e gerando relatório com recomendações baseadas em boas práticas e padrões WCAG.

---

#### 🌊 WAVE (Web Accessibility Evaluation Tool)

Ferramenta visual que apresenta os resultados **diretamente na interface da página** por sobreposição. Exibe erros, alertas e estrutura (headings e landmarks), com foco em facilitar a interpretação visual dos problemas — diferente do axe-core, não exige leitura de JSON.

---

#### 🔬 Accessibility Insights

Extensão para Chrome e Edge que utiliza o axe-core internamente. Segue o fluxo **FastPass**, que combina:
- ~50 verificações automatizadas
- Testes manuais guiados (ex: navegação por teclado)

Alinhado às recomendações da WCAG.

---

#### 📱 BrowserStack

Plataforma de testes compatível com aplicações mobile (iOS e Android) e web, com suporte a **ambientes reais e emulados**. A análise de acessibilidade ocorre quando integrada ao axe-core ou outros frameworks de teste.

---

### 🎧 Ferramentas Manuais e Tecnologias Assistivas

> Simulam a experiência real de usuários com deficiência. Essenciais para testes mais completos — nenhuma automação substitui esse passo.

#### 🔊 NVDA (NonVisual Desktop Access)

Leitor de tela **gratuito e open-source** que converte conteúdo em áudio. Permite testar se o site é navegável e compreensível para pessoas com deficiência visual.

#### 🖥️ JAWS

Leitor de tela **pago**, amplamente utilizado no mercado corporativo. Oferece recursos avançados para navegação e leitura de interfaces complexas.

#### 🍎 VoiceOver

Leitor de tela **nativo dos dispositivos Apple**, usado para testar acessibilidade em sistemas iOS e macOS.

#### 🤖 Guidepup

Ferramenta **open-source** que automatiza a interação com leitores de tela como VoiceOver e NVDA. Valida se a saída corresponde ao comportamento esperado, simulando a experiência real do usuário de forma programática.

---

## 📋 Relatório de Acessibilidade — Sites do Grupo J&F

> Testes realizados com Google Lighthouse em abril de 2026. Prints disponíveis na pasta [`evidencias/`](./evidencias/).

### 🟡 PicPay — Score: `80 / 100`

| ⚠️ Erro Encontrado | ✅ Proposta de Correção |
|---|---|
| Botões sem nome acessível | Adicionar `aria-label` ou texto visível nos botões |
| Imagens sem atributo `alt` | Incluir `alt` descritivo em todas as `<img>` |
| Links sem nome compreensível | Usar texto de link descritivo; evitar "clique aqui" |
| Baixo contraste entre cores | Ajustar paleta para razão de contraste mínima de 4.5:1 (WCAG AA) |
| Headings fora de ordem sequencial | Seguir hierarquia correta: `h1 → h2 → h3` sem saltar níveis |

### 🟢 Banco Original — Score: `86 / 100`

| ⚠️ Erro Encontrado | ✅ Proposta de Correção |
|---|---|
| Imagens sem atributo `alt` | Incluir `alt` descritivo em todas as `<img>` |
| `role="dialog"` / `role="alertdialog"` sem nomes acessíveis | Adicionar `aria-label` ou `aria-labelledby` nos elementos de diálogo |
| Baixo contraste entre cores | Ajustar paleta para razão de contraste mínima de 4.5:1 (WCAG AA) |
| Headings fora de ordem hierárquica | Seguir hierarquia correta: `h1 → h2 → h3` sem saltar níveis |

---

## 🚀 Como isso afeta o nosso trabalho como desenvolvedores

A pesquisa mostra que **acessibilidade não é uma etapa final** — é parte de todo o ciclo de desenvolvimento. Abaixo, três práticas concretas que qualquer dev pode adotar a partir de agora:

### 1️⃣ Integrar o axe-core nos testes automatizados

Adicionar o axe-core ao pipeline de testes garante que falhas de acessibilidade sejam detectadas a cada build, antes de chegarem à produção.

```bash
npm install axe-core --save-dev
```

```javascript
const axe = require('axe-core');

// Exemplo de teste com Jest + jsdom
test('página não deve ter violações de acessibilidade', async () => {
  const results = await axe.run(document);
  expect(results.violations).toHaveLength(0);
});
```

---

### 2️⃣ Sempre incluir `alt` em imagens e `aria-label` em elementos interativos

Imagens sem `alt` e botões sem nome acessível foram os **erros mais frequentes** nos dois sites analisados. A correção é simples e deve ser feita durante o desenvolvimento, não depois.

```html
<!-- ❌ Errado -->
<img src="logo.png">
<button><svg>...</svg></button>

<!-- ✅ Correto -->
<img src="logo.png" alt="Logo do PicPay">
<button aria-label="Fechar menu"><svg>...</svg></button>
```

---

### 3️⃣ Rodar o Lighthouse regularmente via CLI

Integrar o Lighthouse ao fluxo de trabalho permite monitorar o score de acessibilidade a cada entrega, sem depender da interface do Chrome.

```bash
# Instalar globalmente
npm install -g lighthouse

# Rodar auditoria e salvar relatório
lighthouse https://www.picpay.com --output html --output-path ./evidencias/lighthouse-picpay.html
```

---

*Instituto J&F — Escola de Tecnologia · DAD 2026 · Projeto Acessibilidade Digital*
