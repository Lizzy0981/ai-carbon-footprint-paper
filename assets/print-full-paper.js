/**
 * Descarga/imprime el paper científico completo (13 secciones) como un solo PDF.
 * Funciona cargando cada sección en un iframe dentro de una pestaña nueva,
 * ajustando la altura de cada iframe a su contenido real, y llamando a print()
 * una vez que todas cargaron. Cada iframe conserva su propio CSS (incluyendo
 * los fondos oscuros ya corregidos para impresión), así que no hay conflictos
 * de estilos entre secciones.
 */
(function () {
  var BASE_SECTIONS = [
    'portada',
    'toc',
    'resumen',
    'introduccion',
    'metodologia',
    'resultados',
    'impacto_hidrico',
    'residuos_electronicos',
    'minerales_biodiversidad',
    'discusion',
    'recomendaciones',
    'conclusiones',
    'referencias'
  ];

  // Detecta si la página actual usa un sufijo de idioma en el nombre de archivo
  // (p. ej. "metodologia_en.html" en la carpeta /en/) y lo replica para las demás
  // secciones. En carpetas sin sufijo (es, fr, pt, etc.) esto no tiene efecto.
  function detectSuffix() {
    var current = window.location.pathname.split('/').pop() || '';
    var m = current.match(/(_[a-zA-Z]{2,3})\.html$/);
    return m ? m[1] : '';
  }

  var SUFFIX = detectSuffix();
  var SECTIONS = BASE_SECTIONS.map(function (name) { return name + SUFFIX + '.html'; });

  window.downloadFullPaper = function () {
    var win = window.open('', '_blank');
    if (!win) {
      alert('El navegador bloqueó la ventana emergente. Por favor permite pop-ups para este sitio e inténtalo de nuevo.');
      return;
    }

    win.document.open();
    win.document.write(
      '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<title>Paper Completo — Descarga PDF</title>' +
      '<style>' +
      'html,body{margin:0;padding:0;}' +
      'iframe{width:100%;border:none;display:block;}' +
      '.loading-msg{font-family:sans-serif;text-align:center;padding:60px 20px;color:#555;}' +
      '@media print{' +
      '  .loading-msg{display:none;}' +
      '  iframe{page-break-after:always;}' +
      '  iframe:last-child{page-break-after:auto;}' +
      '}' +
      '</style></head><body>' +
      '<div class="loading-msg" id="loadingMsg">Cargando las 13 secciones del paper, por favor espera…</div>' +
      '</body></html>'
    );
    win.document.close();

    var loadedCount = 0;
    var total = SECTIONS.length;

    SECTIONS.forEach(function (src) {
      var iframe = win.document.createElement('iframe');
      iframe.src = src;
      iframe.style.height = '400px'; // altura provisional hasta que cargue
      iframe.onload = function () {
        try {
          var doc = iframe.contentWindow.document;
          var h = Math.max(
            doc.documentElement.scrollHeight,
            doc.body ? doc.body.scrollHeight : 0
          );
          iframe.style.height = h + 'px';
        } catch (e) {
          // Si por algún motivo no se puede leer la altura, se deja un valor generoso
          iframe.style.height = '1600px';
        }
        loadedCount++;
        if (loadedCount === total) {
          var msg = win.document.getElementById('loadingMsg');
          if (msg) msg.remove();
          setTimeout(function () {
            win.focus();
            win.print();
          }, 400);
        }
      };
      win.document.body.appendChild(iframe);
    });
  };
})();
