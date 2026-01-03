/* =========================
   NAVIA QUICK – Panel de entrada rápida
   Autor: Crintech.pro
   Uso: cargado vía bookmarklet
   ========================= */

(function () {
  // Evitar cargar dos veces
  if (document.getElementById("naviaQuickPanel")) return;

  const PICKED_BY = "SOS";
  const HOUR_D1 = "08:00";
  const HOUR_D2 = "16:00";

  const parseNums = (txt) =>
    (txt || "")
      .trim()
      .split(/[\s,;]+/)
      .filter(Boolean);

  function fireEvents(el) {
    if (!el) return;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function setField($root, selector, value) {
    const $el = $root.querySelector(selector);
    if (!$el || value === "" || value == null) return;
    $el.value = value;
    fireEvents($el);
  }

  function setById(id, val) {
    const el = document.getElementById(id);
    if (!el || val === "" || val == null) return;
    el.value = val;
    fireEvents(el);
  }

  // ✅ NUEVO: marcar checkboxes/switches (checkbox + hidden espejo)
  function setSwitch($root, checkboxSelector, hiddenSelector, checked = true) {
    const cb = $root.querySelector(checkboxSelector);
    const hid = $root.querySelector(hiddenSelector);

    if (cb) {
      cb.checked = !!checked;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
      cb.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      console.warn("Checkbox no encontrado:", checkboxSelector);
    }

    if (hid) {
      hid.value = checked ? "true" : "false";
      fireEvents(hid);
    }
  }

  function fillDiario(diario, hora, v9, lecturaDepurada, lecturaRenovada) {
    const form = document.querySelector(`#form${diario - 1}`);
    if (!form) return;

    setField(form, 'input[name="Entidad.RecogidoPor"]', PICKED_BY);
    setField(form, 'input[name="Entidad.HoraRecogida"]', hora);

    const suf = `-${diario}`;
    const [
      controlDesinfectante,
      ph,
      turbidez,
      tempAgua,
      tempAire,
      humedad,
      co2Int,
      co2Ext,
      diferencia
    ] = v9;

    setById(`concentracionDesinfectante${suf}`, controlDesinfectante);
    setById(`ph${suf}`, ph);
    setById(`turbidez${suf}`, turbidez);
    setById(`temperaturaAgua${suf}`, tempAgua);
    setById(`temperaturaAire${suf}`, tempAire);
    setById(`humedad${suf}`, humedad);
    setById(`co2Interno${suf}`, co2Int);
    setById(`co2Externo${suf}`, co2Ext);
    setById(`diferencia${suf}`, diferencia);

    setField(form, 'input[name="Entidad.LecturaAguaDepurada"]', lecturaDepurada);
    setField(form, 'input[name="Entidad.LecturaAguaRenovada"]', lecturaRenovada);

    // ✅ NUEVO: marcar TURBIDEZ OK y REBOSADERO OK
    // Turbidez OK (en tu HTML es "transaparencia")
    setSwitch(
      form,
      `#transaparencia${suf}`,
      `input[data-checkbox="transaparencia${suf}"]`,
      true
    );

    // Nivel agua rebosadero OK
    setSwitch(
      form,
      `#rebosadero${suf}`,
      `input[data-checkbox="rebosadero${suf}"]`,
      true
    );
  }

  // ===== UI =====
  const panel = document.createElement("div");
  panel.id = "naviaQuickPanel";
  panel.style.cssText = `
    position:fixed; top:16px; right:16px; z-index:999999;
    width:360px; background:#111; color:#fff;
    border:1px solid #333; border-radius:12px;
    padding:12px; font-family:system-ui;
    box-shadow:0 10px 30px rgba(0,0,0,.35);
  `;

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>NAVIA Quick</strong>
      <button id="nqClose" style="background:#222;color:#fff;border:1px solid #444;border-radius:8px;padding:4px 8px;cursor:pointer">✕</button>
    </div>

    <div style="margin-top:8px;font-size:12px;opacity:.8">
      Pega 9 valores por diario (separados por espacios). Lecturas: 2 valores.
      <br/>Además marca automáticamente: <b>Turbidez OK</b> y <b>Rebosadero OK</b>.
    </div>

    <label style="display:block;margin-top:10px;font-size:12px">Diario 1 (9)</label>
    <textarea id="nqD1" rows="2" style="width:100%;border-radius:8px;border:1px solid #444;background:#0b0b0b;color:#fff;padding:8px"></textarea>

    <label style="display:block;margin-top:10px;font-size:12px">Diario 2 (9)</label>
    <textarea id="nqD2" rows="2" style="width:100%;border-radius:8px;border:1px solid #444;background:#0b0b0b;color:#fff;padding:8px"></textarea>

    <label style="display:block;margin-top:10px;font-size:12px">Lecturas comunes (depurada renovada)</label>
    <input id="nqLect" placeholder="ej: 12345 67890" style="width:100%;border-radius:8px;border:1px solid #444;background:#0b0b0b;color:#fff;padding:8px"/>

    <div style="display:flex;gap:8px;margin-top:12px">
      <button id="nqFill" style="flex:1;background:#2b6;color:#000;border:none;border-radius:10px;padding:10px;cursor:pointer;font-weight:700">Rellenar</button>
      <button id="nqClear" style="background:#222;color:#fff;border:1px solid #444;border-radius:10px;padding:10px;cursor:pointer">Limpiar</button>
    </div>

    <div id="nqMsg" style="margin-top:10px;font-size:12px"></div>
  `;

  document.body.appendChild(panel);

  const $ = (id) => panel.querySelector(id);
  const msg = (t) => ($("#nqMsg").textContent = t);

  $("#nqClose").onclick = () => panel.remove();

  $("#nqClear").onclick = () => {
    $("#nqD1").value = "";
    $("#nqD2").value = "";
    $("#nqLect").value = "";
    msg("Limpio.");
  };

  $("#nqFill").onclick = () => {
    const d1 = parseNums($("#nqD1").value);
    const d2 = parseNums($("#nqD2").value);
    const lect = parseNums($("#nqLect").value);

    if (d1.length !== 9) return msg(`❌ Diario 1: esperaba 9 valores, tengo ${d1.length}`);
    if (d2.length !== 9) return msg(`❌ Diario 2: esperaba 9 valores, tengo ${d2.length}`);
    if (lect.length !== 2) return msg(`❌ Lecturas: esperaba 2 valores, tengo ${lect.length}`);

    const [depurada, renovada] = lect;

    fillDiario(1, HOUR_D1, d1, depurada, renovada);
    fillDiario(2, HOUR_D2, d2, depurada, renovada);

    msg("✅ Diario 1 (08:00) y Diario 2 (16:00) rellenados + checks OK.");
  };

  msg("Panel listo.");
})();
