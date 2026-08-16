<script setup lang="ts">
import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { LEGAL_PATHS } from '../../routes'
</script>

<template>
  <PublicLayout>
    <article class="legal-page">
      <h1 class="legal-title">Política de Privacidad</h1>
      <p class="legal-updated">Última actualización: 16 de agosto de 2026</p>

      <p>
        Esta política explica qué datos personales tratamos en Titan TV, con qué finalidad, con
        quién los compartimos y cómo puedes ejercer tus derechos. Está redactada conforme a la Ley
        Orgánica de Protección de Datos Personales del Ecuador (LOPDP) y a su Reglamento.
      </p>

      <h2>1. Quién es responsable de tus datos</h2>
      <div class="legal-table-wrapper">
        <table class="legal-table">
          <tbody>
            <tr>
              <th>Responsable</th>
              <td>Villacrés Guamán Franklin Rafael</td>
            </tr>
            <tr>
              <th>Nombre comercial</th>
              <td>Titan TV</td>
            </tr>
            <tr>
              <th>RUC</th>
              <td>1802727816001</td>
            </tr>
            <tr>
              <th>Dirección</th>
              <td>
                Av. Quis Quis 06-41 y Quilliscacha, Huachi Loreto, Ambato, Tungurahua, Ecuador
              </td>
            </tr>
            <tr>
              <th>Correo de contacto</th>
              <td><a href="mailto:info@titantv.com.ec">info@titantv.com.ec</a></td>
            </tr>
            <tr>
              <th>Sitio web</th>
              <td><a href="https://titantv.com.ec">titantv.com.ec</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>2. Qué datos recopilamos</h2>

      <h3>Datos que nos entregas al registrarte</h3>
      <ul>
        <li>Nombres y apellidos</li>
        <li>Correo electrónico</li>
        <li>Contraseña, que almacenamos siempre cifrada y nunca en texto legible</li>
        <li>Número de teléfono con WhatsApp</li>
        <li>País y, opcionalmente, provincia y cantón</li>
        <li>Fecha de nacimiento</li>
        <li>Género, campo opcional que incluye la opción «Prefiero no decir»</li>
      </ul>

      <h3>Datos que se generan cuando compras</h3>
      <ul>
        <li>Número de placa o dorsal con el que participaste en el evento</li>
        <li>Fotografías seleccionadas, categoría y observaciones que escribas</li>
        <li>Estado y fechas del pedido, y el comprobante de pago que nos envíes por WhatsApp</li>
        <li>
          Una copia de tu nombre, correo y teléfono tal como estaban al momento de la compra, que se
          conserva junto al pedido para efectos contables y de trazabilidad
        </li>
      </ul>

      <h3>Datos técnicos</h3>
      <ul>
        <li>
          Dirección IP y navegador utilizado, que registramos únicamente al crear tu cuenta y al
          solicitar el restablecimiento de tu contraseña, como medida de seguridad
        </li>
        <li>Fecha y hora de tu último inicio de sesión</li>
        <li>Un identificador anónimo de carrito, si agregas fotos sin haber iniciado sesión</li>
      </ul>

      <p>
        No solicitamos ni almacenamos números de cédula, direcciones domiciliarias, datos de
        tarjetas de crédito ni información bancaria de nuestros clientes.
      </p>

      <h2>3. Las fotografías y su procesamiento automático</h2>

      <p>
        Las fotografías de los eventos son tomadas y cargadas por Titan TV o por el fotógrafo
        organizador del evento. Los participantes no suben fotografías al sistema.
      </p>

      <p>
        Cada fotografía pasa por un procesamiento automático que cumple dos funciones: encontrar y
        leer el número de placa o dorsal, y reconocer los colores del casco, la ropa y la bicicleta.
        Para ello, el sistema detecta cinco tipos de objeto dentro de la imagen: bicicleta, número
        de competidor, ropa del ciclista, casco y ciclista con bicicleta. Sobre el recorte del
        número se aplica lectura óptica de caracteres para obtener los dígitos.
      </p>

      <div class="legal-callout">
        <p>
          <strong>No usamos reconocimiento facial.</strong> El sistema no detecta, no extrae y no
          almacena rostros, ni genera plantillas biométricas de ninguna clase. La identificación de
          un participante dentro de una galería se realiza exclusivamente por el número de placa y,
          de forma complementaria, por los colores de su equipamiento. En consecuencia, no tratamos
          datos biométricos ni ninguna otra categoría especial de datos personales.
        </p>
      </div>

      <p>
        Adicionalmente generamos una representación numérica de cada fotografía completa, que
        permite buscar imágenes visualmente parecidas dentro de un mismo evento. Esta representación
        describe la imagen en su conjunto y no se utiliza para identificar personas ni se compara
        entre eventos distintos.
      </p>

      <h3>Metadatos de las fotografías</h3>
      <p>
        Los archivos originales conservan los metadatos técnicos que la cámara incorpora al momento
        de la captura, que pueden incluir fecha y hora, marca y modelo del equipo y, en algunos
        casos, coordenadas de ubicación. Estos metadatos permanecen en los archivos que entregamos
        al comprador. No los leemos, no los indexamos y no los utilizamos con ninguna finalidad.
      </p>

      <h2>4. Para qué usamos tus datos</h2>
      <div class="legal-table-wrapper">
        <table class="legal-table">
          <thead>
            <tr>
              <th>Finalidad</th>
              <th>Base legal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Crear y mantener tu cuenta, y permitirte iniciar sesión</td>
              <td>Ejecución del contrato</td>
            </tr>
            <tr>
              <td>Procesar tu pedido, coordinar el pago y entregarte tus fotografías</td>
              <td>Ejecución del contrato</td>
            </tr>
            <tr>
              <td>Comunicarnos contigo por WhatsApp o correo sobre tu pedido</td>
              <td>Ejecución del contrato y consentimiento</td>
            </tr>
            <tr>
              <td>Clasificar las fotografías por número de placa para que puedas encontrarte</td>
              <td>Interés legítimo en prestar el servicio</td>
            </tr>
            <tr>
              <td>Proteger las cuentas frente a accesos no autorizados y abusos</td>
              <td>Interés legítimo en la seguridad</td>
            </tr>
            <tr>
              <td>Cumplir obligaciones tributarias y contables</td>
              <td>Obligación legal</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        No utilizamos tus datos para publicidad, no elaboramos perfiles comerciales, no tomamos
        decisiones automatizadas que produzcan efectos jurídicos sobre ti y nunca vendemos tu
        información a terceros.
      </p>

      <h2>5. Comunicaciones por WhatsApp</h2>

      <p>
        WhatsApp es el canal principal por el que gestionamos los pedidos. Al registrarte y aceptar
        esta política autorizas expresamente que Titan TV te escriba por WhatsApp al número que
        proporcionaste, con los siguientes fines:
      </p>
      <ul>
        <li>Enviarte la información necesaria para pagar tu pedido</li>
        <li>Confirmarte la recepción del pago</li>
        <li>Entregarte el enlace de descarga de tus fotografías</li>
        <li>Responder tus consultas sobre un pedido en curso</li>
      </ul>

      <p>
        Estas comunicaciones se refieren únicamente a la gestión de tus pedidos. No te enviaremos
        publicidad ni promociones por WhatsApp sin pedirte antes una autorización específica y
        separada para ello.
      </p>

      <p>
        Puedes retirar tu autorización en cualquier momento escribiéndonos a
        <a href="mailto:info@titantv.com.ec">info@titantv.com.ec</a> o respondiendo «BAJA» a
        cualquiera de nuestros mensajes. Ten presente que, si retiras esta autorización, deberemos
        coordinar por correo electrónico el pago y la entrega de tus fotografías.
      </p>

      <p>
        Los mensajes se envían a través de la plataforma de WhatsApp, operada por Meta Platforms,
        Inc. El contenido de la conversación queda alojado en la infraestructura de ese proveedor
        conforme a sus propias condiciones y políticas.
      </p>

      <h2>6. Con quién compartimos tus datos</h2>

      <p>
        No vendemos ni cedemos tus datos. Los compartimos únicamente con los proveedores que hacen
        funcionar el servicio, que los tratan siguiendo nuestras instrucciones:
      </p>

      <div class="legal-table-wrapper">
        <table class="legal-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Qué recibe</th>
              <th>País</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Proveedor">Hetzner Cloud</td>
              <td data-label="Qué recibe">
                Servidores donde residen la aplicación y la base de datos
              </td>
              <td data-label="País">Estados Unidos</td>
            </tr>
            <tr>
              <td data-label="Proveedor">Backblaze B2</td>
              <td data-label="Qué recibe">
                Almacenamiento de las fotografías originales, retocadas y sus recortes
              </td>
              <td data-label="País">Estados Unidos</td>
            </tr>
            <tr>
              <td data-label="Proveedor">Cloudflare</td>
              <td data-label="Qué recibe">
                Entrega de las imágenes al navegador, aplicación de la marca de agua, envío de
                correos y gestión del dominio. Recibe la dirección IP de cada visitante
              </td>
              <td data-label="País">Estados Unidos y red global</td>
            </tr>
            <tr>
              <td data-label="Proveedor">Modal</td>
              <td data-label="Qué recibe">
                Procesamiento automático de cada fotografía mediante un enlace temporal de una hora
              </td>
              <td data-label="País">Estados Unidos</td>
            </tr>
            <tr>
              <td data-label="Proveedor">Voyage AI</td>
              <td data-label="Qué recibe">
                Una copia reducida de cada fotografía, para generar la búsqueda por similitud
              </td>
              <td data-label="País">Estados Unidos</td>
            </tr>
            <tr>
              <td data-label="Proveedor">Meta Platforms</td>
              <td data-label="Qué recibe">
                Los mensajes de WhatsApp y el número de teléfono del destinatario
              </td>
              <td data-label="País">Estados Unidos</td>
            </tr>
            <tr>
              <td data-label="Proveedor">Google Fonts</td>
              <td data-label="Qué recibe">
                La dirección IP del visitante al cargar las tipografías de la página
              </td>
              <td data-label="País">Estados Unidos</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        También podremos entregar información cuando una autoridad competente lo requiera mediante
        orden fundamentada.
      </p>

      <h3>Transferencia internacional</h3>
      <p>
        Toda nuestra infraestructura se encuentra fuera del Ecuador, principalmente en Estados
        Unidos. Al usar Titan TV aceptas que tus datos sean tratados en esos países. Seleccionamos
        proveedores que ofrecen garantías contractuales de seguridad y confidencialidad equivalentes
        a las exigidas por la normativa ecuatoriana.
      </p>

      <h2>7. Cuánto tiempo conservamos tus datos</h2>
      <div class="legal-table-wrapper">
        <table class="legal-table">
          <thead>
            <tr>
              <th>Dato</th>
              <th>Plazo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cuenta y perfil</td>
              <td>Mientras la cuenta permanezca activa</td>
            </tr>
            <tr>
              <td>Pedidos y su comprobante</td>
              <td>
                De forma indefinida, por obligaciones contables y para análisis estadístico del
                servicio. Puedes pedir que se anonimicen
              </td>
            </tr>
            <tr>
              <td>Fotografías del evento</td>
              <td>Mientras el evento permanezca activo</td>
            </tr>
            <tr>
              <td>Enlace de descarga</td>
              <td>Siete días desde su emisión, con un máximo de cincuenta accesos</td>
            </tr>
            <tr>
              <td>Enlace de vista previa</td>
              <td>Siete días desde su emisión</td>
            </tr>
            <tr>
              <td>Carrito sin compra</td>
              <td>Treinta días</td>
            </tr>
            <tr>
              <td>Sesión iniciada</td>
              <td>Treinta días</td>
            </tr>
            <tr>
              <td>Enlace de restablecimiento de contraseña</td>
              <td>Treinta minutos, y un solo uso</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>8. Cómo protegemos tus datos</h2>
      <ul>
        <li>Las contraseñas se almacenan cifradas con bcrypt y no son recuperables</li>
        <li>Toda la comunicación con el sitio viaja cifrada mediante HTTPS</li>
        <li>
          Las fotografías de las galerías públicas se muestran con marca de agua y en baja
          resolución; la versión completa solo se entrega tras la compra
        </li>
        <li>
          Los enlaces de vista previa y de descarga usan claves aleatorias de 256 bits, imposibles
          de adivinar, con límite de accesos y caducidad
        </li>
        <li>El acceso a los datos de clientes está restringido al personal autorizado</li>
      </ul>

      <div class="legal-callout">
        <p>
          Quien tenga el enlace de descarga puede ver el nombre del comprador y descargar las
          fotografías, sin necesidad de iniciar sesión. Comparte ese enlace únicamente con quien
          desees.
        </p>
      </div>

      <h2>9. Tus derechos</h2>
      <p>Conforme a la LOPDP, en cualquier momento puedes solicitar:</p>
      <ul>
        <li><strong>Acceso</strong>: saber qué datos tuyos tratamos</li>
        <li><strong>Rectificación</strong>: corregir datos inexactos o incompletos</li>
        <li><strong>Eliminación</strong>: pedir que borremos tus datos</li>
        <li><strong>Oposición</strong>: oponerte a un tratamiento determinado</li>
        <li><strong>Portabilidad</strong>: recibir tus datos en un formato reutilizable</li>
        <li><strong>Suspensión</strong>: pedir que detengamos temporalmente el tratamiento</li>
        <li>
          <strong>No ser objeto de decisiones automatizadas</strong> que produzcan efectos jurídicos
          sobre ti
        </li>
      </ul>

      <p>
        Escríbenos a <a href="mailto:info@titantv.com.ec">info@titantv.com.ec</a>
        indicando tu nombre completo, el correo con el que te registraste y qué derecho deseas
        ejercer. Responderemos dentro de los quince días previstos por la ley.
      </p>

      <p>
        Si solicitas la eliminación de tu cuenta y tienes pedidos realizados, eliminaremos tu perfil
        y anonimizaremos los datos personales asociados a esos pedidos, de modo que el registro
        contable subsista sin quedar vinculado a ti.
      </p>

      <p>
        Si consideras que no atendimos correctamente tu solicitud, puedes presentar un reclamo ante
        la Superintendencia de Protección de Datos Personales del Ecuador.
      </p>

      <h2>10. Niñas, niños y adolescentes</h2>
      <p>
        En las competencias existen categorías juveniles, por lo que algunos participantes son
        menores de edad. Cuando el participante sea menor de dieciocho años, la cuenta debe ser
        creada y utilizada por su padre, madre o representante legal, quien acepta esta política y
        autoriza el tratamiento de los datos en su nombre, incluido el envío de mensajes por
        WhatsApp al número que registre.
      </p>
      <p>
        Tratamos los datos de menores únicamente para las mismas finalidades descritas en esta
        política: identificar sus fotografías por el número de placa, gestionar el pedido y
        entregarlo. No los usamos con ningún fin publicitario ni de elaboración de perfiles.
      </p>
      <p>
        Si eres representante legal de un menor y quieres revisar, corregir o eliminar sus datos,
        escríbenos a <a href="mailto:info@titantv.com.ec">info@titantv.com.ec</a> y atenderemos la
        solicitud con prioridad.
      </p>

      <h2>11. Cookies y almacenamiento en tu navegador</h2>
      <p>
        No usamos cookies de publicidad, de analítica ni de seguimiento. No hay píxeles de redes
        sociales ni herramientas de medición de terceros en este sitio. Empleamos únicamente lo
        estrictamente necesario para que el servicio funcione:
      </p>
      <ul>
        <li>
          <code>refresh_token</code>: cookie de sesión que mantiene tu sesión iniciada. No es
          accesible desde JavaScript y caduca a los treinta días
        </li>
        <li>
          <code>titan_access_token</code>: guardado en tu navegador para mantener la sesión activa
          mientras navegas
        </li>
        <li>
          <code>titan_cart_session_id</code>: identificador anónimo que permite conservar tu carrito
          si aún no iniciaste sesión
        </li>
      </ul>

      <h2>12. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política cuando cambien nuestros servicios o la normativa aplicable.
        La fecha de la última actualización aparece al inicio. Si el cambio es sustancial, te
        avisaremos por correo electrónico o mediante un aviso visible en el sitio.
      </p>

      <h2>13. Contacto</h2>
      <p>
        Para cualquier consulta sobre esta política o sobre el tratamiento de tus datos, escríbenos
        a
        <a href="mailto:info@titantv.com.ec">info@titantv.com.ec</a>.
      </p>

      <p>
        Consulta también nuestros
        <RouterLink :to="LEGAL_PATHS.TERMS">Términos y Condiciones</RouterLink>.
      </p>
    </article>
  </PublicLayout>
</template>

<style scoped src="./styles/legal-view.css" />
