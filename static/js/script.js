const inputImagen =
    document.getElementById("imagen");

const preview =
    document.getElementById("preview");

const previewContainer =
    document.getElementById("previewContainer");

const fileName =
    document.getElementById("fileName");

const btnAnalizar =
    document.getElementById("btnAnalizar");

const loading =
    document.getElementById("loading");

const resultado =
    document.getElementById("resultado");

const uploadArea =
    document.getElementById("uploadArea");


// ======================================
// SELECCIONAR IMAGEN
// ======================================

inputImagen.addEventListener("change", function () {

    const archivo = this.files[0];

    if (!archivo) {

        return;

    }


    // Verificar que sea una imagen

    if (!archivo.type.startsWith("image/")) {

        alert("Seleccione un archivo de imagen válido.");

        inputImagen.value = "";

        return;

    }


    // Mostrar nombre

    fileName.textContent =
        archivo.name;


    // Crear vista previa

    const url =
        URL.createObjectURL(archivo);

    preview.src = url;


    // Mostrar preview

    previewContainer.style.display =
        "block";


    // Activar botón

    btnAnalizar.disabled =
        false;


    // Limpiar resultados anteriores

    resultado.innerHTML = "";

});


// ======================================
// ANALIZAR IMAGEN
// ======================================

btnAnalizar.addEventListener("click", async function () {

    const archivo =
        inputImagen.files[0];


    if (!archivo) {

        alert("Seleccione una imagen.");

        return;

    }


    // Crear FormData

    const formData =
        new FormData();

    formData.append(
        "imagen",
        archivo
    );


    // Estado de carga

    btnAnalizar.disabled =
        true;

    loading.style.display =
        "block";

    resultado.innerHTML =
        "";


    try {

        const respuesta =
            await fetch(
                "/predict",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await respuesta.json();


        // ==============================
        // ERROR DEL BACKEND
        // ==============================

        if (!respuesta.ok || data.error) {

            throw new Error(
                data.error ||
                "Ocurrió un error durante el análisis."
            );

        }


        // ==============================
        // MOSTRAR RESULTADO
        // ==============================

        mostrarResultado(data);


    }

    catch (error) {

        console.error(
            "Error:",
            error
        );


        resultado.innerHTML = `

            <div class="error-card">

                <h3>
                    ⚠️ Error durante el análisis
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>

        `;

    }

    finally {

        loading.style.display =
            "none";

        btnAnalizar.disabled =
            false;

    }

});


// ======================================
// MOSTRAR RESULTADO
// ======================================

function mostrarResultado(data) {


    // ----------------------------------
    // PROBABILIDAD
    // ----------------------------------

    const probabilidad =
        Number(data.probabilidad || 0);


    const porcentaje =
        (probabilidad * 100).toFixed(2);


    // ----------------------------------
    // SÍNTOMAS
    // ----------------------------------

    const sintomas =
        convertirLista(data.sintomas);


    // ----------------------------------
    // PREVENCIÓN
    // ----------------------------------

    const prevencion =
        convertirLista(data.prevencion);


    // ----------------------------------
    // TRATAMIENTO
    // ----------------------------------

    const tratamiento =
        convertirLista(data.tratamiento);


    // ----------------------------------
    // RESULTADO
    // ----------------------------------

    resultado.innerHTML = `

        <div class="result-card">


            <div class="result-header">

                <div class="icon">
                    🍊
                </div>

                <h2>
                    ${escapeHTML(data.prediccion)}
                </h2>

                <span class="probability">

                    Confianza:
                    ${porcentaje}%

                </span>

                <div>

                    <span class="crop-badge">

                        🌿
                        ${escapeHTML(data.tipo)}

                    </span>

                </div>

            </div>


            <div class="info-grid">


                <!-- DESCRIPCIÓN -->

                <div class="info-box">

                    <h3>
                        📋 Descripción
                    </h3>

                    <p>
                        ${escapeHTML(data.descripcion)}
                    </p>

                </div>


                <!-- CAUSA -->

                <div class="info-box">

                    <h3>
                        🔬 Causa
                    </h3>

                    <p>
                        ${escapeHTML(data.causa)}
                    </p>

                </div>


                <!-- TRANSMISIÓN -->

                <div class="info-box">

                    <h3>
                        🦠 Transmisión
                    </h3>

                    <p>
                        ${escapeHTML(data.transmision)}
                    </p>

                </div>


                <!-- SÍNTOMAS -->

                <div class="info-box">

                    <h3>
                        ⚠️ Síntomas
                    </h3>

                    ${sintomas}

                </div>


                <!-- PREVENCIÓN -->

                <div class="info-box">

                    <h3>
                        🛡️ Prevención
                    </h3>

                    ${prevencion}

                </div>


                <!-- TRATAMIENTO -->

                <div class="info-box">

                    <h3>
                        💊 Tratamiento
                    </h3>

                    ${tratamiento}

                </div>


                <!-- COSTO -->

                <div class="info-box">

                    <h3>
                        💰 Costo
                    </h3>

                    <p>
                        ${escapeHTML(data.costo)}
                    </p>

                </div>


            </div>


            <button
                class="new-analysis"
                onclick="nuevoAnalisis()"
            >

                🔄 Realizar otro análisis

            </button>


        </div>

    `;


    // Desplazar hacia resultados

    resultado.scrollIntoView({
        behavior: "smooth"
    });

}


// ======================================
// CONVERTIR LISTAS DEL JSON
// ======================================

function convertirLista(datos) {


    // Si no existe

    if (!datos) {

        return "<p>No disponible.</p>";

    }


    // Si es un arreglo

    if (Array.isArray(datos)) {

        return `

            <ul>

                ${datos.map(item => `

                    <li>
                        ${escapeHTML(item)}
                    </li>

                `).join("")}

            </ul>

        `;

    }


    // Si es texto

    return `

        <p>
            ${escapeHTML(datos)}
        </p>

    `;

}


// ======================================
// NUEVO ANÁLISIS
// ======================================

function nuevoAnalisis() {


    inputImagen.value = "";

    preview.src = "";

    previewContainer.style.display =
        "none";

    fileName.textContent =
        "";

    resultado.innerHTML =
        "";

    btnAnalizar.disabled =
        true;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================
// PROTECCIÓN CONTRA HTML
// ======================================

function escapeHTML(valor) {


    if (valor === null ||
        valor === undefined) {

        return "";

    }


    const div =
        document.createElement("div");


    div.textContent =
        String(valor);


    return div.innerHTML;

}
