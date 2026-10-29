/* ==========================================================
   Quesería Portal Vida Sana — funciones de la web
   ----------------------------------------------------------
   TODO LO QUE SE CAMBIA SEGUIDO ESTÁ ACÁ ABAJO, EN CONFIG.
   ========================================================== */

const CONFIG = {
  // WhatsApp: 598 + el número sin el 0 inicial, sin espacios.
  // DEMO: es el número de Metheris Studios. Al vender la web, poner el del comercio.
  whatsapp: '59898100017',

  // Teléfono para llamar (el que figura en el cartel y en Google).
  telefono: '094096144',
  telefonoTexto: '094 096 144',

  // Clave de Web3Forms. DEMO: llega al mail de Metheris Studios.
  // Al vender la web, crear una clave nueva con el mail del comercio y pegarla acá.
  web3formsKey: '31bd8c3d-df41-4206-a1cd-f258cb680201',
  asuntoMail: 'Nueva consulta desde la web - Quesería Portal Vida Sana',

  // Horario (hora de Uruguay). null = cerrado. 0 = domingo, 1 = lunes... 6 = sábado.
  horario: {
    1: ['08:30', '18:30'],
    2: ['08:30', '18:30'],
    3: ['08:30', '18:30'],
    4: ['08:30', '18:30'],
    5: ['08:30', '18:30'],
    6: ['08:30', '18:30'],
    0: null
  },

  // Productos del armador de consultas. Solo productos que el comercio muestra
  // en sus carteles, fotos o Instagram. "porPeso" agrega los botones ¼, ½ y 1 kg.
  grupos: [
    {
      titulo: 'Quesos', porPeso: true,
      items: ['Queso colonia', 'Queso magro con sal', 'Queso magro sin sal', 'Muzzarella',
              'Queso sándwich', 'Queso rallado', 'Cheddar', 'Ricota', 'Quesos saborizados']
    },
    {
      titulo: 'Granos y frutos secos',
      items: ['Maní con sal', 'Maní sin sal', 'Mix de semillas', 'Frutos secos', 'Granos']
    },
    {
      titulo: 'Almacén',
      items: ['Dulces', 'Conservas', 'Aceites', 'Yerba', 'Productos sin gluten', 'Kombucha']
    }
  ]
};

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const linkWsp = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

/* ---------- Pantalla de entrada (2 segundos) ---------- */
(function intro() {
  const el = $('#intro');
  if (!el) return;
  const cerrar = () => { el.classList.add('listo'); setTimeout(() => el.remove(), 600); };
  setTimeout(cerrar, 2000);
  el.addEventListener('click', cerrar);
})();

/* ---------- WhatsApp y teléfono en toda la web ---------- */
$$('[data-wsp]').forEach((a) => {
  a.href = linkWsp(a.dataset.wsp);
  a.target = '_blank';
  a.rel = 'noopener';
});
$$('[data-tel]').forEach((a) => { a.href = `tel:+598${CONFIG.telefono.replace(/^0/, '')}`; });
$$('[data-tel-texto]').forEach((s) => { s.textContent = CONFIG.telefonoTexto; });
$('#anio').textContent = new Date().getFullYear();

