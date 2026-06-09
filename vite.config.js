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
            temperature: 0,
            prompt:
              "초등학생 문단글 읽기 유창성 검사 녹음입니다. 실제 들리는 말을 교정하지 말고 가능한 한 그대로 한국어로 전사하세요. 음소 반복, 음절 반복, 말더듬, 머뭇거림, 자기수정 표현을 삭제하거나 정상화하지 마세요. 예를 들어 화자가 'ㅂㅂㅂ바다는'처럼 읽으면 '바다는'으로 고치지 말고 'ㅂㅂㅂ바다는'으로 적으세요. 화자가 '바다는 아니 바다가'처럼 스스로 수정하면 전체를 '바다는 아니 바다가'로 적으세요. '음', '어', '아니', '그러니까' 같은 삽입어도 들리면 남기세요. 자연스러운 발음 변화도 들리는 대로 전사하세요.",
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
