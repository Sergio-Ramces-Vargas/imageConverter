const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

// Habilitar CORS
app.use(cors());
app.use(express.json());

// Verificar que la carpeta "uploads" existe o crearla
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Carpeta 'uploads/' creada.");
}

// Configuración de multer para almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// Ruta para subir la imagen y convertir el formato
app.post("/convert", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen." });
    }

    const inputPath = path.resolve(req.file.path);
    const outputFormat = req.body.format.toLowerCase(); // Obtener el formato deseado
    const outputPath = path.resolve(`uploads/${path.basename(inputPath, path.extname(inputPath))}.${outputFormat}`);

    // Depuración: Mostrar rutas en la terminal
    console.log("Ruta de entrada:", inputPath);
    console.log("Ruta de salida:", outputPath);

    // Comprobar si el archivo de entrada existe
    if (!fs.existsSync(inputPath)) {
        console.error("ERROR: La imagen de entrada no existe.");
        return res.status(500).json({ error: "La imagen de entrada no existe." });
    }

    // Comando para ImageMagick
    const magickPath = `"C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\magick.exe"`;
    const command = `${magickPath} "${inputPath}" "${outputPath}"`;

    console.log("Ejecutando comando:", command);

    exec(command, { shell: true }, (err, stdout, stderr) => {
        if (err) {
            console.error("Error al convertir la imagen:", err, stderr);
            return res.status(500).json({ error: "Error en la conversión de la imagen." });
        }

        console.log("Conversión exitosa. Archivo generado:", outputPath);
        res.json({ message: "Conversión exitosa", downloadUrl: `http://localhost:3000/${outputPath}` });
    });
});

// Servir archivos estáticos desde la carpeta "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
