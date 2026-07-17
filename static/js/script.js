const inputImagen = document.getElementById("imagen");
const preview = document.getElementById("preview");
const boton = document.getElementById("btnAnalizar");
const resultado = document.getElementById("resultado");



inputImagen.addEventListener("change", function () {

    const archivo = this.files[0];

    if (archivo) {

        preview.src = URL.createObjectURL(archivo);
      //  preview.style.display = "block";

    }

});

boton.addEventListener("click", async () => {

    if (inputImagen.files.length === 0) {

        alert("Seleccione una imagen.");

        return;

    }

    const datos = new FormData();

    datos.append("imagen", inputImagen.files[0]);

    

    resultado.innerHTML = "<h2>Analizando imagen...</h2>";

    try {

        const respuesta = await fetch("/predict", {

            method: "POST",
            body: datos

        });

        const data = await respuesta.json();

        if (data.error) {

            resultado.innerHTML = `<p>${data.error}</p>`;

            return;

        }


        const sintomasHTML = data.sintomas
        .map(item => `<li>${item}</li>`)
        .join("");

        const prevencionHTML = data.prevencion
        .map(item => `<li>${item}</li>`)
        .join("");

        const tratamientoHTML = data.tratamiento
        .map(item => `<li>${item}</li>`)
        .join("");


        resultado.innerHTML = `

        <h2>${data.prediccion}</h2>

        <p><strong>Tipo:</strong> ${data.tipo}</p>

        <p><strong>Descripción:</strong></p>
        <p>${data.descripcion}</p>

        <p><strong>Causa:</strong></p>
        <p>${data.causa}</p>

        <p><strong>Transmisión:</strong></p>
        <p>${data.transmision}</p>

    

        <p><strong>Síntomas:</strong></p>

        <ul>
        ${sintomasHTML}
        </ul>

        <p><strong>Prevención:</strong></p>

        <ul>
        ${prevencionHTML}
        </ul>

        <p><strong>Tratamiento:</strong></p>

        <ul>
        ${tratamientoHTML}
        </ul>

        <p><strong>Costo:</strong> ${data.costo}</p>

        `;

    }

    catch (error) {

        resultado.innerHTML = "Error de conexión con Flask.";

    }

});