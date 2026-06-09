import { resolve } from "node:path";
import Busboy from "busboy";
import OpenAI, { toFile } from "openai";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    envPrefix: ["VITE_", "FIREBASE_"],
    plugins: [transcriptionApiPlugin(env)],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      allowedHosts: [".loca.lt", ".trycloudflare.com"],
    },
    preview: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      allowedHosts: [".loca.lt", ".trycloudflare.com"],
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "index.html"),
          student: resolve(__dirname, "student.html"),
          teacherMonitor: resolve(__dirname, "teacherMonitor.html"),
        },
      },
    },
  };
});

function transcriptionApiPlugin(env) {
  return {
    name: "reading-fluency-transcription-api",
    configureServer(server) {
      server.middlewares.use("/api/transcribe", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "Method not allowed" });
          return;
        }

        const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          sendJson(response, 500, { error: "OPENAI_API_KEY is not configured on the server." });
          return;
        }

        try {
          const uploadedFile = await readMultipartFile(request);
          const openai = new OpenAI({ apiKey });
          const transcription = await openai.audio.transcriptions.create({
            file: await toFile(uploadedFile.buffer, uploadedFile.filename, {
              type: uploadedFile.mimeType,
            }),
            model: "whisper-1",
            language: "ko",
          });

          sendJson(response, 200, {
            transcript: typeof transcription === "string" ? transcription : transcription.text || "",
          });
        } catch (error) {
          sendJson(response, 500, {
            error: error instanceof Error ? error.message : "Transcription failed.",
          });
        }
      });
    },
  };
}

function readMultipartFile(request) {
  return new Promise((resolveFile, rejectFile) => {
    const parser = Busboy({
      headers: request.headers,
      limits: {
        files: 1,
        fileSize: 25 * 1024 * 1024,
      },
    });
    let uploadedFile = null;

    parser.on("file", (_fieldName, file, info) => {
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("limit", () => rejectFile(new Error("녹음 파일은 25MB 이하만 전사할 수 있습니다.")));
      file.on("end", () => {
        uploadedFile = {
          buffer: Buffer.concat(chunks),
          filename: info.filename || "reading-recording.webm",
          mimeType: info.mimeType || "audio/webm",
        };
      });
    });

    parser.on("error", rejectFile);
    parser.on("finish", () => {
      if (!uploadedFile) {
        rejectFile(new Error("전사할 녹음 파일이 없습니다."));
        return;
      }

      resolveFile(uploadedFile);
    });

    request.pipe(parser);
  });
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}
