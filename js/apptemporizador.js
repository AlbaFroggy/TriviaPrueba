window.addEventListener("load", () => { 
    const btnGenerar = document.querySelector('#generar-trivia');
    const contenedorTrivia = document.querySelector('#trivia');
    const resultado = document.querySelector('#resultado');
    const contador = document.querySelector('#contador');
    const btnReiniciar = document.querySelector('#reiniciar-juego'); // Botón de reiniciar
    const urlTrivia = 'JSON/trivia.json'; // Ruta del archivo JSON

    let trivia = [];
    let preguntaActual = null;
    let respuestasCorrectas = 0;
    let respuestasIncorrectas = 0;
    const maxErrores = 10; // Número máximo de errores permitidos
    const maxCorrectas = 10; // Número máximo de respuestas correctas para ganar
    let timer; // Variable para almacenar el temporizador
    const tiempoLimite = 10; // Tiempo límite para responder en segundos
    let tiempoRestante; // Variable para el tiempo restante de la pregunta
    let preguntasVisitadas = []; // Array para llevar registro de las preguntas ya mostradas

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

    // Mostrar una pregunta al azar sin repetir con el temporizador y las opciones
    function mostrarPregunta() {
        // Verificar si ya no hay más preguntas disponibles
        if (preguntasVisitadas.length === trivia.length) {
            contenedorTrivia.innerHTML = "<p>¡Ya no hay más preguntas disponibles!</p>";
            preguntasVisitadas = []; // Reiniciar las preguntas visitadas aquí

            // Mostrar el botón de reiniciar
            btnReiniciar.style.display = 'block';
            return;
        }

        // Ocultar el botón de "Generar Pregunta" mientras se muestra la trivia
        btnGenerar.style.display = 'none';

        // Elegir una pregunta aleatoria que no haya sido visitada
        let indiceAleatorio;
        do {
            indiceAleatorio = Math.floor(Math.random() * trivia.length);
        } while (preguntasVisitadas.includes(indiceAleatorio));

        // Marcar la pregunta como visitada
        preguntasVisitadas.push(indiceAleatorio);

        // Obtener la pregunta actual
        preguntaActual = trivia[indiceAleatorio];

        // Barajar las opciones de respuesta aleatoriamente
        const opcionesAleatorias = preguntaActual.opciones.sort(() => Math.random() - 0.5);

        const opcionesHTML = opcionesAleatorias
            .map(opcion => `<button class="opcion">${opcion}</button>`)
            .join('');

        contenedorTrivia.innerHTML = `
        <p>${preguntaActual.pregunta}</p>
        <div>${opcionesHTML}</div>
        <p id="temporizador">Tiempo restante: ${tiempoLimite} segundos</p>
        <div id="resultado"></div>
        <div id="contador"></div>
    `;

        // Mostrar el contenedor de trivia después de cargar la pregunta
        contenedorTrivia.style.display = 'block';

        // Iniciar el temporizador
        iniciarTemporizador();
    }

    // Iniciar el temporizador
    function iniciarTemporizador() {
        tiempoRestante = tiempoLimite;
        document.querySelector('#temporizador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

        // Actualizar cada segundo
        timer = setInterval(() => {
            tiempoRestante--;
            document.querySelector('#temporizador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

            // Si el tiempo se acaba, considerar la respuesta como incorrecta
            if (tiempoRestante === 0) {
                clearInterval(timer); // Detener el temporizador
                resultado.textContent = `Tiempo agotado. La respuesta correcta era: ${preguntaActual.respuesta}`;
                resultado.style.color = "red";

                // Resaltar las opciones
                const opciones = document.querySelectorAll('.opcion');
                opciones.forEach(opcion => {
                    if (opcion.textContent === preguntaActual.respuesta) {
                        opcion.style.backgroundColor = "#4ea93b"; // Respuesta correcta (verde)
                        opcion.style.color = "white"; // Texto blanco en la opción correcta
                    } else {
                        opcion.style.backgroundColor = "#E57373"; // Opciones incorrectas (rojo)
                        opcion.style.color = "white"; // Texto blanco en las opciones incorrectas
                    }
                });

                respuestasIncorrectas++; // Contabilizar el error

                // Actualizar el contador
                actualizarContador();

                // Mostrar una nueva pregunta después de 3 segundos
                setTimeout(() => {
                    resultado.textContent = "";
                    mostrarPregunta();
                }, 3000);
            }
        }, 1000);
    }

    // Manejar la respuesta del usuario
    function verificarRespuesta(e) {
        if (e.target.classList.contains('opcion')) {
            const respuestaUsuario = e.target.textContent;
            clearInterval(timer); // Detener el temporizador cuando se seleccione una respuesta

            // Deshabilitar todas las opciones después de que el usuario seleccione una respuesta
            const opciones = document.querySelectorAll('.opcion');
            opciones.forEach(opcion => {
                opcion.disabled = true; // Deshabilitar todos los botones
            });

            // Mostrar la respuesta correcta en verde y la incorrecta en rojo
            opciones.forEach(opcion => {
                if (opcion.textContent === preguntaActual.respuesta) {
                    opcion.style.backgroundColor = "#4ea93b"; // Respuesta correcta (verde)
                    opcion.style.color = "white"; // Texto blanco en la respuesta correcta
                } else if (opcion.textContent === respuestaUsuario) {
                    opcion.style.backgroundColor = "#E57373"; // Respuesta incorrecta (rojo)
                    opcion.style.color = "white"; // Texto blanco en la respuesta incorrecta
                }
            });

            // Mostrar el resultado
            if (respuestaUsuario === preguntaActual.respuesta) {
                resultado.className = "";
                resultado.innerHTML = ""; 
                resultado.textContent = "✨✨¡Correcto!✨✨";
                resultado.style.color = "green";
                respuestasCorrectas++;
            } else {
                resultado.className = "";
                resultado.innerHTML = ""; 
                resultado.innerHTML = `💥💥Incorrecto💥💥`;
                resultado.style.color = "red";
                respuestasIncorrectas++
            }

            resultado.style.textAlign = "center";

            // Actualizar el contador
            actualizarContador();

            // Verificar si el jugador ha alcanzado el límite de respuestas correctas o incorrectas
            if (respuestasCorrectas >= maxCorrectas) {
                terminarJuego("¡Felicidades, has ganado! Alcanzaste el máximo de respuestas correctas.");
                return;
            } else if (respuestasIncorrectas >= maxErrores) {
                terminarJuego("¡Has perdido! Alcanzaste el límite de errores.");
                return;
            }

            // Mostrar una nueva pregunta después de 3 segundos
            setTimeout(() => {
                resultado.textContent = "";
                mostrarPregunta();
            }, 2000);
        }
    }

    // Actualizar el contador en el HTML
    function actualizarContador() {
        contador.innerHTML = `
            <p>Respuestas Correctas: ${respuestasCorrectas}</p>
            <p>Respuestas Incorrectas: ${respuestasIncorrectas}</p>
        `;
    }

    // Finalizar el juego y mostrar el mensaje de victoria o derrota
    function terminarJuego(mensaje) {
        contenedorTrivia.innerHTML = `
            <p>${mensaje}</p>
        `;
        contenedorTrivia.style.color = "blue";
        resultado.textContent = "";

        // Ocultar el botón de Generar Pregunta
        btnGenerar.style.display = 'none';  // Ocultar el botón de generar pregunta

        // Mostrar el botón de reiniciar juego
        btnReiniciar.style.display = 'block'; // Mostrar el botón de reiniciar
    }

    // Recargar el juego con más preguntas
    function reiniciarJuego() {
        // Reiniciar variables
        respuestasCorrectas = 0;
        respuestasIncorrectas = 0;
        preguntasVisitadas = [];

        btnGenerar.style.display = 'block'; // Mostrar el botón de generar preguntas
        btnGenerar.disabled = false; // Habilitar el botón de generar preguntas
        btnReiniciar.style.display = 'none'; // Ocultar el botón de reiniciar

        actualizarContador(); // Actualizar el contador
        mostrarPregunta(); // Mostrar una nueva pregunta
    }

    // Registrar eventos
    btnGenerar.addEventListener('click', mostrarPregunta);
    contenedorTrivia.addEventListener('click', verificarRespuesta);
    btnReiniciar.addEventListener('click', reiniciarJuego); // Evento para reiniciar el juego

    // Cargar las preguntas al inicio
    cargarTrivia();
});
