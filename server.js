"use strict";

const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const crypto = require("node:crypto");
const os = require("node:os");
const path = require("node:path");

const app = express();
const host = "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const dataDirectory = process.env.MY_SMR_DATA_DIR || path.join(os.homedir(), ".my-smr");
const imageDirectory = path.join(dataDirectory, "record-images");
fs.mkdirSync(dataDirectory, { recursive: true });
fs.mkdirSync(imageDirectory, { recursive: true });

const database = new DatabaseSync(path.join(dataDirectory, "my-smr.sqlite"));
database.exec("PRAGMA journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const emptyState = {
  profile: { name: "Your name", dob: "", bloodGroup: "", allergies: "", abhaId: "" },
  records: [],
  recommendations: []
};
const allowedTypes = new Set(["prescription", "lab", "discharge", "diagnostic", "other"]);
const readState = database.prepare("SELECT state_json FROM app_state WHERE id = 1");
const writeState = database.prepare(`
  INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?, ?)
  ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
`);

app.disable("x-powered-by");
app.use(express.json({ limit: "8mb" }));

function requestError(response, status, message) {
  response.status(status).json({ error: message });
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value, maxLength, fieldName) {
  if (typeof value !== "string" || value.length > maxLength) {
    throw new Error(`${fieldName} must be text no longer than ${maxLength} characters.`);
  }
  return value;
}

function optionalText(value, maxLength, fieldName) {
  return cleanText(value === undefined || value === null ? "" : value, maxLength, fieldName);
}

function validateState(value) {
  if (!isPlainObject(value) || !isPlainObject(value.profile) || !Array.isArray(value.records) || value.records.length > 500) {
    throw new Error("The health profile or record list has an invalid format.");
  }
  const profile = {
    name: optionalText(value.profile.name, 100, "Profile name"),
    dob: optionalText(value.profile.dob, 10, "Date of birth"),
    bloodGroup: optionalText(value.profile.bloodGroup, 20, "Blood group"),
    allergies: optionalText(value.profile.allergies, 250, "Allergies"),
    abhaId: optionalText(value.profile.abhaId, 30, "ABHA ID")
  };
  const recommendations = Array.isArray(value.recommendations)
    ? value.recommendations.map((item, index) => {
        if (typeof item !== "string") throw new Error(`Recommendation ${index + 1} must be text.`);
        return cleanText(item.trim(), 500, `Recommendation ${index + 1}`).trim();
      }).filter(Boolean).slice(0, 8)
    : [];
  const seenIds = new Set();
  const records = value.records.map((record) => {
    if (!isPlainObject(record) || typeof record.id !== "string" || !record.id || seenIds.has(record.id)) {
      throw new Error("Every record must have a unique ID.");
    }
    seenIds.add(record.id);
    if (!allowedTypes.has(record.type)) throw new Error("A record has an unsupported type.");
    const title = optionalText(record.title, 120, "Record title").trim();
    if (!title) throw new Error("Every record must have a title.");
    const imageId = optionalText(record.imageId, 36, "Record image ID").toLowerCase();
    if (imageId && (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(imageId)
      || !fs.existsSync(path.join(imageDirectory, `${imageId}.jpg`)))) {
      throw new Error("Record image preview was not found on this device.");
    }
    const recordFields = { ...record };
    delete recordFields.imageData;
    return {
      ...recordFields,
      id: cleanText(record.id, 100, "Record ID"),
      title,
      type: record.type,
      date: optionalText(record.date, 10, "Record date"),
      provider: optionalText(record.provider, 120, "Provider"),
      diagnosis: optionalText(record.diagnosis, 600, "Diagnosis or notes"),
      medicines: optionalText(record.medicines, 600, "Medicines"),
      tests: optionalText(record.tests, 12000, "Test results"),
      rawText: optionalText(record.rawText, 12000, "Extracted text"),
      fileName: optionalText(record.fileName, 255, "File name"),
      mimeType: optionalText(record.mimeType, 100, "File type") || "text/plain",
      imageId
    };
  });
  return { profile, records, recommendations };
}

