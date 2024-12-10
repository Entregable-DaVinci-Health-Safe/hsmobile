export const createHtmlTemplate = (data) => {
  const renderPrescriptions = (prescriptions) =>
    prescriptions
      .map(
        (prescription) => `
        <div class="section">
          <div class="section-header prescription-header">Prescripción Médica</div>
          <table class="table">
            <thead>
              <tr>
                <th>País</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Enlace</th>
              </tr>
            </thead>
            <tbody>
              ${[...(prescription.recetas || []), ...(prescription.estudios || [])]
                .map(
                  (item) => `
                <tr>
                  <td>${prescription.pais || 'Desconocido'}</td>
                  <td>${item.tipo || 'Desconocido'}</td>
                  <td>${item.descripcion || 'Sin descripción'}</td>
                  <td>${item.fecha || 'Sin fecha'}</td>
                  <td>${
                    item.url
                      ? `<a href="${item.url}" target="_blank">Ver</a>`
                      : 'No disponible'
                  }</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
      )
      .join('');

  const renderTypeButtons = (informe) => {
    // Determinar los tipos presentes en las prescripciones
    const types = {
      recetas: informe.prescripciones.some(
        (prescription) => (prescription.recetas || []).length > 0
      ),
      estudios: informe.prescripciones.some(
        (prescription) =>
          (prescription.estudios || []).some((estudio) => estudio.tipo === 'Orden')
      ),
      resultados: informe.prescripciones.some(
        (prescription) =>
          (prescription.estudios || []).some((estudio) => estudio.tipo === 'Resultado')
      ),
    };

    return `
      <div class="buttons">
        <div class="button ${types.recetas ? 'active' : ''}">Prescripción Médica</div>
        <div class="button ${types.estudios ? 'active' : ''}">Orden de Estudios</div>
        <div class="button ${types.resultados ? 'active' : ''}">Resultado de Estudios</div>
      </div>
    `;
  };

  return `
    <html>
      <head>
        <style>
          body {
            font-family: Helvetica, Arial, sans-serif;
            margin: 20px;
            color: #333333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            font-size: 22px;
            font-weight: bold;
            color: #333333;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-header {
            font-size: 16px;
            margin-bottom: 10px;
            color: #4A90E2;
            font-weight: bold;
          }
          .content {
            font-size: 14px;
            line-height: 1.6;
            color: #555555;
          }
          .content p {
            margin-bottom: 10px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .table th {
            background-color: #f0f0f0;
            color: #4A90E2;
            font-weight: bold;
            padding: 10px;
            text-align: left;
            border: 1px solid #e7e7e7;
          }
          .table td {
            padding: 10px;
            border: 1px solid #e7e7e7;
            text-align: left;
          }
          .buttons {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
          }
          .button {
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            background-color: #f0f0f0;
            color: #555555;
            margin: 0 5px;
          }
          .button.active {
            background-color: #007bff;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="header">
          Historia Clínica
        </div>
        <div class="section">
          <div class="section-header">Información del Paciente</div>
          <div class="content">
            <p><strong>Nombre:</strong> ${data.nombre || 'No disponible'}</p>
            <p><strong>Diagnóstico:</strong> ${data.diagnostico || 'No disponible'}</p>
            <p><strong>Indicaciones:</strong> ${data.indicaciones || 'No disponible'}</p>
          </div>
        </div>
        ${data.informes
          .map(
            (informe) => `
          <div class="section">
            <div class="section-header">Información del Informe</div>
            <div class="content">
              <p><strong>Fecha de Visita:</strong> ${
                informe.fechaVisita || 'No especificada'
              }</p>
              <p><strong>Estado:</strong> ${informe.activo ? 'Activo' : 'Inactivo'}</p>
            </div>
            ${renderTypeButtons(informe)}
          </div>
          ${renderPrescriptions(informe.prescripciones || [])}
        `
          )
          .join('')}
      </body>
    </html>
  `;
};
