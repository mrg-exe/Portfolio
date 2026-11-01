// Animações do site: GSAP + ScrollTrigger (rolagem) e Lenis (rolagem suave).
// Regras: se as bibliotecas não carregarem ou se a pessoa pediu "reduzir movimento",
// o site aparece inteiro e parado. Efeitos de mouse só existem onde há mouse.
(function () {
  var raiz = document.documentElement;
  var liberarTopo = function () { raiz.classList.remove("anim-carregando"); };

  var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || semMovimento) { liberarTopo(); return; }
  gsap.registerPlugin(ScrollTrigger);

  // ---------- Rolagem suave ----------
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (tempo) { lenis.raf(tempo * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Links do menu deslizam até a seção, parando abaixo do topo fixo
    document.querySelectorAll('a[href^="#"]:not(.pular)').forEach(function (link) {
      link.addEventListener("click", function (evento) {
        var destino = document.querySelector(link.getAttribute("href"));
        if (!destino) return;
        evento.preventDefault();
        lenis.scrollTo(destino, { offset: -64 });
      });
    });
  }

  // ---------- Divide títulos em palavras (uma vez só) ----------
  function dividirPalavras(titulo) {
    titulo.setAttribute("aria-label", titulo.textContent.trim());
    titulo.innerHTML = titulo.textContent.trim().split(/\s+/).map(function (palavra) {
      return '<span class="palavra" aria-hidden="true"><span>' + palavra + "</span></span>";
    }).join(" ");
  }
  document.querySelectorAll("main h1, main h2").forEach(dividirPalavras);

  var mm = gsap.matchMedia();

  mm.add({
    desktop: "(min-width: 900px)",
    celular: "(max-width: 899px)",
    mouse: "(min-width: 900px) and (hover: hover) and (pointer: fine)"
  }, function (contexto) {
    var c = contexto.conditions;
    var limpar = [];

    // 1. História da automação (criada primeiro: ela "prende" a tela e empurra o que vem depois)
    if (c.desktop) limpar.push(historiaPresa());
    else historiaCelular();

    // 2. Topo: uma única sequência de entrada ao abrir o site
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".abertura h1 .palavra > span", { yPercent: 110, duration: 0.9, stagger: 0.06 })
      .from(".abertura__sub", { y: 20, autoAlpha: 0, duration: 0.7 }, "-=0.55")
      .from(".abertura__acoes > *", { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, "-=0.5")
      .from(".demo", { x: 50, rotationY: -12, autoAlpha: 0, duration: 1.1 }, 0.25);
    liberarTopo();

    // 3. Títulos das seções sobem palavra por palavra ao aparecer
    gsap.utils.toArray("main h2").forEach(function (titulo) {
      gsap.from(titulo.querySelectorAll(".palavra > span"), {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: titulo, start: "top 88%", once: true }
      });
    });

    // 4. "Como funciona": a linha de cada etapa se desenha em sequência
    gsap.from(".etapas li", {
      backgroundSize: "0% 2px",
      duration: 0.9,
      stagger: 0.18,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".etapas", start: "top 82%", once: true }
    });

    if (c.desktop) {
      // 5. Projetos: site e app se movem em velocidades diferentes (profundidade)
      var rolagemProjeto = { trigger: ".projeto", start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(".projeto__site", { y: 40 }, { y: -40, ease: "none", scrollTrigger: rolagemProjeto });
      gsap.fromTo(".projeto__app", { y: 140 }, { y: -90, ease: "none", scrollTrigger: rolagemProjeto });

      // 6. Contato: a faixa escura se abre até ocupar a largura toda
      var raioFinal = window.innerWidth >= 1244 ? "28px" : "0px";
      gsap.fromTo(".contato",
        { clipPath: "inset(8% 7% 8% 7% round 40px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round " + raioFinal + ")",
          ease: "none",
          scrollTrigger: { trigger: ".contato", start: "top 95%", end: "top 45%", scrub: true }
        });
    }

    if (c.mouse) {
      limpar.push(celularInclina());
      limpar.push(previewServicos());
      limpar.push(projetoInclina());
      limpar.push(botoesMagneticos());
    }

    return function () { limpar.forEach(function (fn) { if (fn) fn(); }); };
  });

  // Fontes carregadas mudam a altura dos textos: recalcula as posições
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  // ==========================================================
  // Funções de cada efeito
  // ==========================================================

  // Liga um evento e devolve a função que desliga (para limpar ao trocar de tela)
  function ouvir(el, nome, fn) {
    el.addEventListener(nome, fn);
    return function () { el.removeEventListener(nome, fn); };
  }

  function celularInclina() {
    var area = document.querySelector(".abertura");
    var celular = document.querySelector(".celular");
    if (!area || !celular) return;
    var rx = gsap.quickTo(celular, "rotationX", { duration: 0.7, ease: "power3" });
    var ry = gsap.quickTo(celular, "rotationY", { duration: 0.7, ease: "power3" });
    var tira1 = ouvir(area, "mousemove", function (e) {
      ry((e.clientX / window.innerWidth - 0.5) * 18);
      rx((e.clientY / window.innerHeight - 0.5) * -12);
    });
    var tira2 = ouvir(area, "mouseleave", function () { rx(0); ry(0); });
    return function () { tira1(); tira2(); gsap.set(celular, { clearProps: "transform" }); };
  }

  function previewServicos() {
    var preview = document.createElement("div");
    preview.className = "preview";
    preview.setAttribute("aria-hidden", "true");
    var miniSite =
      '<div class="mini-site"><div class="mini-site__barra"><i></i><i></i><i></i></div>' +
      '<div class="mini-site__corpo"><div class="mini-site__linha mini-site__linha--titulo"></div>' +
      '<div class="mini-site__linha"></div><div class="mini-site__linha mini-site__linha--curta"></div>' +
      '<span class="mini-site__zap">WhatsApp</span></div></div>';
    var miniFluxo =
      '<div class="mini-fluxo"><span>Contato</span><i></i><span class="forte">IA</span><i></i><span>Resposta</span></div>';
    preview.innerHTML =
      '<div class="preview__item" data-tipo="site">' + miniSite + "</div>" +
      '<div class="preview__item" data-tipo="automacao">' + miniFluxo + "</div>" +
      '<div class="preview__item" data-tipo="completo">' + miniSite + miniFluxo + "</div>";
    document.body.appendChild(preview);

    gsap.set(preview, { autoAlpha: 0, scale: 0.85, rotation: -4 });
    var px = gsap.quickTo(preview, "x", { duration: 0.45, ease: "power3" });
    var py = gsap.quickTo(preview, "y", { duration: 0.45, ease: "power3" });

    var tiras = [];
    document.querySelectorAll("[data-preview]").forEach(function (linha) {
      tiras.push(ouvir(linha, "mouseenter", function (e) {
        preview.querySelectorAll(".preview__item").forEach(function (item) {
          item.classList.toggle("ativo", item.dataset.tipo === linha.dataset.preview);
        });
        gsap.set(preview, { x: e.clientX + 24, y: e.clientY - 60 });
        gsap.to(preview, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(1.7)", overwrite: "auto" });
      }));
      tiras.push(ouvir(linha, "mousemove", function (e) {
        var largura = preview.offsetWidth;
        var x = e.clientX + 24 + largura > window.innerWidth ? e.clientX - largura - 24 : e.clientX + 24;
        px(x);
        py(e.clientY - 60);
      }));
      tiras.push(ouvir(linha, "mouseleave", function () {
        gsap.to(preview, { autoAlpha: 0, scale: 0.85, rotation: -4, duration: 0.2, overwrite: "auto" });
      }));
    });

    return function () { tiras.forEach(function (t) { t(); }); preview.remove(); };
  }

  function projetoInclina() {
    var imagens = document.querySelector(".projeto__imagens");
    if (!imagens) return;
    var rx = gsap.quickTo(imagens, "rotationX", { duration: 0.8, ease: "power3" });
    var ry = gsap.quickTo(imagens, "rotationY", { duration: 0.8, ease: "power3" });
    var tira1 = ouvir(imagens, "mousemove", function (e) {
      var caixa = imagens.getBoundingClientRect();
      ry(((e.clientX - caixa.left) / caixa.width - 0.5) * 10);
      rx(((e.clientY - caixa.top) / caixa.height - 0.5) * -8);
    });
    var tira2 = ouvir(imagens, "mouseleave", function () { rx(0); ry(0); });
    return function () { tira1(); tira2(); gsap.set(imagens, { clearProps: "transform" }); };
  }

  function botoesMagneticos() {
    var tiras = [];
    document.querySelectorAll(".botao").forEach(function (botao) {
      var bx = gsap.quickTo(botao, "x", { duration: 0.4, ease: "power3" });
      var by = gsap.quickTo(botao, "y", { duration: 0.4, ease: "power3" });
      tiras.push(ouvir(botao, "mousemove", function (e) {
        var caixa = botao.getBoundingClientRect();
        bx((e.clientX - caixa.left - caixa.width / 2) * 0.3);
        by((e.clientY - caixa.top - caixa.height / 2) * 0.4);
      }));
      tiras.push(ouvir(botao, "mouseleave", function () { bx(0); by(0); }));
    });
    return function () { tiras.forEach(function (t) { t(); }); gsap.set(".botao", { clearProps: "transform" }); };
  }

  // Desktop: a seção fica presa e a rolagem conduz a cena
  function historiaPresa() {
    var historia = document.querySelector(".historia");
    if (!historia) return;
    historia.classList.add("historia--animada");

    var q = gsap.utils.selector(historia);
    var passos = q(".historia__passos li");
    var linhas = q(".cena__linhas path");
    var digitar = q("[data-digitar]");

    // Guarda o texto completo e começa com os campos vazios
    var textos = digitar.map(function (el) { return el.textContent; });
    digitar.forEach(function (el) { el.textContent = ""; });

    linhas.forEach(function (linha) {
      var tamanho = linha.getTotalLength();
      gsap.set(linha, { strokeDasharray: tamanho, strokeDashoffset: tamanho });
    });

    gsap.set(q(".no--ia, .no--whats, .no--planilha, .no--dono"), { opacity: 0.25 });
    gsap.set(q(".etiqueta, .no__balao, .linha-nova, .notificacao, .historia__fim"), { autoAlpha: 0 });
    gsap.set(q(".historia__progresso span"), { scaleX: 0 });

    var tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: historia,
        start: "top top",
        end: "+=320%",
        pin: true,
        scrub: 0.6
      },
      // Marca a etapa pelo tempo da própria animação (que segue a rolagem com um leve atraso)
      onUpdate: function () { marcarEtapa(tl.time()); }
    });

    // 1. Marina preenche o formulário e envia
    tl.addLabel("e1");
    digitar.forEach(function (el, i) {
      var proxy = { n: 0 };
      tl.to(proxy, {
        n: textos[i].length,
        duration: i === 0 ? 0.5 : 1.4,
        ease: "none",
        onUpdate: function () { el.textContent = textos[i].slice(0, Math.round(proxy.n)); }
      });
    });
    tl.to(q(".no__botao"), { scale: 0.9, backgroundColor: "#FFB627", color: "#14213D", duration: 0.25 })
      .to(q(".no__botao"), { scale: 1, duration: 0.25 });

    // 2. A IA recebe e entende
    tl.addLabel("e2")
      .to(linhas[0], { strokeDashoffset: 0, duration: 0.5, ease: "none" })
      .to(q(".no--ia"), { opacity: 1, borderColor: "#FFB627", duration: 0.4 })
      .from(q(".etiqueta"), { scale: 0.6, duration: 0.6, stagger: 0.25, ease: "back.out(2)" }, "<0.1")
      .to(q(".etiqueta"), { autoAlpha: 1, duration: 0.3, stagger: 0.25 }, "<");

    // 3. Resposta no WhatsApp
    tl.addLabel("e3")
      .to(linhas[1], { strokeDashoffset: 0, duration: 0.7, ease: "none" })
      .to(q(".no--whats"), { opacity: 1, duration: 0.4 })
      .fromTo(q(".no__balao"), { y: 16 }, { y: 0, autoAlpha: 1, duration: 0.6 });

    // 4. Planilha e aviso para o dono
    tl.addLabel("e4")
      .to([linhas[2], linhas[3]], { strokeDashoffset: 0, duration: 0.7, ease: "none" })
      .to(q(".no--planilha, .no--dono"), { opacity: 1, duration: 0.4 })
      .fromTo(q(".linha-nova"), { x: -20 }, { x: 0, autoAlpha: 1, duration: 0.5 })
      .fromTo(q(".notificacao"), { y: -24 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.6)" }, "<")
      .to(q(".no--dono"), { x: 4, duration: 0.06, repeat: 5, yoyo: true, ease: "none" });

    // Fim
    tl.addLabel("fim")
      .to(q(".historia__fim"), { autoAlpha: 1, duration: 0.6 })
      .to({}, { duration: 0.8 }); // uma pausa antes de soltar a seção

    tl.to(q(".historia__progresso span"), { scaleX: 1, duration: tl.duration(), ease: "none" }, 0);

    var marcas = ["e1", "e2", "e3", "e4"].map(function (nome) { return tl.labels[nome]; });
    function marcarEtapa(tempo) {
      var atual = 0;
      marcas.forEach(function (inicio, i) { if (tempo >= inicio - 0.01) atual = i; });
      passos.forEach(function (li, i) { li.classList.toggle("ativo", i === atual); });
    }
    marcarEtapa(0);

    return function () {
      historia.classList.remove("historia--animada");
      digitar.forEach(function (el, i) { el.textContent = textos[i]; });
      passos.forEach(function (li) { li.classList.remove("ativo"); });
    };
  }

  // Celular: cada bloco aparece quando chega na tela, sem prender a rolagem
  function historiaCelular() {
    gsap.utils.toArray(".historia .no").forEach(function (no) {
      gsap.from(no, {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: no, start: "top 85%" }
      });
    });
  }
})();
