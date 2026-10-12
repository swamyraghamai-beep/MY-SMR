# MY-SMR — Personal Health Copilot

A local personal health-record organizer prototype. It scans images in the browser, sends extracted text to a local API for basic document classification, and stores reviewed records in SQLite on the same computer.

## Run locally

1. Install Node.js 22.5 or newer (Node.js 24 LTS is recommended). This app uses Node's built-in SQLite module, so no C++ build tools or separate database installation are needed.
2. In this project folder, run `npm.cmd install` in PowerShell. In Command Prompt, `npm install` is fine.
3. Run `npm.cmd start` in PowerShell (`npm start` in Command Prompt).
4. Open `http://127.0.0.1:3000` and use the demo registration/sign-in flow.

The server binds to `127.0.0.1` and serves the app and API. Do not open `index.html` directly. The browser will attempt a one-time migration of existing `my-smr-v1` localStorage data into SQLite. The database is stored in `%USERPROFILE%\.my-smr\my-smr.sqlite` by default; set `MY_SMR_DATA_DIR` to use another local folder.

## Included

- Express API with SQLite persistence for a local profile and health records (`GET`/`PUT /api/state`).
- A local document-analysis endpoint (`POST /api/analyze`) that classifies scanned text and extracts likely prescription, report, diagnosis, and date lines for user review.
- Camera/gallery upload with OCR, editable review, saved-record detail views with extracted report lines and the full OCR transcript, record search, timeline, and FHIR-inspired JSON export.
- The personalized overview displays extracted result lines from the most recently dated saved report.
- Image records keep a compressed JPEG preview in the local `record-images` folder inside the app data directory and show it with the extracted details.
- English, Hindi, Telugu, and Tamil dashboard text; OCR can recognize English, Hindi, Telugu, or Tamil alongside English.
- A general food and diet information panel, not personalized dietary or treatment advice.
- A prescription guide that presents captured prescription text with a plain-language explanation, quotes food-related text found on that prescription when detected, and otherwise provides general balanced-food information and medication-safety reminders. It does not infer a medicine's purpose or prescribe treatment.
- A symptom guide that recognizes common concerns across respiratory, digestive, heart, neurological, eye, ear, skin, urinary, reproductive, movement, and mental-health symptom groups in English, Hindi, Tamil, and Telugu. It offers general self-care and safety information, but is not exhaustive, does not diagnose, and does not recommend medicines.

## Medicine and report details

The scan reads images in the browser and prefills the review fields with details it can identify, including document type, date, provider when clearly labeled, medicine lines, report results, and diagnosis/notes. It also shows the OCR transcript so you can correct mistakes. Unclear details are left blank rather than guessed. For prescriptions, the dashboard also shows any detected food-related text as copied from the document, general balanced-food information when no clear instruction is detected, and safety reminders. The extraction is heuristic and may be incomplete or incorrect; it does not identify what a medicine treats, check interactions, validate a dose, or interpret a report as a clinician would. Confirm every name, dose, unit, and result against the original document and ask a doctor or pharmacist when unsure. No external medicine-information provider receives scan text.

## Privacy, accuracy, and safety

This is a **single-device prototype**, not a secure medical-record service. The SQLite API has no real user authentication, account isolation, encryption layer, authorization, ABDM integration, or ABHA verification. The demo login/register pages only store a name/email in browser storage; passwords are not saved or checked. Anyone with access to this Windows account or local computer may be able to read the database. Do not deploy this server to a public network or use it for sensitive clinical records.

Image OCR uses Tesseract.js and fetches its library/language data from jsDelivr; OCR runs in the browser, while the resulting text and a resized JPEG preview are sent to the local backend. Previews and records are stored on this device in the configured app data directory. Plain-text files work offline; PDFs are not supported. Browser speech recognition may use services outside the app; avoid speaking identifying or sensitive details.

OCR and rule-based extraction are best-effort and can misread handwriting, low-quality images, values, or units. Summaries organize extracted information and do not diagnose or recommend treatment. Reference-range checks are approximate and do not replace clinician interpretation. The diet panel contains general healthy-eating ideas only; seek individualized advice for allergies, pregnancy, or health conditions. Do not delay urgent care based on this app.

The symptom guide uses a limited local keyword check and general self-care information; it cannot recognize every symptom or phrase and is not a diagnosis, personalized diet plan, or substitute for professional assessment. It does not recommend medicines. Seek emergency care for severe or urgent symptoms.

The JSON export is **FHIR-inspired only**, not validated against an ABDM implementation guide and not suitable for submitting to an ABDM/ABHA service.
