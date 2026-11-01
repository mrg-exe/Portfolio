# Portfólio do Filipe

Site pessoal para oferecer **sites e automações com IA para pequenos negócios**.

O destaque da página é uma demonstração: um celular mostra um cliente pedindo horário e a resposta automática chegando na hora. É exatamente o serviço que o site vende.

## Tecnologias
HTML, CSS e JavaScript puro, sem nada para instalar ou compilar. Fonte Bricolage Grotesque (Google Fonts).

## Estrutura
| Arquivo | O que é |
|---|---|
| `index.html` | Conteúdo da página: textos, seções e projetos |
| `css/estilo.css` | Visual. As cores ficam no topo, em `:root` |
| `js/config.js` | **Seus dados de contato:** WhatsApp, e-mail, LinkedIn, GitHub e foto |
| `js/main.js` | Liga os contatos à página e roda a demonstração do celular |
| `img/` | Ícone, foto e prints dos projetos |

## Como ver no computador
Abra `index.html` direto no navegador, ou rode um servidor local:

```powershell
python -m http.server 8090
```

Depois acesse http://localhost:8090.

## Antes de publicar
1. Preencha `js/config.js` (o WhatsApp é o mais importante).
2. Coloque sua foto em `img/` e o caminho dela em `foto`.
3. Revise os textos de `index.html` com a sua voz.

## Publicar (grátis)
Envie esta pasta para um repositório no GitHub e conecte esse repositório na **Vercel** ou na **Netlify**. Cada `git push` atualiza o site sozinho.

## Acessibilidade
- Navegável pelo teclado, com foco visível e link "Pular para o conteúdo"
- Respeita "reduzir movimento" do sistema: a conversa aparece pronta, sem animação
- Sem JavaScript, todo o conteúdo continua visível