function extractDate(text) {
  const patterns = [
    { regex: /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/, order: "ymd" },
    { regex: /\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/, order: "dmy" },
    { regex: /\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(19\d{2}|20\d{2})\b/i, order: "dmy-name" },
    { regex: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(19\d{2}|20\d{2})\b/i, order: "mdy-name" }
  ];
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const [, first, second, third] = match;
    const namedMonth = pattern.order.endsWith("-name");
    const year = Number(namedMonth ? third : pattern.order === "ymd" ? first : third);
    const month = namedMonth
      ? monthNames.indexOf((pattern.order === "mdy-name" ? first : second).slice(0, 3).toLowerCase()) + 1
      : Number(second);
    const day = pattern.order === "ymd" ? Number(third) : pattern.order === "mdy-name" ? Number(second) : Number(first);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return "";
}

function extractProvider(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const labeled = line.match(/\b(?:clinic|hospital|medical center|medical facility|health center|provider|prescriber|physician|doctor)\s*[:\-]\s*(.{3,120})$/i);
    const named = line.match(/^(?:dr\.?|doctor|physician)\s+(.{3,120})$/i);
    const facility = line.match(/^(.{2,80}\b(?:clinic|hospital|medical center|health center))$/i);
    const provider = (labeled?.[1] || (named ? line : facility?.[1]) || "").trim();
    if (provider && !/\b(date|name|address|phone|signature|rank|degree)\b/i.test(provider)) return provider;
  }
  return "";
}

function matchingLines(text, expression) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && expression.test(line)).slice(0, 12).join("\n");
}

function analyzeDocument(body) {
  if (!isPlainObject(body)) throw new Error("The analysis request has an invalid format.");
  const text = cleanText(body.text, 12000, "Extracted text").trim();
  const fileName = cleanText(body.fileName || "health-record.txt", 255, "File name");
  const requestedType = body.requestedType || "auto";
  if (!["auto", ...allowedTypes].includes(requestedType)) throw new Error("Choose a supported record type.");
  const patientAge = body.patientAge;
  if (typeof patientAge !== "number" || !Number.isFinite(patientAge) || patientAge < 0 || patientAge > 120) {
    throw new Error("Patient age must be between 0 and 120 years.");
  }

  const lowered = text.toLowerCase();
  let type = requestedType;
  if (type === "auto") {
    if (/\b(prescription|rx|superscription|inscription|subscription|take one|dosage|tablet|capsule|once daily)\b/.test(lowered)) type = "prescription";
    else if (/\b(haemoglobin|hemoglobin|cbc|glucose|cholesterol|reference range|test result|laboratory|lab report)\b/.test(lowered)) type = "lab";
    else if (/\b(discharge|admitted|hospital course|discharged)\b/.test(lowered)) type = "discharge";
    else if (/\b(mri|ct scan|x-ray|ultrasound|diagnostic|impression)\b/.test(lowered)) type = "diagnostic";
    else type = "other";
  }
  const labTerms = /\b(haemoglobin|hemoglobin|hba1c|glucose|sugar|cholesterol|creatinine|platelet|wbc|rbc|tsh|vitamin|result|reference|range|mg\/dl|mmol|specimen|laboratory|lab report)\b/i;
  const medicineLines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) =>
    line && !labTerms.test(line) && !/\b(patient|address|phone|signature|rank|degree|lot no|manufacturer|medical facility)\b/i.test(line)
      && (/\b(tab(?:let)?s?|cap(?:sule)?s?|syrup|suspension|injection|drops?|cream|ointment|inhaler|take|prescribed|dosage|dose|once daily|twice daily|morning|night|after meals|before meals|bid|tid|od)\b|\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml)\b/i.test(line)
        || /(மாத்திரை|காப்ஸ்யூல்|சிரப்|தினமும்|காலையில்|இரவில்|உணவுக்குப் பிறகு|భోజనం తర్వాత|మాత్ర|క్యాప్సూల్|సిరప్|రోజుకు|ఉదయం|రాత్రి)/i.test(line))
  ).slice(0, 12);
  const reportLines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) =>
    line && /\b(haemoglobin|hemoglobin|hba1c|glucose|sugar|cholesterol|creatinine|platelet|wbc|rbc|tsh|vitamin|sodium|potassium|chloride|calcium|urea|egfr|albumin|bilirubin|aspartate|alanine|alt|ast|mcv|mch|rdw|result|mg\/dl|mmol|reference|range|high|low|positive|negative)\b/i.test(line)
  ).slice(0, 30);
  const diagnosis = matchingLines(text, /\b(diagnosis|impression|assessment|chief complaint|complaint|finding|history|admitted|discharge|clinical|reason for visit|presenting problem)\b/i);
  return {
    title: (fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") || "Untitled health record").slice(0, 120),
    type,
    date: extractDate(text),
    provider: extractProvider(text),
    diagnosis,
    medicines: medicineLines.join("\n"),
    tests: reportLines.join("\n"),
    rawText: text,
    patientAge,
    fileName,
    mimeType: cleanText(body.mimeType || "text/plain", 100, "File type"),
    createdAt: new Date().toISOString(),
    findings: {
      medicineLines,
      reportLines,
      note: "These are text matches from OCR, not verified medical interpretations."
    }
  };
}

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.get("/api/state", (_request, response) => {
  const row = readState.get();
  response.json({
    initialized: Boolean(row),
    ...(row ? JSON.parse(row.state_json) : emptyState)
  });
});

