# NAVIA Quick – Panel de entrada rápida

Panel flotante inyectado por **bookmarklet** para rellenar automáticamente los diarios de NAVIA (piscinas) de forma rápida.

Autor: **Crintech.pro**  
Uso principal: agilizar la carga de mediciones diarias (mañana / tarde).

---

## ✨ Funcionalidades

- Relleno automático de:
  - Recogido por
  - Hora de recogida
  - 9 valores técnicos por diario
  - Lecturas comunes (agua depurada y renovada)
- Soporte para **2 diarios**:
  - Diario 1 → 08:00  
  - Diario 2 → 16:00
- Marcado automático de:
  - ✅ Turbidez OK  
  - ✅ Rebosadero OK
- Panel flotante no invasivo
- Validación de número de valores antes de rellenar

---

## 🧩 Qué rellena exactamente

Por cada diario (9 valores en orden):

1. Concentración desinfectante  
2. pH  
3. Turbidez  
4. Temperatura agua  
5. Temperatura aire  
6. Humedad  
7. CO₂ interno  
8. CO₂ externo  
9. Diferencia  

Lecturas comunes (2 valores):

- Lectura agua depurada  
- Lectura agua renovada  

Además marca automáticamente los checks:
- `transaparencia` (Turbidez OK)  
- `rebosadero` (Nivel agua OK)

---

## 🚀 Instalación (Bookmarklet)

1. Crea un marcador nuevo en tu navegador.
2. Nombre sugerido: `NAVIA Quick`
3. En URL pega todo el script envuelto así:

```js
javascript:(function(){ /* PEGA AQUÍ TODO EL SCRIPT */ })();
```

4. Guarda.
5. Entra en NAVIA y pulsa el marcador.

---

## 🖥️ Uso

1. Abre la página donde están los formularios.
2. Pulsa el bookmarklet **NAVIA Quick**.
3. Aparecerá un panel arriba a la derecha.
4. Pega:
   - 9 valores del Diario 1  
   - 9 valores del Diario 2  
   - 2 valores de lecturas comunes
5. Pulsa **Rellenar**.

Si falta algún valor, el panel avisará.

---

## 🧪 Ejemplo de entrada

Diario 1:
```
1.2 7.4 0.3 27.1 24.5 61 800 420 380
```

Diario 2:
```
1.1 7.3 0.2 27.4 25.0 58 780 410 370
```

Lecturas:
```
12345 67890
```

---

## ⚠️ Notas importantes

- El script **no envía datos a ningún servidor**.
- Solo actúa sobre el DOM de la página actual.
- Está pensado para el HTML concreto de NAVIA (IDs y names específicos).
- Si NAVIA cambia el formulario, puede requerir ajustes.

---

## 🛠️ Personalización rápida

Dentro del script puedes cambiar:

```js
const PICKED_BY = "SOS";
const HOUR_D1 = "08:00";
const HOUR_D2 = "16:00";
```

---

## 📄 Licencia

Uso personal / interno.  
Script creado para automatización local en entorno web.

---

## 👨‍💻 Autor

Crintech Studios  
https://crintech.pro
