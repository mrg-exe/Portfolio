// Liga os dados de config.js à página e roda a demonstração do celular.
(function () {
  document.documentElement.classList.add("js");

  var config = window.CONFIG || {};

  // ---------- Contatos ----------
  if (config.whatsapp) {
    var linkWhatsapp = "https://wa.me/" + config.whatsapp.replace(/\D/g, "") +
      "?text=" + encodeURIComponent(config.mensagemWhatsapp || "");
    document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
      a.href = linkWhatsapp;
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  var links = { email: config.email && "mailto:" + config.email, linkedin: config.linkedin, github: config.github };
  Object.keys(links).forEach(function (nome) {
    var item = document.querySelector('[data-se="' + nome + '"]');
    if (!item) return;
    if (links[nome]) item.querySelector("a").href = links[nome];
    else item.remove();
  });
  var listaLinks = document.querySelector(".contato__links");
  if (listaLinks && !listaLinks.children.length) listaLinks.remove();

  if (config.foto) {
    var foto = document.querySelector("[data-foto]");
    foto.innerHTML = "";
    var img = document.createElement("img");
    img.src = config.foto;
    img.alt = "Foto do Filipe";
    foto.appendChild(img);
  }

  var ano = document.querySelector("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();

  // ---------- Demonstração: a conversa acontece uma vez ao abrir ----------
  var demo = document.querySelector(".demo");
  if (!demo) return;

  var status = demo.querySelector("[data-status]");
  var passos = function (n) { return demo.querySelector('[data-passo="' + n + '"]'); };
  var digitando = passos(2);
  var timers = [];

  // [quando (ms), o que fazer]
  var roteiro = [
    [700,  function () { mostrar(1); }],
    [1500, function () { mostrar(2); status.textContent = "digitando…"; }],
    [2900, function () { esconder(2); mostrar(3); status.textContent = "online"; }],
    [4200, function () { mostrar(4); }],
    [4900, function () { mostrarDigitando(5); }],
    [6200, function () { esconder(2); mostrar(5); status.textContent = "online"; }],
    [7000, function () { mostrar(6); demo.classList.add("terminou"); }]
  ];

  function mostrar(n) { passos(n).classList.add("aparece"); }
  function esconder(n) { passos(n).classList.remove("aparece"); }
  // Reaproveita o mesmo "digitando" logo antes da mensagem n
  function mostrarDigitando(n) {
    passos(n).before(digitando);
    mostrar(2);
    status.textContent = "digitando…";
  }

  function reiniciar() {
    timers.forEach(clearTimeout);
    timers = [];
    demo.classList.remove("terminou");
    demo.querySelectorAll(".aparece").forEach(function (el) { el.classList.remove("aparece"); });
    passos(3).before(digitando);
    status.textContent = "online";
  }

  function tocar() {
    reiniciar();
    var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento) {
      [1, 3, 4, 5, 6].forEach(mostrar);
      return;
    }
    roteiro.forEach(function (passo) { timers.push(setTimeout(passo[1], passo[0])); });
  }

  demo.querySelector("[data-repetir]").addEventListener("click", tocar);

  // Começa só quando o celular aparece na tela (no celular ele fica abaixo da dobra)
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      if (entradas[0].isIntersecting) {
        observador.disconnect();
        tocar();
      }
    }, { threshold: 0.4 });
    observador.observe(demo);
  } else {
    tocar();
  }
})();