/* ---------- Menú del celular ---------- */
(function menu() {
  const btn = $('#menuBtn');
  const nav = $('#menu');
  const cambiar = (abrir) => {
    btn.setAttribute('aria-expanded', String(abrir));
    nav.classList.toggle('abierto', abrir);
  };
  btn.addEventListener('click', () => cambiar(btn.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => cambiar(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cambiar(false); });
})();

/* ---------- Horario: abierto / cerrado según la hora de Uruguay ---------- */
(function horario() {
  const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const aMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const lindo = (hhmm) => hhmm.replace(/^0/, '');

  // Día y hora actuales en Montevideo, sin importar dónde esté el visitante.
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Montevideo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = (t) => partes.find((p) => p.type === t).value;
  const hoy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const ahora = Number(get('hour')) * 60 + Number(get('minute'));

  // Tabla de horarios: junta los días seguidos con el mismo horario
  // (ej: "Lunes a sábado 8:30 a 18:30"), que es más fácil de leer.
  const tbody = $('#tablaHorario');
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const texto = (d) => (CONFIG.horario[d] ? `${lindo(CONFIG.horario[d][0])} a ${lindo(CONFIG.horario[d][1])}` : 'Cerrado');
  const filas = [];
  orden.forEach((d) => {
    const ult = filas[filas.length - 1];
    if (ult && ult.texto === texto(d)) ult.dias.push(d);
    else filas.push({ dias: [d], texto: texto(d) });
  });
  filas.forEach((f) => {
    const tr = document.createElement('tr');
    if (f.dias.includes(hoy)) tr.className = 'hoy';
    const nombre = f.dias.length === 1 ? DIAS[f.dias[0]]
      : f.dias.length === 2 ? `${DIAS[f.dias[0]]} y ${DIAS[f.dias[1]].toLowerCase()}`
      : `${DIAS[f.dias[0]]} a ${DIAS[f.dias[f.dias.length - 1]].toLowerCase()}`;
    tr.innerHTML = `<td>${nombre}</td><td>${f.texto}</td>`;
    tbody.appendChild(tr);
  });

  // Texto de la portada
  const estado = $('#estadoHoy');
  const detalle = $('#estadoDetalle');
  const h = CONFIG.horario[hoy];
  if (h && ahora >= aMin(h[0]) && ahora < aMin(h[1])) {
    estado.textContent = 'Abierto ahora';
    detalle.textContent = `Hoy atendemos hasta las ${lindo(h[1])}`;
  } else if (h && ahora < aMin(h[0])) {
    estado.textContent = 'Cerrado en este momento';
    detalle.textContent = `Hoy abrimos a las ${lindo(h[0])}`;
  } else {
    // Buscar el próximo día que abre
    for (let i = 1; i <= 7; i++) {
      const d = (hoy + i) % 7;
      if (CONFIG.horario[d]) {
        estado.textContent = 'Cerrado en este momento';
        const cuando = i === 1 ? 'mañana' : `el ${DIAS[d].toLowerCase()}`;
        detalle.textContent = `Abrimos ${cuando} a las ${lindo(CONFIG.horario[d][0])}`;
        break;
      }
    }
  }
})();

/* ---------- Armá tu consulta ---------- */
(function armador() {
  const PESOS = ['¼ kg', '½ kg', '1 kg'];
  const elegidos = new Map(); // producto -> { porPeso, peso }
  const contenedor = $('#grupos');
  const lista = $('#listaItems');
  const vacia = $('#listaVacia');
  const enviar = $('#enviarConsulta');
  const borrar = $('#borrarConsulta');
  const otro = $('#otroProducto');

  CONFIG.grupos.forEach((g) => {
    const bloque = document.createElement('div');
    bloque.innerHTML = `<p class="grupo__titulo">${g.titulo}</p><div class="chips"></div>`;
    const chips = $('.chips', bloque);
    g.items.forEach((item) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = item;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (elegidos.has(item)) elegidos.delete(item);
        else elegidos.set(item, { porPeso: !!g.porPeso, peso: '' });
        dibujar();
      });
      chips.appendChild(b);
    });
    contenedor.appendChild(bloque);
  });

  function mensaje() {
    const lineas = [...elegidos].map(([p, d]) => `• ${p}${d.peso ? ` (${d.peso})` : ''}`);
    const extra = otro.value.trim();
    if (extra) lineas.push(`• ${extra}`);
    return `Hola, Portal Vida Sana. Quería consultar precio y disponibilidad de:\n${lineas.join('\n')}\n¡Gracias!`;
  }

  function dibujar() {
    $$('.chip', contenedor).forEach((c) => c.setAttribute('aria-pressed', String(elegidos.has(c.textContent))));
    lista.innerHTML = '';
    elegidos.forEach((d, producto) => {
      const li = document.createElement('li');
      li.className = 'lista__item';
      li.innerHTML = `<strong></strong><button type="button" class="lista__quitar" aria-label="Quitar">×</button>`;
      $('strong', li).textContent = producto;
      $('.lista__quitar', li).setAttribute('aria-label', `Quitar ${producto}`);
      $('.lista__quitar', li).addEventListener('click', () => { elegidos.delete(producto); dibujar(); });
      if (d.porPeso) {
        const fila = document.createElement('div');
        fila.className = 'cantidades';
        PESOS.forEach((p) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'cantidad';
          b.textContent = p;
          b.setAttribute('aria-pressed', String(d.peso === p));
          b.addEventListener('click', () => { d.peso = d.peso === p ? '' : p; dibujar(); });
          fila.appendChild(b);
        });
        li.appendChild(fila);
      }
      lista.appendChild(li);
    });
    actualizarBoton();
  }

  function actualizarBoton() {
    const hay = elegidos.size > 0 || otro.value.trim().length > 1;
    vacia.hidden = elegidos.size > 0;
    borrar.hidden = !hay;
    enviar.setAttribute('aria-disabled', String(!hay));
    if (hay) {
      enviar.href = linkWsp(mensaje());
      enviar.target = '_blank';
      enviar.rel = 'noopener';
    } else {
      enviar.href = '#consulta';
      enviar.removeAttribute('target');
    }
  }

  enviar.addEventListener('click', (e) => {
    if (enviar.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      vacia.textContent = 'Marcá al menos un producto, o escribí lo que buscás.';
    }
  });
  otro.addEventListener('input', actualizarBoton);
  borrar.addEventListener('click', () => { elegidos.clear(); otro.value = ''; dibujar(); });

  dibujar();
})();

