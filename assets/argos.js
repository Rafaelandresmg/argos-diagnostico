/* Lógica compartida del sitio comercial de Argos. Sin servidor: los datos de una propuesta viajan en el enlace. */
window.Argos = (function () {
  var PRECIOS = { plan: 200, instalacion: 600, consulta: 20, iva: 0.16 };
  var VIGENCIA_DIAS = 15;
  var WA_ARGOS = "584241250468";

  // Lo que incluye el plan. `def`: marcado por defecto.
  var ALCANCE = [
    { k: "listas", t: "Consulta de listas restrictivas internacionales (OFAC, ONU, Unión Europea y otras), con lector propio sobre la fuente oficial", def: true },
    { k: "pep", t: "Identificación de Personas Expuestas Políticamente desde la Gaceta Oficial", def: true },
    { k: "tsj", t: "Consulta de sentencias del Tribunal Supremo de Justicia, fuente exclusiva de Argos", def: true },
    { k: "prensa", t: "Revisión de prensa con menciones de interés para el cumplimiento", def: true },
    { k: "matriz", t: "Matriz de riesgo configurable por su empresa, con niveles BAJO, MODERADO y ALTO", def: true },
    { k: "cartera", t: "Revisión periódica de la cartera con la frecuencia que usted defina", def: true },
    { k: "registro", t: "Registro de cada consulta con fecha, fuentes, resultado y código hash SHA-256", def: true },
    { k: "constancia", t: "Constancia de debida diligencia en PDF por cada sujeto evaluado", def: true },
    { k: "volumen", t: "Hasta 2.000 consultas al año", def: true },
    { k: "capacitacion", t: "16 horas de configuración y capacitación", def: true },
    { k: "soporte", t: "Soporte directo con el equipo de Argos", def: true }
  ];

  function b64enc(obj) {
    var s = JSON.stringify(obj), bytes = new TextEncoder().encode(s), bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64dec(str) {
    try {
      var b = str.replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "=";
      var bin = atob(b), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return null; }
  }
  function store(key, val) {
    try { if (val === undefined) return JSON.parse(localStorage.getItem("argos." + key) || "null"); localStorage.setItem("argos." + key, JSON.stringify(val)); } catch (e) { return null; }
  }
  function vendedor() { return store("vendedor") || { nombre: "Rafael J. Miranda Guerra", ini: "RM", wa: WA_ARGOS }; }
  function hoy() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function numero(ini) {
    var d = hoy(), key = "seq." + d + "." + ini, n = (store(key) || 0) + 1; store(key, n);
    return "ARG-P-" + d.slice(0, 4) + "-" + d.slice(5, 7) + d.slice(8, 10) + "-" + ini + "-" + ("0" + n).slice(-2);
  }
  function sumarDias(iso, dias) { var d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + dias); return d.toISOString().slice(0, 10); }
  function fecha(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" }); }
  function usd(n) { return "US$" + n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function waFmt(w) { var d = String(w || "").replace(/\D/g, "").replace(/^58/, "0"); return d.length >= 11 ? d.slice(0, 4) + "-" + d.slice(4, 7) + "." + d.slice(7, 9) + "." + d.slice(9) : d; }
  function waLink(w, txt) { return "https://wa.me/" + String(w).replace(/\D/g, "") + "?text=" + encodeURIComponent(txt); }

  // Montos de una propuesta. prod: "plan" | "unica"; q: consultas (solo unica).
  function montos(p) {
    var lines = [];
    if (p.prod === "plan") {
      lines.push({ t: "Plan mensual Argos (por mes)", m: PRECIOS.plan, rec: true });
      lines.push({ t: "Instalación única: configuración y 16 horas de capacitación", m: PRECIOS.instalacion });
    } else {
      var q = Math.max(1, +p.q || 1);
      lines.push({ t: "Consulta única × " + q, m: PRECIOS.consulta * q });
    }
    var sub = lines.reduce(function (a, l) { return a + l.m; }, 0), iva = Math.round(sub * PRECIOS.iva * 100) / 100;
    return { lines: lines, sub: sub, iva: iva, total: sub + iva };
  }
  function copiar(txt, btn, ok) {
    var done = function () { var o = btn.textContent; btn.textContent = ok || "Copiado"; setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done).catch(function () { btn.textContent = "Selecciónelo y cópielo a mano"; });
  }
  return { PRECIOS: PRECIOS, VIGENCIA_DIAS: VIGENCIA_DIAS, ALCANCE: ALCANCE, WA_ARGOS: WA_ARGOS, b64enc: b64enc, b64dec: b64dec, store: store, vendedor: vendedor,
    hoy: hoy, numero: numero, sumarDias: sumarDias, fecha: fecha, usd: usd, esc: esc, waFmt: waFmt, waLink: waLink, montos: montos, copiar: copiar };
})();
