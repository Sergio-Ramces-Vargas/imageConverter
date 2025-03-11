document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("uploadDocument");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const fileInput = document.getElementById("fileInput").files[0];
        const formatSelect = document.getElementById("formatSelect").value;
        const output = document.getElementById("output");

        if (!fileInput || formatSelect === "Seleccione el formato") {
            output.textContent = "Por favor, seleccione un archivo y un formato válido.";
            return;
        }

        const formData = new FormData();
        formData.append("image", fileInput);
        formData.append("format", formatSelect.toLowerCase());

        try {
            const response = await fetch("http://localhost:3000/convert", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                output.innerHTML = `Conversión exitosa. <a href="${result.downloadUrl}" download>Descargar imagen convertida</a>`;
            } else {
                output.textContent = `Error: ${result.error}`;
            }
        } catch (error) {
            output.textContent = "Error al enviar el archivo.";
        }
    });
});