# DBT Companion - DBT Diary & AI Support

Esta es una aplicación completa de Terapia Dialéctico-Conductual (DBT) con soporte de Inteligencia Artificial, construida con React, Tailwind CSS y la API de Google Gemini.

## Cómo ejecutar esta aplicación fuera de AI Studio

Sigue estos pasos para poner en marcha la aplicación en tu propia computadora:

### 1. Requisitos previos
- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
- Una clave de API de Google Gemini (puedes obtenerla gratis en [Google AI Studio](https://aistudio.google.com/app/apikey)).

### 2. Instalación
1. Descarga el código fuente del proyecto (como ZIP o vía GitHub).
2. Abre una terminal en la carpeta del proyecto.
3. Instala las dependencias:
   ```bash
   npm install
   ```

### 3. Configuración
1. Crea un archivo llamado `.env` en la raíz del proyecto.
2. Añade tu clave de API de Gemini al archivo:
   ```env
   VITE_GEMINI_API_KEY=tu_clave_aqui
   ```
   *Nota: En esta versión local, usaremos el prefijo `VITE_` para que la clave sea accesible desde el navegador.*

### 4. Ejecución
Inicia el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

## Estructura del Proyecto
- `src/App.tsx`: Componente principal y lógica de la interfaz.
- `src/services/aiService.ts`: Integración con la IA de Gemini.
- `src/types.ts`: Definiciones de datos y base de conocimientos de habilidades DBT.
- `src/index.css`: Estilos globales y configuración de Tailwind.

## Tecnologías utilizadas
- **React 19**
- **Vite** (Build tool)
- **Tailwind CSS 4** (Estilos)
- **Motion** (Animaciones)
- **Google Generative AI SDK** (@google/genai)
