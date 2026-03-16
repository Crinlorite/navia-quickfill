jQuery(document).ready(function () {

  var UID = 'be1193d2-34de-4958-9998-fcc3c5e26f77';
  var ROOT_ID = 'divplantilla';
  var BTN_ID  = 'gestDoc_btnEnviar';
  var CANVAS_ID = 'signature';

  window.__haFirmado = false;

  function rootSel(sel){
    return '#' + ROOT_ID + ' ' + sel;
  }
  function qs(sel){
    return document.querySelector(sel);
  }
  function qsa(sel){
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  function getCanvas(){
    return document.getElementById(CANVAS_ID) || qs(rootSel('#' + CANVAS_ID));
  }

  function getBtn(){
    return document.getElementById(BTN_ID) || qs('#' + BTN_ID);
  }

  function fillWhite(canvas){
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    if(!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // =========================
  // AJAX - carga plantilla
  // =========================
  jQuery.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "https://consentimientos.com/webservice/api.asmx/getPlantilla",
    data: JSON.stringify({ uiddocumento: UID }),
    dataType: "json",
    success: function (data) {
      var html = '';
      if(data && typeof data.d !== 'undefined'){
        html = data.d;
      }
      jQuery('#' + ROOT_ID).html(html);
      initFirma();
      setupRevisionToggle();
      interceptarEnvio();
      hookEnviarCapture();
    },
    error: function (err) {
      console.log('[AJAX ERROR]', err);
    }
  });

  // =========================
  // FIRMA
  // =========================
  function isCanvasBlank(canvas){
    if(!canvas) return true;
    var ctx = canvas.getContext('2d');
    if(!ctx) return true;
    var w = canvas.width;
    var h = canvas.height;
    if(!w || !h) return true;
    var data;
    try {
      data = ctx.getImageData(0, 0, w, h).data;
    } catch(e){
      if(window.__haFirmado) return false;
      return true;
    }
    for(var i=0;i<data.length;i+=4){
      var r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if(a !== 0){
        if(r !== 255 || g !== 255 || b !== 255) return false;
      }
    }
    return true;
  }

  window.initFirma = function(){
    var canvas = getCanvas();
    if(!canvas) return;
    var ctx = canvas.getContext("2d");
    if(!ctx) return;
    var isDrawing = false;
    function resizeCanvas(){
      var old = null;
      if(!isCanvasBlank(canvas)){
        try { old = canvas.toDataURL(); } catch(e){ old = null; }
      }
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      fillWhite(canvas);
      if(old){
        var img = new Image();
        img.onload = function(){ ctx.drawImage(img, 0, 0, canvas.width, canvas.height); };
        img.src = old;
      }
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    function getX(e){
      var rect = canvas.getBoundingClientRect();
      if(e.touches && e.touches[0]) return e.touches[0].clientX - rect.left;
      return e.clientX - rect.left;
    }
    function getY(e){
      var rect = canvas.getBoundingClientRect();
      if(e.touches && e.touches[0]) return e.touches[0].clientY - rect.top;
      return e.clientY - rect.top;
    }
    function startDrawing(e){
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(getX(e), getY(e));
      e.preventDefault();
    }
    function draw(e){
      if(!isDrawing) return;
      ctx.lineTo(getX(e), getY(e));
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();
      window.__haFirmado = true;
      e.preventDefault();
    }
    function stopDrawing(){
      isDrawing = false;
      ctx.closePath();
    }
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
  };

  window.limpiarFirma = function(selector){
    var canvas = qs(selector) || getCanvas();
    if(!canvas) return;
    var ctx = canvas.getContext("2d");
    if(!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillWhite(canvas);
    window.__haFirmado = false;
  };

  // =========================
  // LOGICA DEPENDIENTE
  // =========================
  function setupRevisionToggle(){
    jQuery(document).on('change', rootSel('#consent_movil'), function(){
      toggleDependientes();
    });
    toggleDependientes();
  }

  function toggleDependientes(){
    var rev     = qs(rootSel('#consent_movil'));
    var gafas   = qs(rootSel('#lleva_gafas'));
    var minus   = qs(rootSel('#cert_minusvalia'));
    var horario = qs(rootSel('#pref_horario'));
    if(!rev) return;
    var esNo = (rev.value === 'Revision: No');
    var sinElegir = (rev.value === '');
    [gafas, minus].forEach(function(el){
      if(!el) return;
      if(esNo){
        el.disabled = true;
        el.value = 'No';
      } else if(sinElegir){
        el.disabled = true;
        el.value = '';
      } else {
        el.disabled = false;
      }
    });
    if(horario){
      if(esNo){
        var existe = false;
        for(var i=0;i<horario.options.length;i++){
          if(horario.options[i].value === 'No aplica'){ existe = true; break; }
        }
        if(!existe){
          var opt = document.createElement('option');
          opt.value = 'No aplica';
          opt.textContent = 'No aplica';
          horario.appendChild(opt);
        }
        horario.disabled = true;
        horario.value = 'No aplica';
      } else if(sinElegir){
        horario.disabled = true;
        horario.value = '';
      } else {
        horario.disabled = false;
        for(var j=horario.options.length-1;j>=0;j--){
          if(horario.options[j].value === 'No aplica'){
            horario.removeChild(horario.options[j]);
          }
        }
      }
    }
  }

  // =========================
  // VALIDACION
  // =========================
  function isEmpty(el){
    if(!el) return true;
    return String(el.value || '').replace(/^\s+|\s+$/g,'') === '';
  }

  function clearMarks(){
    var els = qsa(rootSel('input, select, canvas'));
    for(var i=0;i<els.length;i++){
      els[i].style.borderColor = '';
      els[i].style.boxShadow = '';
      els[i].style.outline = '';
    }
  }

  function mark(el){
    if(!el) return;
    el.style.borderColor = '#d93025';
    el.style.boxShadow = '0 0 0 3px rgba(217,48,37,0.15)';
    el.style.outline = '3px solid rgba(217,48,37,0.25)';
  }

  function validateEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').replace(/^\s+|\s+$/g,''));
  }

  function validarTodo(){
    clearMarks();
    var errores = [];
    var invalids = [];
    var nombre = qs(rootSel('#consent_razonsocial'));
    if(isEmpty(nombre)){ errores.push('Nombre y apellidos'); invalids.push(nombre); }
    var cifnif = qs(rootSel('#consent_cifnif'));
    if(isEmpty(cifnif)){ errores.push('DNI / NIE'); invalids.push(cifnif); }
    var email = qs(rootSel('#consent_email'));
    if(isEmpty(email)){
      errores.push('Correo electronico'); invalids.push(email);
    } else if(!validateEmail(email.value)){
      errores.push('Correo electronico (formato no valido)'); invalids.push(email);
    }
    var instalacion = qs(rootSel('#consent_otros'));
    if(isEmpty(instalacion)){ errores.push('Instalacion'); invalids.push(instalacion); }
    var puesto = qs(rootSel('#consent_email2'));
    if(isEmpty(puesto)){ errores.push('Puesto de trabajo'); invalids.push(puesto); }
    var revision = qs(rootSel('#consent_movil'));
    if(isEmpty(revision)){ errores.push('Quiere realizar revision medica'); invalids.push(revision); }
    if(revision && revision.value === 'Revision: Si'){
      var gafas = qs(rootSel('#lleva_gafas'));
      if(isEmpty(gafas)){ errores.push('Lleva gafas'); invalids.push(gafas); }
      var minus = qs(rootSel('#cert_minusvalia'));
      if(isEmpty(minus)){ errores.push('Certificado de minusvalia'); invalids.push(minus); }
      var horario = qs(rootSel('#pref_horario'));
      if(isEmpty(horario)){ errores.push('Preferencia de horario'); invalids.push(horario); }
    }
    var lugar = qs(rootSel('#lugar'));
    if(isEmpty(lugar)){ errores.push('Lugar'); invalids.push(lugar); }
    var fecha = qs(rootSel('#fecha_revision'));
    if(isEmpty(fecha)){ errores.push('Fecha'); invalids.push(fecha); }
    var canvas = getCanvas();
    if(isCanvasBlank(canvas)){
      errores.push('Firma');
      mark(canvas);
    }
    for(var i=0;i<invalids.length;i++) mark(invalids[i]);
    return { ok: errores.length === 0, errores: errores, canvas: canvas };
  }

  function saveFirmaBase64(canvas){
    if(!canvas) return;
    var hidden = qs(rootSel('input[name="firma_base64"]'));
    if(!hidden){
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'firma_base64';
      document.getElementById(ROOT_ID).appendChild(hidden);
    }
    try { hidden.value = canvas.toDataURL("image/png"); } catch(e) {}
  }

  // =========================
  // SINCRONIZAR SELECTS, INPUTS Y RE-HABILITAR
  // =========================
  function syncAllSelects(){
    var selects = qsa(rootSel('select'));
    for(var i=0;i<selects.length;i++){
      var sel = selects[i];
      for(var j=0;j<sel.options.length;j++){
        sel.options[j].removeAttribute('selected');
      }
      if(sel.selectedIndex >= 0){
        sel.options[sel.selectedIndex].setAttribute('selected', 'selected');
      }
    }
  }

  function syncAllInputs(){
    var inputs = qsa(rootSel('input'));
    for(var i=0;i<inputs.length;i++){
      var inp = inputs[i];
      if(inp.type === 'hidden' || inp.type === 'text' || inp.type === 'email' || inp.type === 'date'){
        inp.setAttribute('value', inp.value);
      }
    }
  }

  function enableAllFields(){
    var els = qsa(rootSel('select, input'));
    for(var i=0;i<els.length;i++){
      els[i].disabled = false;
    }
  }

  function prepararAnteDeEnviar(){
    toggleDependientes();
    syncAllSelects();
    syncAllInputs();
    enableAllFields();
    saveFirmaBase64(getCanvas());
  }

  // =========================
  // FIX MOVIL: Interceptar gestDoc_enviarDocumento directamente
  // Da igual si el envio viene de click, touchend, o lo que sea
  // Nuestro sync SIEMPRE se ejecuta antes del envio real
  // =========================
  function interceptarEnvio(){
    var intentos = 0;
    var t = setInterval(function(){
      intentos++;
      if(typeof window.gestDoc_enviarDocumento === 'function' && !window.__envioInterceptado){
        clearInterval(t);
        var original = window.gestDoc_enviarDocumento;
        window.__envioInterceptado = true;
        window.gestDoc_enviarDocumento = function(uid){
          prepararAnteDeEnviar();
          return original(uid);
        };
      }
      if(intentos > 300) clearInterval(t);
    }, 200);
  }

  // =========================
  // HOOK BOTON: validacion + click y touchend
  // =========================
  function engancharBoton(btn){
    if(!btn || btn.__hooked) return;
    btn.__hooked = true;

    function handler(ev){
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();

      toggleDependientes();

      var res = validarTodo();
      if(!res.ok){
        alert("Faltan campos obligatorios:\n\n- " + res.errores.join("\n- "));
        return false;
      }

      prepararAnteDeEnviar();

      if(typeof window.gestDoc_enviarDocumento === 'function'){
        return window.gestDoc_enviarDocumento(UID);
      }

      alert('ERROR: No se ha cargado el script de consentimientos.');
      return false;
    }

    btn.addEventListener('click', handler, true);
    btn.addEventListener('touchend', handler, true);
  }

  function hookEnviarCapture(){
    var tries = 0;
    var t = setInterval(function(){
      tries++;
      var btn = getBtn();
      if(btn){
        clearInterval(t);
        engancharBoton(btn);
        return;
      }
      if(tries > 300) clearInterval(t);
    }, 200);

    if(typeof MutationObserver !== 'undefined'){
      var root = document.getElementById(ROOT_ID);
      if(root){
        var obs = new MutationObserver(function(){
          var btn = getBtn();
          if(btn){
            obs.disconnect();
            engancharBoton(btn);
          }
        });
        obs.observe(root, { childList: true, subtree: true });
      }
    }
  }

});