/* ---------- Formulario de contacto (Web3Forms) ---------- */
(function formulario() {
  const form = $('#formulario');
  const estado = $('#f-estado');
  const boton = $('#f-enviar');

  const LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
  const CORREO = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  function telefonoValido(valor) {
    let n = valor.replace(/[\s\-().]/g, '');
    if (!/^\+?\d+$/.test(n)) return false;
    n = n.replace(/^(\+598|00598|598)(?=\d{8}$)/, '');
    return /^09[1-9]\d{6}$/.test(n)   // celular: 099 123 456
        || /^9[1-9]\d{6}$/.test(n)    // celular con +598
        || /^[24]\d{7}$/.test(n);     // fijo: 2xxx xxxx o 4xxx xxxx
  }

  const reglas = {
    'f-nombre': (v) => !v ? 'Escribí tu nombre.'
      : v.length < 2 ? 'El nombre es muy corto.'
      : !LETRAS.test(v) ? 'Usá solo letras, sin números ni símbolos.' : '',
    'f-apellido': (v) => !v ? 'Escribí tu apellido.'
      : v.length < 2 ? 'El apellido es muy corto.'
      : !LETRAS.test(v) ? 'Usá solo letras, sin números ni símbolos.' : '',
    'f-correo': (v) => !v ? 'Escribí tu correo para poder responderte.'
      : !CORREO.test(v) ? 'Revisá el correo, parece incompleto (ej: nombre@gmail.com).' : '',
    'f-telefono': (v) => !v ? 'Escribí un teléfono de contacto.'
      : !telefonoValido(v) ? 'Escribí un teléfono uruguayo válido (ej: 099 123 456).' : '',
    'f-tipo': (v) => !v ? 'Elegí el tipo de consulta.' : '',
    'f-mensaje': (v) => {
      if (!v) return 'Contanos qué necesitás.';
      if (v.length < 15) return 'El mensaje es muy corto. Contanos un poco más.';
      const palabras = v.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/g) || [];
      if (palabras.length < 3 || /(.)\1{5,}/.test(v)) return 'Escribí un mensaje con palabras, así te podemos ayudar.';
      return '';
    }
  };

  function validar(id) {
    const campo = $('#' + id);
    const msg = reglas[id](campo.value.trim());
    $('#e-' + id.slice(2)).textContent = msg;
    campo.classList.toggle('invalido', !!msg);
    campo.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  }

  Object.keys(reglas).forEach((id) => {
    const campo = $('#' + id);
    campo.setAttribute('aria-describedby', 'e-' + id.slice(2));
    campo.addEventListener('blur', () => { if (campo.value.trim()) validar(id); });
    campo.addEventListener('input', () => { if (campo.classList.contains('invalido')) validar(id); });
    campo.addEventListener('change', () => { if (campo.tagName === 'SELECT') validar(id); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    estado.textContent = '';
    estado.className = 'form__estado';
    const ok = Object.keys(reglas).map(validar).every(Boolean);
    if (!ok) {
      const primero = $('.campo.invalido', form);
      if (primero) primero.focus();
      return;
    }
    if (form.botcheck.checked) return; // robot

    const v = (id) => $('#' + id).value.trim();
    const datos = {
      access_key: CONFIG.web3formsKey,
      subject: CONFIG.asuntoMail,
      from_name: 'Web Quesería Portal Vida Sana',
      replyto: v('f-correo'),               // al responder el mail, le contestás al visitante
      'Nombre': v('f-nombre'),
      'Apellido': v('f-apellido'),
      'Correo electrónico': v('f-correo'),
      'Teléfono': v('f-telefono'),
      'Tipo de consulta': v('f-tipo'),
      'Mensaje': v('f-mensaje')
    };

    boton.disabled = true;
    boton.textContent = 'Enviando…';
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(datos)
      });
      const res = await r.json();
      if (!r.ok || !res.success) throw new Error(res.message || 'Error');
      form.reset();
      $$('.campo', form).forEach((c) => c.classList.remove('invalido'));
      estado.textContent = '¡Gracias! Recibimos tu consulta y te vamos a responder a la brevedad.';
      estado.classList.add('ok');
    } catch (err) {
      estado.textContent = 'No se pudo enviar. Probá de nuevo en un rato o escribinos por WhatsApp.';
      estado.classList.add('mal');
    } finally {
      boton.disabled = false;
      boton.textContent = 'Enviar consulta';
    }
  });
})();

/* ---------- Aparición suave al bajar ---------- */
(function revelar() {
  const els = $$('.revelar');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('visible')); return; }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => obs.observe(el));
})();
