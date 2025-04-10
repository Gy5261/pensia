import { spawn } from "child_process";
import path from "path";

// Ruta al modelo
const modelPath = path.resolve(
  "C:\\Users\\david\\Downloads\\grupo e2\\gemma-3-12b-it-GGUF\\gemma-3-12b-it-Q4_K_M.gguf"
);

// Ruta al ejecutable o script que maneja el modelo
const executablePath = path.resolve(
  "C:\\Users\\david\\Downloads\\grupo e2\\custom_model_runner.exe" // Cambia esto si usas un script .py o similar
);

// Función para generar una respuesta
export async function generateResponse(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Verificar si el ejecutable existe
    if (!executablePath) {
      reject(new Error(`El ejecutable no se encontró en la ruta: ${executablePath}`));
      return;
    }

    // Ejecutar el programa con el modelo y el prompt
    const process = spawn(executablePath, [
      "--model", modelPath, // Ruta al modelo
      "--prompt", prompt,   // Prompt proporcionado
      "--max-tokens", "200" // Número máximo de tokens generados
    ]);

    let output = "";
    let errorOutput = "";

    // Capturar la salida estándar
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Capturar errores
    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    // Manejar el cierre del proceso
    process.on("close", (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Error al ejecutar el modelo: ${errorOutput}`));
      }
    });
  });
}