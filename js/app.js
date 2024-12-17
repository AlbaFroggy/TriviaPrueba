window.addEventListener("load", () => {
    const btnGenerar = document.querySelector('#generar-trivia');
    const contenedorTrivia = document.querySelector('#trivia');
    const resultado = document.querySelector('#resultado');
    const contador = document.querySelector('#contador');
    const btnMasPreguntas = document.querySelector('#mas-preguntas');
    const urlTrivia = 'JSON/trivia.json';

    let trivia = [];
    let preguntaActual = null;
    let respuestasCorrectas = 0;
    let respuestasIncorrectas = 0;
    const maxErrores = 10;
    const maxCorrectas = 10;
    let preguntasVisitadas = [];

    // Cargar las preguntas desde el archivo JSON
    async function cargarTrivia() {
        try {
            const respuesta = await fetch(urlTrivia);
            if (!respuesta.ok) {
                throw new Error(`Error al cargar trivia: ${respuesta.status}`);
            }
            trivia = await respuesta.json();
        } catch (error) {
            console.error(error);
            contenedorTrivia.textContent = "No se pudieron cargar las preguntas. Intenta de nuevo más tarde.";
        }
    }

    // Mostrar una pregunta al azar sin repetir
    function mostrarPregunta() {
        if (preguntasVisitadas.length === trivia.length) {
            contenedorTrivia.innerHTML = "<p>¡Ya no hay más preguntas disponibles!</p>";
            preguntasVisitadas = []; 
            btnMasPreguntas.textContent = 'Reiniciar';
            btnMasPreguntas.style.display = 'block';
            return;
        }

        btnGenerar.style.display = 'none';

        let indiceAleatorio;
        do {
            indiceAleatorio = Math.floor(Math.random() * trivia.length);
        } while (preguntasVisitadas.includes(indiceAleatorio));

        preguntasVisitadas.push(indiceAleatorio);

        preguntaActual = trivia[indiceAleatorio];

        const opcionesAleatorias = preguntaActual.opciones.sort(() => Math.random() - 0.5);

        const opcionesHTML = opcionesAleatorias
            .map(opcion => `<button class="opcion">${opcion}</button>`)
            .join('');

        contenedorTrivia.innerHTML = `
        <p>${preguntaActual.pregunta}</p>
        <div>${opcionesHTML}</div>
        <div id="resultado"></div>
        <div id="contador"></div>
    `;

        contenedorTrivia.style.display = 'block';
    }

    // Manejar la respuesta del usuario
    function verificarRespuesta(e) {
        if (e.target.classList.contains('opcion')) {
            const respuestaUsuario = e.target.textContent;

            // Deshabilitar todas las opciones después de que el usuario seleccione una respuesta
            const opciones = document.querySelectorAll('.opcion');
            opciones.forEach(opcion => {
                opcion.disabled = true;
            });

            opciones.forEach(opcion => {
                if (opcion.textContent === preguntaActual.respuesta) {
                    opcion.style.backgroundColor = "#4ea93b"; // Respuesta correcta
                    opcion.style.color = "white"; // Texto blanco
                } else if (opcion.textContent === respuestaUsuario) {
                    opcion.style.backgroundColor = "#E57373"; // Respuesta incorrecta
                    opcion.style.color = "white"; // Texto blanco
                }
            });

            if (respuestaUsuario === preguntaActual.respuesta) {
                resultado.className = "";
                resultado.textContent = "¡Correcto! :)";
                resultado.style.color = "green";
                respuestasCorrectas++;
            } else {
                resultado.className = "";
                resultado.innerHTML = "Incorrecto :(";
                resultado.style.color = "red";
                respuestasIncorrectas++;
            }

            resultado.style.textAlign = "center";
            actualizarContador();

            if (respuestasCorrectas >= maxCorrectas) {
                terminarJuego("¡Felicidades, has ganado! Alcanzaste el máximo de respuestas correctas.");
                return;
            } else if (respuestasIncorrectas >= maxErrores) {
                terminarJuego("¡Has perdido! Alcanzaste el límite de errores.");
                return;
            }

            // Mostrar una nueva pregunta después de 2 segundos
            setTimeout(() => {
                resultado.textContent = "";
                mostrarPregunta();
            }, 2000);
        }
    }

    // Actualizar el contador
    function actualizarContador() {
        contador.innerHTML = `
            <p>Respuestas Correctas: ${respuestasCorrectas}</p>
            <p>Respuestas Incorrectas: ${respuestasIncorrectas}</p>
        `;
    }

    // Finalizar
    function terminarJuego(mensaje) {
        contenedorTrivia.innerHTML = `
            <p>${mensaje}</p>
        `;
        contenedorTrivia.style.color = "blue";
        resultado.textContent = "";
        btnGenerar.style.display = 'none';
        btnMasPreguntas.style.display = 'block';
    }

    // Recargar
    function reiniciarJuego() {
        respuestasCorrectas = 0;
        respuestasIncorrectas = 0;
        btnGenerar.style.display = 'block';
        btnGenerar.disabled = false;
        btnMasPreguntas.style.display = 'none';
        actualizarContador();
        mostrarPregunta();
    }

    btnGenerar.addEventListener('click', mostrarPregunta);
    contenedorTrivia.addEventListener('click', verificarRespuesta);
    btnMasPreguntas.addEventListener('click', reiniciarJuego);

    // Cargar las preguntas al inicio
    cargarTrivia();
});