app.post("/api/record-images", express.raw({ type: "image/jpeg", limit: "2mb" }), (request, response) => {
  if (!Buffer.isBuffer(request.body) || request.body.length < 4
    || request.body[0] !== 0xff || request.body[1] !== 0xd8 || request.body[2] !== 0xff
    || request.body[request.body.length - 2] !== 0xff || request.body[request.body.length - 1] !== 0xd9) {
    return requestError(response, 400, "A valid JPEG preview is required.");
  }
  const imageId = crypto.randomUUID();
  try {
    fs.writeFileSync(path.join(imageDirectory, `${imageId}.jpg`), request.body, { flag: "wx" });
  } catch (error) {
    console.error("Unable to save a local health-record image preview.", error);
    return requestError(response, 500, "The local backend could not save the image preview.");
  }
  return response.status(201).json({ imageId });
});

app.get("/api/record-images/:imageId", (request, response) => {
  const { imageId } = request.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(imageId)) {
    return requestError(response, 404, "Image preview not found.");
  }
  const imagePath = path.join(imageDirectory, `${imageId}.jpg`);
  let image;
  try {
    image = fs.readFileSync(imagePath);
  } catch (error) {
    if (error.code === "ENOENT") return requestError(response, 404, "Image preview not found.");
    console.error("Unable to read a local health-record image preview.", error);
    return requestError(response, 500, "The local backend could not read the image preview.");
  }
  response.set("Cache-Control", "private, no-store");
  return response.type("jpeg").send(image);
});

app.put("/api/state", (request, response) => {
  try {
    const state = validateState(request.body);
    writeState.run(JSON.stringify(state), new Date().toISOString());
    response.json({ ok: true });
  } catch (error) {
    requestError(response, 400, error.message);
  }
});

app.post("/api/analyze", (request, response) => {
  try {
    response.json(analyzeDocument(request.body));
  } catch (error) {
    requestError(response, 400, error.message);
  }
});

const publicFiles = new Set(["app.js", "auth.js", "index.html", "login.html", "register.html", "styles.css"]);
app.get("/", (_request, response) => response.sendFile(path.join(__dirname, "login.html")));
app.get("/:file", (request, response, next) => {
  if (!publicFiles.has(request.params.file)) return next();
  return response.sendFile(path.join(__dirname, request.params.file));
});
app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return requestError(response, 400, "Request body must contain valid JSON.");
  }
  if (error.status === 413) return requestError(response, 413, "Request body is too large.");
  console.error("MY-SMR backend request failed.", error);
  return requestError(response, 500, "The backend could not complete the request.");
});

app.listen(port, host, () => {
  console.log(`MY-SMR local backend is ready at http://${host}:${port}`);
});
