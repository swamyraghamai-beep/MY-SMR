(() => {
  "use strict";

  const STORAGE_KEY = "my-smr-v1";
  const AUTH_SESSION_KEY = "my-smr-demo-session";
  try {
    if (sessionStorage.getItem(AUTH_SESSION_KEY) !== "1") {
      window.location.replace("login.html");
      return;
    }
  } catch (error) {
    console.error("Unable to check the demo sign-in state.", error);
    window.location.replace("login.html");
    return;
  }

  const OCR_SCRIPT = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
  const translations = {
    en: {
      ui: {
        "nav-workspace": "WORKSPACE", "nav-overview": "Overview", "nav-records": "My records", "nav-timeline": "Health timeline", "nav-profile": "Health profile",
        "nav-symptoms": "Symptom guide",
        "privacy-title": "Your health, your control", "privacy-copy": "This prototype stores records in a local SQLite database on this device.",
        "local-badge-label": "Local database",
        "breadcrumb-overview": "Overview", "welcome-eyebrow": "YOUR HEALTH, IN ONE PLACE", "welcome-intro": "A clearer picture of your health starts here.", "upload-trigger-label": "Open scanner",
        "scanner-eyebrow": "PRESCRIPTION SCANNER", "scanner-heading": "Scan or upload a prescription", "scanner-description": "Take a photo with your camera or choose an image from your gallery. Review OCR text before saving.",
        "symptom-eyebrow": "GENERAL HEALTH INFORMATION", "symptom-heading": "Describe your symptoms", "symptom-intro": "Describe what you feel and when it started for plain-language information, general comfort and food ideas, and warning signs. This tool cannot diagnose or recommend medicines.", "symptom-coverage": "Recognizes common concerns involving breathing, heart, digestion, eyes, ears, skin, urinary and reproductive health, pain, sleep, and mood. This list is not exhaustive.",
        "symptom-age-label": "Patient age (years), required", "symptom-text-label": "Symptoms and when they started", "voice-input-label": "🎙 Speak symptoms", "voice-stop-label": "Stop listening", "check-symptoms-label": "Check next steps",
        "symptom-disclaimer": "Not for emergencies. This tool cannot diagnose or recommend medicines. Food and comfort ideas are general, not a personal treatment plan. Do not delay urgent care. Voice recognition availability and privacy depend on your browser.",
        "upload-age-label": "Patient age (years), required",
        "stat-label-records": "Total records", "stat-copy-records": "Documents in your library", "stat-label-labs": "Lab reports", "stat-copy-labs": "Reports with test results", "stat-label-medicines": "Medicines noted", "stat-copy-medicines": "From your records", "stat-label-abha": "ABHA link", "stat-copy-abha": "Mock profile · not connected to ABDM", "profile-shortcut-label": "Set up profile",
        "summary-eyebrow": "PERSONALIZED OVERVIEW", "summary-heading": "Your health, at a glance", "summary-tag": "SIMPLE SUMMARY", "summary-disclaimer": "This is an organizational summary, not a diagnosis. Always review results with a healthcare professional.",
        "records-eyebrow": "YOUR LIBRARY", "records-heading": "Recent health records", "view-timeline-label": "View timeline", "timeline-eyebrow": "YOUR HEALTH HISTORY", "timeline-heading": "Health timeline",
        "profile-eyebrow": "YOUR DETAILS", "profile-heading": "Health profile", "blood-label": "Blood group", "allergies-label": "Allergies", "abha-label": "ABHA ID",
        "insight-eyebrow": "A HELPFUL REMINDER", "insight-heading": "Keep your records together", "insight-copy": "Add prescriptions and test reports to build a timeline you can review before your next appointment.", "insight-upload-label": "Add a record",
        "data-eyebrow": "YOUR DATA", "data-heading": "Portable by design", "data-copy": "Records are structured using FHIR-inspired resource fields. Export a JSON copy anytime.", "export-data-label": "↓   Export health data",
        "footer-about": "MY-SMR · A personal health record organizer", "footer-warning": "Not for emergency use or medical diagnosis",
        "upload-eyebrow": "ADD TO YOUR LIBRARY", "upload-heading": "Upload a health record", "upload-description": "Choose a prescription, lab report, discharge summary, or diagnostic record. We read the image and prefill details that can be identified.", "drop-title": "Drop a file here, or browse", "drop-description": "Images (JPG, PNG) or text files · processed on this device",
        "upload-fine-print": "Image OCR needs internet. Extracted text and a compressed image preview are stored locally on this device. PDFs are not supported. Verify details before saving.",
        "record-type-label": "Record type", "record-language-label": "OCR language", "profile-dialog-eyebrow": "YOUR DETAILS", "profile-dialog-heading": "Health profile", "profile-dialog-description": "These details stay on this device. ABHA below is only a mock link; this app does not connect to ABDM.",
        "name-field-label": "Full name", "dob-field-label": "Date of birth", "blood-field-label": "Blood group", "allergies-field-label": "Allergies", "abha-field-label": "Mock ABHA ID", "optional-label": "optional",
        "review-findings-heading": "What the scan found", "review-eyebrow": "REVIEW EXTRACTED DETAILS",
        "review-description": "Details are prefilled from readable text where possible. Unclear fields stay blank; verify and edit everything against the original document.",
        "review-name-label": "Record title", "review-type-label": "Record type", "review-date-label": "Document date",
        "review-provider-label": "Clinic / provider", "review-diagnosis-label": "Diagnosis / notes",
        "review-medicines-label": "Medicines", "review-tests-label": "Test results",
        "save-record": "Save record", "cancel-review": "Cancel",
        "diet-eyebrow": "GENERAL WELLNESS", "diet-heading": "Everyday food and diet", "diet-intro": "General healthy-eating ideas—not a personal diet prescription.",
        "diet-point-one": "Build meals around vegetables, fruit, whole grains, and a protein source.",
        "diet-point-two": "Choose water regularly and limit highly processed foods and excess salt.",
        "diet-point-three": "Ask a clinician for advice tailored to allergies, pregnancy, or health conditions.",
        "diet-note": "Do not change a prescribed diet based on this guide."
      },
      overview: "Overview", records: "My records", timeline: "Health timeline", profile: "Health profile",
      hello: (name) => `Hello, ${name}!`, intro: "A clearer picture of your health starts here.",
      emptyTitle: "Your health summary will appear here",
      emptyText: "Add a health record to start building a simple overview of your health information.",
      haveRecords: (n) => `You have ${n} health record${n === 1 ? "" : "s"} in your library.`,
      labs: (n) => `${n} lab report${n === 1 ? "" : "s"} ${n === 1 ? "has" : "have"} been added.`,
      meds: (n) => `${n} medicine${n === 1 ? "" : "s"} ${n === 1 ? "was" : "were"} noted in your records.`,
      abnormal: "A result below is marked on the report or falls outside the reference range extracted from it. This does not by itself indicate a condition.",
      normal: "No extracted test result was identified as outside a reference range stated on its report.",
      explainResult: (direction, line) => {
        const meaning = direction === "high" ? "above" : direction === "low" ? "below" : direction === "positive" ? "marked positive (the meaning depends on the specific test)" : "flagged for review";
        return `The report shows: “${line}”. This result is ${meaning} the report's expected range or is specifically flagged. A clinician can explain what it means for you.`;
      },
      noneFound: "No records yet", noneDescription: "Add a prescription, lab report, or other health document to get started.",
      noTimeline: "Your health timeline will appear here after you add a record.",
      unknown: "Unknown", profileDemographics: "Personal health profile",
      disclaimer: "This summary organizes information extracted from your records; it does not diagnose or recommend treatment.",
      findingMedicines: "Medicine details copied from the document",
      findingReports: "Report details copied from the document",
      findingEmpty: "No medicine or report lines were identified. Check the OCR text and original document.",
      latestReport: "Recent report results",
      noReportResults: "No report results have been extracted yet.",
      reportResultsNote: "Copied from the latest saved report; confirm values and units against the original. This is not a diagnosis."
    },
    hi: {
      ui: {
        "nav-workspace": "कार्यस्थल", "nav-overview": "अवलोकन", "nav-records": "मेरे रिकॉर्ड", "nav-timeline": "स्वास्थ्य समयरेखा", "nav-profile": "स्वास्थ्य प्रोफ़ाइल",
        "nav-symptoms": "लक्षण मार्गदर्शिका",
        "privacy-title": "आपका स्वास्थ्य, आपका नियंत्रण", "privacy-copy": "यह प्रोटोटाइप रिकॉर्ड इसी डिवाइस के स्थानीय SQLite डेटाबेस में रखता है।",
        "breadcrumb-overview": "अवलोकन", "welcome-eyebrow": "आपका स्वास्थ्य, एक जगह", "welcome-intro": "अपने स्वास्थ्य की पूरी तस्वीर यहाँ से शुरू करें।", "upload-trigger-label": "स्कैनर खोलें",
        "scanner-eyebrow": "नुस्खा स्कैनर", "scanner-heading": "नुस्खा स्कैन या अपलोड करें", "scanner-description": "कैमरे से तस्वीर लें या गैलरी से चुनें। सहेजने से पहले OCR टेक्स्ट जाँचें।",
        "symptom-eyebrow": "सामान्य स्वास्थ्य जानकारी", "symptom-heading": "अपने लक्षण बताएँ", "symptom-intro": "क्या महसूस हो रहा है और कब शुरू हुआ, लिखें। सरल जानकारी, सामान्य आराम/भोजन के सुझाव और चेतावनी संकेत दिखेंगे। यह टूल बीमारी का निदान या दवा की सलाह नहीं देता।", "symptom-coverage": "साँस, हृदय, पाचन, आँख, कान, त्वचा, मूत्र/प्रजनन स्वास्थ्य, दर्द, नींद और मनोदशा से जुड़ी सामान्य समस्याएँ पहचानी जा सकती हैं। यह पूरी सूची नहीं है।",
        "symptom-age-label": "मरीज़ की उम्र (वर्ष), आवश्यक", "symptom-text-label": "लक्षण और कब शुरू हुए", "voice-input-label": "🎙 लक्षण बोलें", "voice-stop-label": "सुनना बंद करें", "check-symptoms-label": "अगले कदम देखें",
        "symptom-disclaimer": "आपातकाल के लिए नहीं। यह टूल निदान या दवा की सलाह नहीं देता। भोजन और आराम के सुझाव सामान्य हैं, व्यक्तिगत उपचार योजना नहीं। ज़रूरी इलाज में देरी न करें।",
        "upload-age-label": "मरीज़ की उम्र (वर्ष), आवश्यक",
        "stat-label-records": "कुल रिकॉर्ड", "stat-copy-records": "आपकी लाइब्रेरी के दस्तावेज़", "stat-label-labs": "लैब रिपोर्ट", "stat-copy-labs": "जाँच परिणाम वाली रिपोर्ट", "stat-label-medicines": "दर्ज दवाएँ", "stat-copy-medicines": "आपके रिकॉर्ड से", "stat-label-abha": "आभा लिंक", "stat-copy-abha": "डेमो प्रोफ़ाइल · ABDM से जुड़ी नहीं", "profile-shortcut-label": "प्रोफ़ाइल बनाएँ",
        "summary-eyebrow": "आपका व्यक्तिगत सारांश", "summary-heading": "आपका स्वास्थ्य, एक नज़र में", "summary-tag": "सरल सारांश", "summary-disclaimer": "यह जानकारी व्यवस्थित करने वाला सारांश है, बीमारी का पता नहीं। परिणामों की पुष्टि स्वास्थ्य विशेषज्ञ से करें।",
        "records-eyebrow": "आपकी लाइब्रेरी", "records-heading": "हाल के स्वास्थ्य रिकॉर्ड", "view-timeline-label": "समयरेखा देखें", "timeline-eyebrow": "आपका स्वास्थ्य इतिहास", "timeline-heading": "स्वास्थ्य समयरेखा",
        "profile-eyebrow": "आपकी जानकारी", "profile-heading": "स्वास्थ्य प्रोफ़ाइल", "blood-label": "रक्त समूह", "allergies-label": "एलर्जी", "abha-label": "आभा आईडी",
        "insight-eyebrow": "एक उपयोगी सुझाव", "insight-heading": "अपने रिकॉर्ड एक जगह रखें", "insight-copy": "अगली मुलाक़ात से पहले देखने के लिए नुस्खे और जाँच रिपोर्ट जोड़ें।", "insight-upload-label": "रिकॉर्ड जोड़ें",
        "data-eyebrow": "आपका डेटा", "data-heading": "आसानी से साथ ले जाएँ", "data-copy": "रिकॉर्ड FHIR-प्रेरित फ़ील्ड में व्यवस्थित हैं। कभी भी JSON कॉपी डाउनलोड करें।", "export-data-label": "↓   स्वास्थ्य डेटा निर्यात करें",
        "footer-about": "MY-SMR · व्यक्तिगत स्वास्थ्य रिकॉर्ड आयोजक", "footer-warning": "आपातकाल या चिकित्सीय निदान के लिए नहीं",
        "upload-eyebrow": "अपनी लाइब्रेरी में जोड़ें", "upload-heading": "स्वास्थ्य रिकॉर्ड अपलोड करें", "upload-description": "नुस्खा, लैब रिपोर्ट, डिस्चार्ज सारांश या जाँच रिकॉर्ड चुनें। तस्वीर पढ़कर पहचानी गई जानकारी के फ़ील्ड भरे जाएँगे।", "drop-title": "फ़ाइल यहाँ छोड़ें या ब्राउज़ करें", "drop-description": "तस्वीरें (JPG, PNG) या टेक्स्ट फ़ाइल · इसी डिवाइस पर प्रोसेस",
        "upload-fine-print": "तस्वीर OCR के लिए इंटरनेट चाहिए। निकाला गया टेक्स्ट और संक्षिप्त तस्वीर पूर्वावलोकन इसी डिवाइस पर सहेजे जाते हैं। PDF समर्थित नहीं है। सहेजने से पहले पुष्टि करें।",
        "record-type-label": "रिकॉर्ड का प्रकार", "record-language-label": "OCR की भाषा", "profile-dialog-eyebrow": "आपकी जानकारी", "profile-dialog-heading": "स्वास्थ्य प्रोफ़ाइल", "profile-dialog-description": "यह जानकारी इसी डिवाइस पर रहती है। नीचे दी गई आभा आईडी डेमो है; यह ऐप ABDM से नहीं जुड़ता।",
        "name-field-label": "पूरा नाम", "dob-field-label": "जन्मतिथि", "blood-field-label": "रक्त समूह", "allergies-field-label": "एलर्जी", "abha-field-label": "डेमो आभा आईडी", "optional-label": "वैकल्पिक",
        "local-badge-label": "स्थानीय डेटाबेस",
        "review-findings-heading": "स्कैन में मिली जानकारी", "review-eyebrow": "निकाली गई जानकारी जाँचें",
        "review-description": "जहाँ पाठ पढ़ा जा सका है वहाँ जानकारी भरी गई है। अस्पष्ट फ़ील्ड खाली हैं। मूल दस्तावेज़ से जाँचें और संपादित करें।",
        "review-name-label": "रिकॉर्ड का शीर्षक", "review-type-label": "रिकॉर्ड का प्रकार", "review-date-label": "दस्तावेज़ की तारीख",
        "review-provider-label": "क्लिनिक / प्रदाता", "review-diagnosis-label": "निदान / नोट्स",
        "review-medicines-label": "दवाएँ", "review-tests-label": "जाँच परिणाम",
        "save-record": "रिकॉर्ड सहेजें", "cancel-review": "रद्द करें",
        "diet-eyebrow": "सामान्य स्वास्थ्य", "diet-heading": "रोज़ का भोजन और आहार", "diet-intro": "सामान्य स्वस्थ भोजन सुझाव—व्यक्तिगत आहार योजना नहीं।",
        "diet-point-one": "भोजन में सब्ज़ियाँ, फल, साबुत अनाज और प्रोटीन का स्रोत शामिल करें।",
        "diet-point-two": "नियमित रूप से पानी पिएँ और अत्यधिक प्रसंस्कृत भोजन तथा ज़्यादा नमक सीमित करें।",
        "diet-point-three": "एलर्जी, गर्भावस्था या स्वास्थ्य स्थिति के अनुसार सलाह के लिए चिकित्सक से पूछें।",
        "diet-note": "इस मार्गदर्शिका के आधार पर डॉक्टर द्वारा बताए आहार में बदलाव न करें।"
      },
      overview: "अवलोकन", records: "मेरे रिकॉर्ड", timeline: "स्वास्थ्य समयरेखा", profile: "स्वास्थ्य प्रोफ़ाइल",
      hello: (name) => `सुप्रभात, ${name}`, intro: "आपके स्वास्थ्य की पूरी तस्वीर अब एक जगह।",
      emptyTitle: "आपका स्वास्थ्य सारांश यहाँ दिखाई देगा",
      emptyText: "स्वास्थ्य की सरल जानकारी पाने के लिए अपना रिकॉर्ड जोड़ें।",
      haveRecords: (n) => `आपकी लाइब्रेरी में ${n} स्वास्थ्य रिकॉर्ड${n === 1 ? " है" : " हैं"}।`,
      labs: (n) => `${n} लैब रिपोर्ट${n === 1 ? " जोड़ी गई है" : " जोड़ी गई हैं"}।`,
      meds: (n) => `रिकॉर्ड में ${n} दवा${n === 1 ? " दर्ज है" : "एँ दर्ज हैं"}।`,
      abnormal: "नीचे दिया गया परिणाम रिपोर्ट में चिह्नित है या निकाली गई सामान्य सीमा से बाहर है। इससे अपने आप किसी बीमारी का पता नहीं चलता।",
      normal: "निकाले गए किसी जाँच परिणाम को रिपोर्ट की सामान्य सीमा से बाहर नहीं पाया गया।",
      explainResult: (direction, line) => {
        const meaning = direction === "high" ? "रिपोर्ट की सीमा से ऊपर" : direction === "low" ? "रिपोर्ट की सीमा से नीचे" : direction === "positive" ? "पॉज़िटिव चिह्नित (इसका अर्थ जाँच पर निर्भर करता है)" : "समीक्षा के लिए चिह्नित";
        return `रिपोर्ट में दिया है: “${line}”। यह परिणाम ${meaning} है। इसका आपके लिए क्या अर्थ है, यह स्वास्थ्य विशेषज्ञ बता सकते हैं।`;
      },
      noneFound: "अभी कोई रिकॉर्ड नहीं", noneDescription: "शुरू करने के लिए नुस्खा, लैब रिपोर्ट या स्वास्थ्य दस्तावेज़ जोड़ें।",
      noTimeline: "रिकॉर्ड जोड़ने के बाद आपकी स्वास्थ्य समयरेखा यहाँ दिखाई देगी।",
      unknown: "अज्ञात", profileDemographics: "व्यक्तिगत स्वास्थ्य प्रोफ़ाइल",
      disclaimer: "यह सारांश रिकॉर्ड की जानकारी व्यवस्थित करता है; यह बीमारी का पता नहीं लगाता और इलाज की सलाह नहीं देता।",
      findingMedicines: "दस्तावेज़ से ली गई दवा की जानकारी",
      findingReports: "दस्तावेज़ से लिए गए रिपोर्ट विवरण",
      findingEmpty: "दवा या जाँच की पंक्तियाँ नहीं मिलीं। OCR टेक्स्ट और मूल दस्तावेज़ जाँचें।",
      latestReport: "हाल की रिपोर्ट के परिणाम",
      noReportResults: "अभी तक रिपोर्ट के परिणाम नहीं निकाले गए हैं।",
      reportResultsNote: "नवीनतम सहेजी गई रिपोर्ट से लिया गया है; मान और इकाइयाँ मूल रिपोर्ट से जाँचें। यह निदान नहीं है।"
    }
  };
  translations.ta = {
    ...translations.en,
    ui: {
      ...translations.en.ui,
      "nav-overview": "கண்ணோட்டம்", "nav-records": "எனது பதிவுகள்", "nav-timeline": "ஆரோக்கிய காலவரிசை", "nav-profile": "ஆரோக்கிய சுயவிவரம்",
      "nav-symptoms": "அறிகுறி வழிகாட்டி", "privacy-title": "உங்கள் ஆரோக்கியம், உங்கள் கட்டுப்பாடு",
      "privacy-copy": "இந்த முன்மாதிரி பதிவுகளை இந்தச் சாதனத்தின் உள்ளூர் SQLite தரவுத்தளத்தில் சேமிக்கிறது.",
      "local-badge-label": "உள்ளூர் தரவுத்தளம்",
      "breadcrumb-overview": "கண்ணோட்டம்", "welcome-eyebrow": "உங்கள் ஆரோக்கியம், ஒரே இடத்தில்",
      "welcome-intro": "உங்கள் ஆரோக்கியத்தைத் தெளிவாகப் புரிந்துகொள்வது இங்கிருந்து தொடங்குகிறது.",
      "upload-trigger-label": "ஸ்கேனரைத் திற",
      "scanner-eyebrow": "மருந்துச் சீட்டு ஸ்கேனர்", "scanner-heading": "மருந்துச் சீட்டை ஸ்கேன் செய்யவும் அல்லது பதிவேற்றவும்",
      "scanner-description": "படம் எடுத்து அல்லது கேலரியில் இருந்து தேர்ந்தெடுக்கவும். சேமிப்பதற்கு முன் OCR உரையைச் சரிபார்க்கவும்.",
      "symptom-eyebrow": "பொது சுகாதாரத் தகவல்", "symptom-heading": "உங்கள் அறிகுறிகளை விவரிக்கவும்",
      "symptom-intro": "என்ன அறிகுறிகள் உள்ளன, எப்போது தொடங்கின என்பதைக் குறிப்பிடவும். எளிய தகவல், பொதுவான ஓய்வு/உணவு யோசனைகள், எச்சரிக்கை அறிகுறிகள் காட்டப்படும். இது நோயறிதலோ மருந்துப் பரிந்துரையோ செய்யாது.", "symptom-coverage": "சுவாசம், இதயம், செரிமானம், கண், காது, தோல், சிறுநீர்/இனப்பெருக்க நலம், வலி, தூக்கம், மனநிலை தொடர்பான பொதுவான அறிகுறிகளை இது அடையாளம் காணும். இது முழுமையான பட்டியல் அல்ல.",
      "symptom-age-label": "நோயாளியின் வயது (ஆண்டுகள்), கட்டாயம்", "symptom-text-label": "அறிகுறிகள் மற்றும் தொடங்கிய நேரம்",
      "check-symptoms-label": "அடுத்த படிகளைப் பார்க்கவும்", "upload-age-label": "நோயாளியின் வயது (ஆண்டுகள்), கட்டாயம்",
      "voice-input-label": "🎙 அறிகுறிகளைச் சொல்லுங்கள்", "voice-stop-label": "கேட்பதை நிறுத்து",
      "symptom-disclaimer": "அவசரநிலைகளுக்கானது அல்ல. இது நோயறிதல் அல்லது மருந்துப் பரிந்துரை செய்யாது. உணவு/ஓய்வு யோசனைகள் பொதுவானவை; தனிப்பட்ட சிகிச்சை அல்ல. அவசர சிகிச்சையைத் தாமதிக்க வேண்டாம்.",
      "stat-label-records": "மொத்தப் பதிவுகள்", "stat-label-labs": "ஆய்வக அறிக்கைகள்", "stat-label-medicines": "குறிப்பிட்ட மருந்துகள்",
      "stat-copy-records": "உங்கள் நூலகத்தில் உள்ள ஆவணங்கள்", "stat-copy-labs": "பரிசோதனை முடிவுகள் உள்ள அறிக்கைகள்",
      "stat-copy-medicines": "உங்கள் பதிவுகளிலிருந்து", "stat-label-abha": "ABHA இணைப்பு",
      "stat-copy-abha": "முன்மாதிரி சுயவிவரம் · ABDM-உடன் இணைக்கப்படவில்லை", "profile-shortcut-label": "சுயவிவரத்தை அமை",
      "summary-eyebrow": "உங்கள் தனிப்பட்ட கண்ணோட்டம்", "summary-heading": "உங்கள் ஆரோக்கியம், ஒரு பார்வையில்",
      "summary-disclaimer": "இது தகவலை ஒழுங்குபடுத்தும் சுருக்கம்; நோயறிதல் அல்ல. முடிவுகளை மருத்துவ நிபுணரிடம் உறுதிப்படுத்தவும்.",
      "summary-tag": "எளிய சுருக்கம்", "view-timeline-label": "காலவரிசையைப் பார்க்க",
      "records-heading": "சமீபத்திய சுகாதாரப் பதிவுகள்",
      "timeline-eyebrow": "உங்கள் சுகாதார வரலாறு", "timeline-heading": "ஆரோக்கிய காலவரிசை",
      "profile-eyebrow": "உங்கள் விவரங்கள்", "profile-heading": "ஆரோக்கிய சுயவிவரம்",
      "blood-label": "இரத்த வகை", "allergies-label": "ஒவ்வாமைகள்",
      "abha-label": "ABHA ID", "data-eyebrow": "உங்கள் தரவு", "data-heading": "எடுத்துச் செல்லக்கூடியது",
      "data-copy": "பதிவுகள் FHIR-ஐ முன்மாதிரியாகக் கொண்ட புலங்களில் ஒழுங்குபடுத்தப்பட்டுள்ளன. JSON நகலை ஏற்றுமதி செய்யவும்.",
      "export-data-label": "↓ சுகாதாரத் தரவை ஏற்றுமதி செய்", "footer-about": "MY-SMR · தனிப்பட்ட சுகாதாரப் பதிவு அமைப்பாளர்",
      "footer-warning": "அவசரப் பயன்பாடு அல்லது மருத்துவ நோயறிதலுக்கானது அல்ல",
      "insight-eyebrow": "பயனுள்ள நினைவூட்டல்", "insight-heading": "உங்கள் பதிவுகளை ஒன்றாக வைத்திருங்கள்",
      "insight-copy": "அடுத்த மருத்துவச் சந்திப்பிற்கு முன் பார்க்க மருந்துச் சீட்டுகள் மற்றும் பரிசோதனை அறிக்கைகளைச் சேர்க்கவும்.",
      "insight-upload-label": "பதிவைச் சேர்", "diet-eyebrow": "பொது நலவாழ்வு", "diet-heading": "அன்றாட உணவு மற்றும் உணவுமுறை",
      "upload-eyebrow": "உங்கள் நூலகத்தில் சேர்க்கவும்", "upload-heading": "சுகாதாரப் பதிவைப் பதிவேற்றவும்",
      "upload-description": "மருந்துச் சீட்டு, ஆய்வக அறிக்கை, வெளியேற்றச் சுருக்கம் அல்லது பரிசோதனைப் பதிவைத் தேர்ந்தெடுக்கவும். படத்தை வாசித்து அடையாளம் காணக்கூடிய விவரங்களை நிரப்புவோம்.",
      "upload-fine-print": "பட OCR-க்கு இணையம் தேவை. எடுத்த உரையும் சுருக்கப்பட்ட பட முன்னோட்டமும் இந்தச் சாதனத்தில் சேமிக்கப்படும். PDF ஆதரவு இல்லை. சேமிப்பதற்கு முன் சரிபார்க்கவும்.",
      "drop-title": "கோப்பை இங்கே விடவும் அல்லது உலாவவும்", "drop-description": "படங்கள் (JPG, PNG) அல்லது உரைக் கோப்பு · இந்தச் சாதனத்தில் செயலாக்கப்படும்",
      "record-type-label": "பதிவு வகை", "record-language-label": "ஸ்கேன் உரையின் மொழி",
      "profile-dialog-eyebrow": "உங்கள் விவரங்கள்", "profile-dialog-heading": "ஆரோக்கிய சுயவிவரம்",
      "profile-dialog-description": "இந்த விவரங்கள் இந்தச் சாதனத்தில் இருக்கும். ABHA புலம் முன்மாதிரி மட்டுமே; ABDM இணைப்பு இல்லை.",
      "name-field-label": "முழுப் பெயர்", "dob-field-label": "பிறந்த தேதி", "blood-field-label": "இரத்த வகை",
      "allergies-field-label": "ஒவ்வாமைகள்", "abha-field-label": "முன்மாதிரி ABHA ID", "optional-label": "விருப்பமானது",
      "review-findings-heading": "ஸ்கேனில் கண்டவை",
      "review-eyebrow": "எடுக்கப்பட்ட விவரங்களைச் சரிபார்க்கவும்",
      "review-description": "படிக்கக்கூடிய உரையிலிருந்து விவரங்கள் நிரப்பப்பட்டுள்ளன. தெளிவில்லாத புலங்கள் காலியாக விடப்படும். அசல் ஆவணத்துடன் சரிபார்த்து திருத்தவும்.",
      "review-name-label": "பதிவின் தலைப்பு", "review-type-label": "பதிவு வகை", "review-date-label": "ஆவண தேதி",
      "review-provider-label": "மருத்துவமனை / வழங்குநர்", "review-diagnosis-label": "நோயறிதல் / குறிப்புகள்",
      "review-medicines-label": "மருந்துகள்", "review-tests-label": "பரிசோதனை முடிவுகள்",
      "save-record": "பதிவைச் சேமி", "cancel-review": "ரத்துசெய்",
      "diet-intro": "பொதுவான ஆரோக்கியமான உணவு யோசனைகள்—தனிப்பட்ட உணவுத் திட்டம் அல்ல.",
      "diet-point-one": "காய்கறிகள், பழங்கள், முழுத் தானியங்கள் மற்றும் புரத உணவுகளைச் சேர்க்கவும்.",
      "diet-point-two": "போதுமான தண்ணீர் குடித்து, அதிகமாக பதப்படுத்திய உணவு மற்றும் உப்பைக் குறைக்கவும்.",
      "diet-point-three": "ஒவ்வாமை, கர்ப்பம் அல்லது உடல்நலப் பிரச்சினைகளுக்கான ஆலோசனையை மருத்துவரிடம் பெறவும்.",
      "diet-note": "இந்த வழிகாட்டியின் அடிப்படையில் மருத்துவர் கூறிய உணவுமுறையை மாற்ற வேண்டாம்."
    },
    overview: "கண்ணோட்டம்", records: "எனது பதிவுகள்", timeline: "ஆரோக்கிய காலவரிசை", profile: "ஆரோக்கிய சுயவிவரம்",
    hello: (name) => `வணக்கம், ${name}`, intro: "உங்கள் ஆரோக்கியத்தைத் தெளிவாகப் புரிந்துகொள்வது இங்கிருந்து தொடங்குகிறது.",
    emptyTitle: "உங்கள் ஆரோக்கியச் சுருக்கம் இங்கே தோன்றும்", emptyText: "தொடங்க ஒரு சுகாதாரப் பதிவைச் சேர்க்கவும்.",
    haveRecords: (n) => `உங்கள் நூலகத்தில் ${n} சுகாதாரப் பதிவுகள் உள்ளன.`,
    labs: (n) => `${n} ஆய்வக அறிக்கைகள் சேர்க்கப்பட்டுள்ளன.`, meds: (n) => `${n} மருந்துகள் பதிவுகளில் உள்ளன.`,
    abnormal: "அறிக்கையில் குறிக்கப்பட்ட அல்லது அறிக்கையின் குறிப்பு வரம்புக்கு வெளியே உள்ள முடிவுகள் உள்ளன. இது மட்டும் நோயைக் குறிக்காது.",
    normal: "அறிக்கையின் குறிப்பு வரம்புக்கு வெளியே உள்ள முடிவு கண்டறியப்படவில்லை.",
    explainResult: (_direction, line) => `அறிக்கையில்: “${line}”. இதன் பொருளை மருத்துவ நிபுணரிடம் கேளுங்கள்.`,
    noneFound: "பதிவுகள் இல்லை", noneDescription: "தொடங்க மருந்துச் சீட்டு அல்லது அறிக்கையைச் சேர்க்கவும்.",
    noTimeline: "பதிவு சேர்த்த பிறகு உங்கள் காலவரிசை இங்கே தோன்றும்.",
    unknown: "தெரியவில்லை", profileDemographics: "தனிப்பட்ட சுகாதார சுயவிவரம்",
    disclaimer: "இந்தச் சுருக்கம் பதிவுகளை ஒழுங்குபடுத்துகிறது; நோயறிதலோ சிகிச்சை பரிந்துரையோ அல்ல."
  };
  translations.te = {
    ...translations.en,
    ui: {
      ...translations.en.ui,
      "nav-overview": "సారాంశం", "nav-records": "నా రికార్డులు", "nav-timeline": "ఆరోగ్య కాలక్రమం", "nav-profile": "ఆరోగ్య ప్రొఫైల్",
      "nav-symptoms": "లక్షణాల మార్గదర్శి", "privacy-title": "మీ ఆరోగ్యం, మీ నియంత్రణ",
      "privacy-copy": "ఈ నమూనా రికార్డులను ఈ పరికరంలోని స్థానిక SQLite డేటాబేస్‌లో నిల్వ చేస్తుంది.",
      "local-badge-label": "స్థానిక డేటాబేస్",
      "breadcrumb-overview": "సారాంశం", "welcome-eyebrow": "మీ ఆరోగ్యం, ఒకేచోట",
      "welcome-intro": "మీ ఆరోగ్యంపై స్పష్టమైన అవగాహన ఇక్కడ ప్రారంభమవుతుంది.",
      "upload-trigger-label": "స్కానర్ తెరవండి",
      "scanner-eyebrow": "ప్రిస్క్రిప్షన్ స్కానర్", "scanner-heading": "ప్రిస్క్రిప్షన్‌ను స్కాన్ చేయండి లేదా అప్‌లోడ్ చేయండి",
      "scanner-description": "కెమెరాతో ఫోటో తీయండి లేదా గ్యాలరీ నుంచి ఎంచుకోండి. భద్రపరచే ముందు OCR వచనాన్ని తనిఖీ చేయండి.",
      "symptom-eyebrow": "సాధారణ ఆరోగ్య సమాచారం", "symptom-heading": "మీ లక్షణాలను వివరించండి",
      "symptom-intro": "ఏమి అనిపిస్తోంది, ఎప్పుడు మొదలైందో వివరించండి. సులభమైన సమాచారం, సాధారణ విశ్రాంతి/ఆహార సూచనలు, హెచ్చరిక లక్షణాలు చూపిస్తాం. ఇది రోగనిర్ధారణ లేదా మందుల సిఫార్సు చేయదు.", "symptom-coverage": "శ్వాస, గుండె, జీర్ణక్రియ, కళ్ళు, చెవులు, చర్మం, మూత్ర/ప్రజనన ఆరోగ్యం, నొప్పి, నిద్ర, మానసిక స్థితికి సంబంధించిన సాధారణ సమస్యలను గుర్తిస్తుంది. ఇది పూర్తి జాబితా కాదు.",
      "symptom-age-label": "రోగి వయస్సు (సంవత్సరాలు), తప్పనిసరి", "symptom-text-label": "లక్షణాలు మరియు ప్రారంభమైన సమయం",
      "check-symptoms-label": "తదుపరి చర్యలను చూడండి", "upload-age-label": "రోగి వయస్సు (సంవత్సరాలు), తప్పనిసరి",
      "voice-input-label": "🎙 లక్షణాలను మాట్లాడండి", "voice-stop-label": "వినడం ఆపండి",
      "symptom-disclaimer": "అత్యవసర పరిస్థితుల కోసం కాదు. ఇది రోగనిర్ధారణ లేదా మందుల సలహా ఇవ్వదు. ఆహారం/విశ్రాంతి సూచనలు సాధారణమైనవి; వ్యక్తిగత చికిత్స ప్రణాళిక కాదు. అత్యవసర చికిత్సను ఆలస్యం చేయవద్దు.",
      "stat-label-records": "మొత్తం రికార్డులు", "stat-label-labs": "ల్యాబ్ నివేదికలు", "stat-label-medicines": "నమోదైన మందులు",
      "stat-copy-records": "మీ లైబ్రరీలోని పత్రాలు", "stat-copy-labs": "పరీక్ష ఫలితాలు ఉన్న నివేదికలు",
      "stat-copy-medicines": "మీ రికార్డుల నుంచి", "stat-label-abha": "ABHA లింక్",
      "stat-copy-abha": "నమూనా ప్రొఫైల్ · ABDM‌కు అనుసంధానం కాలేదు", "profile-shortcut-label": "ప్రొఫైల్ ఏర్పాటు",
      "summary-eyebrow": "మీ వ్యక్తిగత సారాంశం", "summary-heading": "మీ ఆరోగ్యం, ఒక చూపులో",
      "summary-disclaimer": "ఇది సమాచారాన్ని క్రమబద్ధం చేసే సారాంశం మాత్రమే; రోగనిర్ధారణ కాదు. ఫలితాలను వైద్య నిపుణులతో నిర్ధారించండి.",
      "summary-tag": "సరళమైన సారాంశం", "view-timeline-label": "కాలక్రమాన్ని చూడండి",
      "records-eyebrow": "మీ లైబ్రరీ", "records-heading": "ఇటీవలి ఆరోగ్య రికార్డులు",
      "timeline-eyebrow": "మీ ఆరోగ్య చరిత్ర", "timeline-heading": "ఆరోగ్య కాలక్రమం",
      "profile-eyebrow": "మీ వివరాలు", "profile-heading": "ఆరోగ్య ప్రొఫైల్",
      "blood-label": "రక్త వర్గం", "allergies-label": "అలర్జీలు",
      "abha-label": "ABHA ID", "data-eyebrow": "మీ డేటా", "data-heading": "సులభంగా తీసుకెళ్లవచ్చు",
      "data-copy": "రికార్డులు FHIR ఆధారిత ఫీల్డ్‌లలో క్రమబద్ధం చేయబడ్డాయి. JSON కాపీని ఎగుమతి చేయండి.",
      "export-data-label": "↓ ఆరోగ్య డేటాను ఎగుమతి చేయండి", "footer-about": "MY-SMR · వ్యక్తిగత ఆరోగ్య రికార్డు నిర్వాహకం",
      "footer-warning": "అత్యవసర వినియోగం లేదా వైద్య నిర్ధారణ కోసం కాదు",
      "insight-eyebrow": "ఉపయోగకరమైన గుర్తుచూపు", "insight-heading": "మీ రికార్డులను ఒకేచోట ఉంచండి",
      "insight-copy": "తదుపరి వైద్య సందర్శనకు ముందు చూడటానికి ప్రిస్క్రిప్షన్లు, పరీక్ష నివేదికలను జోడించండి.",
      "insight-upload-label": "రికార్డు జోడించండి", "diet-eyebrow": "సాధారణ ఆరోగ్యం", "diet-heading": "రోజువారీ ఆహారం మరియు పోషణ",
      "upload-eyebrow": "మీ లైబ్రరీకి జోడించండి", "upload-heading": "ఆరోగ్య రికార్డును అప్‌లోడ్ చేయండి",
      "upload-description": "ప్రిస్క్రిప్షన్, ల్యాబ్ నివేదిక, డిశ్చార్జ్ సారాంశం లేదా పరీక్ష రికార్డును ఎంచుకోండి. చిత్రాన్ని చదివి గుర్తించగల వివరాలను నింపుతాం.",
      "upload-fine-print": "చిత్ర OCRకు ఇంటర్నెట్ అవసరం. తీసిన వచనం, కుదించిన చిత్ర ప్రివ్యూ ఈ పరికరంలోనే భద్రపరచబడతాయి. PDFకు మద్దతు లేదు. భద్రపరచే ముందు నిర్ధారించండి.",
      "drop-title": "ఫైల్‌ను ఇక్కడ వదలండి లేదా బ్రౌజ్ చేయండి", "drop-description": "చిత్రాలు (JPG, PNG) లేదా టెక్స్ట్ ఫైల్ · ఈ పరికరంలోనే ప్రాసెస్ అవుతుంది",
      "record-type-label": "రికార్డు రకం", "record-language-label": "స్కాన్ వచన భాష",
      "profile-dialog-eyebrow": "మీ వివరాలు", "profile-dialog-heading": "ఆరోగ్య ప్రొఫైల్",
      "profile-dialog-description": "ఈ వివరాలు ఈ పరికరంలోనే ఉంటాయి. ABHA ఫీల్డ్ నమూనా మాత్రమే; ABDM అనుసంధానం లేదు.",
      "name-field-label": "పూర్తి పేరు", "dob-field-label": "పుట్టిన తేదీ", "blood-field-label": "రక్త వర్గం",
      "allergies-field-label": "అలర్జీలు", "abha-field-label": "నమూనా ABHA ID", "optional-label": "ఐచ్ఛికం",
      "review-findings-heading": "స్కాన్‌లో గుర్తించినవి",
      "review-eyebrow": "తీసిన వివరాలను సమీక్షించండి",
      "review-description": "చదవగలిగిన వచనం నుంచి వివరాలు నింపబడ్డాయి. స్పష్టంగా తెలియని ఫీల్డ్‌లు ఖాళీగా ఉంటాయి. అసలు పత్రంతో సరిపోల్చి సవరించండి.",
      "review-name-label": "రికార్డు శీర్షిక", "review-type-label": "రికార్డు రకం", "review-date-label": "పత్రం తేదీ",
      "review-provider-label": "క్లినిక్ / వైద్యుడు", "review-diagnosis-label": "నిర్ధారణ / గమనికలు",
      "review-medicines-label": "మందులు", "review-tests-label": "పరీక్ష ఫలితాలు",
      "save-record": "రికార్డును భద్రపరచండి", "cancel-review": "రద్దు చేయండి",
      "diet-intro": "సాధారణ ఆరోగ్యకరమైన ఆహార సూచనలు—వ్యక్తిగత ఆహార ప్రణాళిక కాదు.",
      "diet-point-one": "కూరగాయలు, పండ్లు, తృణధాన్యాలు, ప్రోటీన్ ఉన్న ఆహారాన్ని చేర్చండి.",
      "diet-point-two": "తగినంత నీరు తాగండి; అధికంగా ప్రాసెస్ చేసిన ఆహారం, ఉప్పును తగ్గించండి.",
      "diet-point-three": "అలర్జీలు, గర్భధారణ లేదా ఆరోగ్య సమస్యలకు వైద్యుడి సలహా తీసుకోండి.",
      "diet-note": "ఈ మార్గదర్శి ఆధారంగా వైద్యుడు సూచించిన ఆహారాన్ని మార్చవద్దు."
    },
    overview: "సారాంశం", records: "నా రికార్డులు", timeline: "ఆరోగ్య కాలక్రమం", profile: "ఆరోగ్య ప్రొఫైల్",
    hello: (name) => `నమస్కారం, ${name}`, intro: "మీ ఆరోగ్యంపై స్పష్టమైన అవగాహన ఇక్కడ ప్రారంభమవుతుంది.",
    emptyTitle: "మీ ఆరోగ్య సారాంశం ఇక్కడ కనిపిస్తుంది", emptyText: "ప్రారంభించడానికి ఆరోగ్య రికార్డును జోడించండి.",
    haveRecords: (n) => `మీ లైబ్రరీలో ${n} ఆరోగ్య రికార్డులు ఉన్నాయి.`,
    labs: (n) => `${n} ల్యాబ్ నివేదికలు జోడించబడ్డాయి.`, meds: (n) => `${n} మందులు రికార్డుల్లో ఉన్నాయి.`,
    abnormal: "నివేదికలో గుర్తించిన లేదా సూచించిన పరిధికి వెలుపల ఉన్న ఫలితం ఉంది. దీని ఒక్కటితో వ్యాధి నిర్ధారణ కాదు.",
    normal: "నివేదికలోని సూచించిన పరిధికి వెలుపల ఉన్న ఫలితం గుర్తించబడలేదు.",
    explainResult: (_direction, line) => `నివేదికలో: “${line}”. దాని అర్థాన్ని వైద్య నిపుణులను అడగండి.`,
    noneFound: "రికార్డులు లేవు", noneDescription: "ప్రారంభించడానికి ప్రిస్క్రిప్షన్ లేదా నివేదికను జోడించండి.",
    noTimeline: "రికార్డును జోడించిన తర్వాత ఆరోగ్య కాలక్రమం ఇక్కడ కనిపిస్తుంది.",
    unknown: "తెలియదు", profileDemographics: "వ్యక్తిగత ఆరోగ్య ప్రొఫైల్",
    disclaimer: "ఈ సారాంశం రికార్డులను క్రమబద్ధం చేస్తుంది; రోగనిర్ధారణ లేదా చికిత్స సలహా కాదు."
  };
  translations.ta.findingMedicines = "ஆவணத்திலிருந்து எடுத்த மருந்து விவரங்கள்";
  translations.ta.findingReports = "ஆவணத்திலிருந்து எடுத்த அறிக்கை விவரங்கள்";
  translations.ta.findingEmpty = "மருந்து அல்லது அறிக்கை வரிகள் கண்டறியப்படவில்லை. OCR உரையையும் அசல் ஆவணத்தையும் சரிபார்க்கவும்.";
  translations.ta.latestReport = "சமீபத்திய அறிக்கை முடிவுகள்";
  translations.ta.noReportResults = "அறிக்கை முடிவுகள் இன்னும் எடுக்கப்படவில்லை.";
  translations.ta.reportResultsNote = "சமீபத்தில் சேமிக்கப்பட்ட அறிக்கையிலிருந்து எடுக்கப்பட்டது; மதிப்புகள் மற்றும் அலகுகளை அசல் அறிக்கையுடன் சரிபார்க்கவும். இது நோயறிதல் அல்ல.";
  translations.ta.ui["review-findings-heading"] = "ஸ்கேனில் கண்டவை";
  translations.te.findingMedicines = "పత్రం నుంచి తీసిన మందుల వివరాలు";
  translations.te.findingReports = "పత్రం నుంచి తీసిన నివేదిక వివరాలు";
  translations.te.findingEmpty = "మందులు లేదా నివేదిక పంక్తులు గుర్తించబడలేదు. OCR వచనం, అసలు పత్రాన్ని తనిఖీ చేయండి.";
  translations.te.latestReport = "ఇటీవలి నివేదిక ఫలితాలు";
  translations.te.noReportResults = "ఇంకా నివేదిక ఫలితాలు సేకరించబడలేదు.";
  translations.te.reportResultsNote = "ఇటీవల సేవ్ చేసిన నివేదిక నుంచి తీసినవి; విలువలు, యూనిట్లను అసలు నివేదికతో సరిపోల్చండి. ఇది రోగనిర్ధారణ కాదు.";
  translations.te.ui["review-findings-heading"] = "స్కాన్‌లో గుర్తించినవి";
  translations.ta.ui["diet-eyebrow"] = "பொது நலவாழ்வு";
  translations.te.ui["diet-eyebrow"] = "సాధారణ ఆరోగ్యం";
  const typeLabels = {
    prescription: { en: "Prescription", hi: "नुस्खा", ta: "மருந்துச் சீட்டு", te: "ప్రిస్క్రిప్షన్" },
    lab: { en: "Lab report", hi: "लैब रिपोर्ट", ta: "ஆய்வக அறிக்கை", te: "ల్యాబ్ నివేదిక" },
    discharge: { en: "Discharge summary", hi: "डिस्चार्ज सारांश", ta: "வெளியேற்றச் சுருக்கம்", te: "డిశ్చార్జ్ సారాంశం" },
    diagnostic: { en: "Diagnostic record", hi: "जाँच रिकॉर्ड", ta: "பரிசோதனைப் பதிவு", te: "పరీక్ష రికార్డు" },
    other: { en: "Other record", hi: "अन्य रिकॉर्ड", ta: "பிற பதிவு", te: "ఇతర రికార్డు" }
  };
  translations.ta.latestReport = "சமீபத்திய அறிக்கை முடிவுகள்";
  translations.ta.noReportResults = "அறிக்கை முடிவுகள் இன்னும் எடுக்கப்படவில்லை.";
  translations.ta.reportResultsNote = "சமீபத்தில் சேமிக்கப்பட்ட அறிக்கையிலிருந்து எடுக்கப்பட்டது; மதிப்புகள் மற்றும் அலகுகளை அசல் அறிக்கையுடன் சரிபார்க்கவும். இது நோயறிதல் அல்ல.";
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    fileInput: $("#file-input"), cameraInput: $("#camera-input"), uploadDialog: $("#upload-dialog"), recordDialog: $("#record-dialog"),
    profileDialog: $("#profile-dialog"), toast: $("#toast"), uploadStatus: $("#upload-status")
  };
  let state;
  let backendReady = false;
  let language = ["en", "te", "ta", "hi"].includes(localStorage.getItem("my-smr-language"))
    ? localStorage.getItem("my-smr-language")
    : "en";
  let toastTimer;
  let recordSearch = "";
  let activeRecognition = null;
  const localized = {
    en: { notAdded: "Not added", notLinked: "Not linked", mockLinked: "Mock linked", search: "Search", toolHelp: "Need help with symptoms?", symptomLink: "Open symptom guide →", searchPlaceholder: "Search your records, medicines, or test results", symptomAgePlaceholder: "Enter age first", symptomPlaceholder: "For example: back pain, rash, dizziness, or low mood", uploadAgePlaceholder: "Enter age before scanning", scanMedicineNote: "The name and instructions are copied from the document. mg is a mass unit; mL is liquid volume. Neither tells whether a medicine or dose is right for you. Confirm the name, strength, and schedule with the original prescription or a pharmacist. This app cannot explain a medicine's purpose or advise how to take it.", scanReportNote: "Report lines are shown as extracted. They are not a diagnosis or clinical interpretation.", editProfile: "Edit health profile" },
    hi: { notAdded: "नहीं जोड़ा", notLinked: "लिंक नहीं है", mockLinked: "डेमो लिंक", search: "खोजें", toolHelp: "लक्षणों में मदद चाहिए?", symptomLink: "लक्षण मार्गदर्शिका खोलें →", searchPlaceholder: "रिकॉर्ड, दवाएँ या जाँच परिणाम खोजें", symptomAgePlaceholder: "पहले उम्र दर्ज करें", symptomPlaceholder: "उदाहरण: कमर दर्द, दाने, चक्कर या उदासी", uploadAgePlaceholder: "स्कैन करने से पहले उम्र दर्ज करें", scanMedicineNote: "दवा का नाम और निर्देश दस्तावेज़ से लिए गए हैं। mg वज़न की और mL तरल आयतन की इकाई है; इससे दवा या खुराक की उपयुक्तता पता नहीं चलती। नाम, शक्ति और समय-सारणी की पुष्टि मूल पर्चे या फार्मासिस्ट से करें। यह ऐप दवा का उद्देश्य या लेने की सलाह नहीं देता।", scanReportNote: "रिपोर्ट की पंक्तियाँ OCR से ली गई हैं। यह निदान या चिकित्सकीय व्याख्या नहीं है।", editProfile: "स्वास्थ्य प्रोफ़ाइल संपादित करें" },
    ta: { notAdded: "சேர்க்கப்படவில்லை", notLinked: "இணைக்கப்படவில்லை", mockLinked: "முன்மாதிரி இணைப்பு", search: "தேடு", toolHelp: "அறிகுறிகளுக்கு உதவி வேண்டுமா?", symptomLink: "அறிகுறி வழிகாட்டியைத் திற →", searchPlaceholder: "பதிவுகள், மருந்துகள் அல்லது பரிசோதனை முடிவுகளைத் தேடுங்கள்", symptomAgePlaceholder: "முதலில் வயதை உள்ளிடவும்", symptomPlaceholder: "உதாரணம்: முதுகு வலி, தோல் சொறி, தலைச்சுற்றல் அல்லது மனச்சோர்வு", uploadAgePlaceholder: "ஸ்கேன் செய்வதற்கு முன் வயதை உள்ளிடவும்", scanMedicineNote: "மருந்துப் பெயரும் வழிமுறைகளும் ஆவணத்திலிருந்து எடுக்கப்பட்டவை. mg என்பது எடை அலகு; mL என்பது திரவ அளவு அலகு. இவை மருந்து அல்லது அளவு உங்களுக்கு ஏற்றதா என்பதைச் சொல்லாது. பெயர், வலிமை, அட்டவணையை அசல் மருந்துச் சீட்டு அல்லது மருந்தாளரிடம் உறுதிப்படுத்தவும். இந்தப் பயன்பாடு மருந்தின் நோக்கத்தை விளக்கவோ பயன்படுத்தும் முறையைப் பரிந்துரைக்கவோ முடியாது.", scanReportNote: "அறிக்கை வரிகள் OCR-இல் கிடைத்தபடி காட்டப்படுகின்றன. இது நோயறிதலோ மருத்துவ விளக்கமோ அல்ல.", editProfile: "ஆரோக்கிய சுயவிவரத்தைத் திருத்து" },
    te: { notAdded: "జోడించలేదు", notLinked: "లింక్ కాలేదు", mockLinked: "నమూనా లింక్", search: "వెతకండి", toolHelp: "లక్షణాల గురించి సహాయం కావాలా?", symptomLink: "లక్షణాల మార్గదర్శిని తెరవండి →", searchPlaceholder: "రికార్డులు, మందులు లేదా పరీక్ష ఫలితాలను వెతకండి", symptomAgePlaceholder: "ముందుగా వయస్సు నమోదు చేయండి", symptomPlaceholder: "ఉదాహరణ: వెన్నునొప్పి, దద్దుర్లు, తలతిరగడం లేదా నిరాశ", uploadAgePlaceholder: "స్కాన్‌కు ముందు వయస్సు నమోదు చేయండి", scanMedicineNote: "మందు పేరు, సూచనలు పత్రం నుంచి తీసుకున్నవి. mg బరువు యూనిట్; mL ద్రవ పరిమాణ యూనిట్. ఇవి మందు లేదా మోతాదు మీకు సరైనదో చెప్పవు. పేరు, బలం, సమయాన్ని అసలు ప్రిస్క్రిప్షన్ లేదా ఫార్మసిస్ట్‌తో నిర్ధారించండి. ఈ యాప్ మందు ఉపయోగాన్ని వివరించదు లేదా ఎలా వాడాలో సూచించదు.", scanReportNote: "నివేదిక పంక్తులు OCRలో కనిపించినట్లుగా చూపబడతాయి. ఇది రోగనిర్ధారణ లేదా వైద్య వివరణ కాదు.", editProfile: "ఆరోగ్య ప్రొఫైల్‌ను సవరించండి" }
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { profile: { name: "Aarav Mehta", dob: "", bloodGroup: "", allergies: "", abhaId: "" }, records: [], recommendations: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.records)) throw new Error("Stored health data has an invalid format.");
      return {
        profile: { name: "Aarav Mehta", dob: "", bloodGroup: "", allergies: "", abhaId: "", ...(parsed.profile || {}) },
        records: parsed.records.filter((record) => record && typeof record.id === "string" && typeof record.title === "string"),
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.filter((item) => typeof item === "string").slice(0, 8) : []
      };
    } catch (error) {
      console.error("Unable to load MY-SMR data.", error);
      showToast("Saved health data could not be read. A new empty profile is shown.");
      return { profile: { name: "Aarav Mehta", dob: "", bloodGroup: "", allergies: "", abhaId: "" }, records: [], recommendations: [] };
    }
  }

  async function readApiJson(response) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      await response.text();
      throw new Error("The local MY-SMR server is out of date. Restart it with `npm start` in the project folder, then refresh this page.");
    }
    try {
      return await response.json();
    } catch {
      throw new Error("The local server returned an invalid API response. Restart it with `npm start` and try again.");
    }
  }

  async function saveState(previousState) {
    try {
      if (!backendReady) throw new Error("The local backend is still starting or is unavailable. Try again when it is ready.");
      const response = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state)
      });
      const result = await readApiJson(response);
      if (!response.ok) throw new Error(result.error || "The backend could not save your records.");
      return true;
    } catch (error) {
      console.error("Unable to save MY-SMR data to the local backend.", error);
      state = previousState;
      render();
      showToast(error instanceof Error ? error.message : "Could not save to the local backend. Start the server and try again.");
      return false;
    }
  }

  async function initializeBackend() {
    try {
      const response = await fetch("/api/state");
      if (!response.ok) throw new Error("The local backend could not load saved health data.");
      const remote = await readApiJson(response);
      if (remote.initialized) {
        state = { profile: remote.profile, records: remote.records };
      } else {
        state = loadState();
        const saved = await fetch("/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state)
        });
        const result = await readApiJson(saved);
        if (!saved.ok) throw new Error(result.error || "Could not move existing records into the local database.");
      }
      backendReady = true;
      localStorage.removeItem(STORAGE_KEY);
      render();
    } catch (error) {
      console.error("Unable to connect to the MY-SMR local backend.", error);
      showToast(error instanceof Error ? error.message : "Backend unavailable. Run npm install and npm start in the project folder to load and save records.");
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function shortDate(value) {
    if (!value) return "Date not noted";
    const parsed = new Date(`${value}T12:00:00`);
    const locale = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN" }[language];
    return Number.isNaN(parsed.getTime()) ? "Date not noted" : new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(parsed);
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 3200);
  }

  state = loadState();

  function getFlaggedResults() {
    const flagged = [];
    for (const record of state.records) {
      for (const line of (record.tests || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
        const marker = line.match(/\b(high|elevated|critical|low|decreased|positive|abnormal)\b/i);
        if (marker) {
          const word = marker[1].toLowerCase();
          const direction = ["high", "elevated", "critical"].includes(word) ? "high" : ["low", "decreased"].includes(word) ? "low" : word === "positive" ? "positive" : "flagged";
          flagged.push({ line, direction });
          continue;
        }
        const range = line.match(/^\s*(.+?)\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*([a-z/%µμ.]*)\s*(?:\(|\[)?\s*(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)/i);
        if (range) {
          const result = Number(range[2]);
          const lower = Number(range[4]);
          const upper = Number(range[5]);
          if (result < lower) flagged.push({ line, direction: "low" });
          else if (result > upper) flagged.push({ line, direction: "high" });
        }
      }
    }
    return flagged;
  }

  function getLatestReport() {
    return state.records
      .filter((record) => (record.tests || "").trim())
      .sort((a, b) => (b.date || b.createdAt || "").localeCompare(a.date || a.createdAt || ""))[0] || null;
  }

  function renderSummary() {
    const container = $("#summary-content");
    const t = translations[language];
    if (!state.records.length) {
      container.innerHTML = `<div class="summary-empty"><span class="empty-symbol">✳</span><div><strong>${t.emptyTitle}</strong><p>${t.emptyText}</p></div></div>`;
      return;
    }
    const labs = state.records.filter((record) => record.type === "lab").length;
    const medicines = new Set(state.records.flatMap((record) => (record.medicines || "").split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean))).size;
    const flagged = getFlaggedResults();
    const latestReport = getLatestReport();
    const resultLabels = {
      en: { review: "Review needed · ", tests: "Test results" },
      hi: { review: "समीक्षा करें · ", tests: "जाँच परिणाम" },
      ta: { review: "மதிப்பாய்வு தேவை · ", tests: "பரிசோதனை முடிவுகள்" },
      te: { review: "పరిశీలన అవసరం · ", tests: "పరీక్ష ఫలితాలు" }
    }[language];
    const latestReportHeading = {
      en: "Recent report results",
      hi: "हाल की रिपोर्ट के परिणाम",
      ta: "சமீபத்திய அறிக்கை முடிவுகள்",
      te: "ఇటీవలి నివేదిక ఫలితాలు"
    }[language];
    const noReportResults = {
      en: "No report results have been extracted yet.",
      hi: "अभी तक रिपोर्ट के परिणाम नहीं निकाले गए हैं।",
      ta: "அறிக்கை முடிவுகள் இன்னும் எடுக்கப்படவில்லை.",
      te: "ఇంకా నివేదిక ఫలితాలు సేకరించబడలేదు."
    }[language];
    const reportResultsNote = {
      en: "Copied from the latest saved report. Confirm values and units against the original; this is not a diagnosis.",
      hi: "नवीनतम सहेजी गई रिपोर्ट से लिया गया है। मान और इकाइयाँ मूल रिपोर्ट से जाँचें; यह निदान नहीं है।",
      ta: "சமீபத்தில் சேமிக்கப்பட்ட அறிக்கையிலிருந்து எடுக்கப்பட்டது. மதிப்புகள் மற்றும் அலகுகளை அசல் அறிக்கையுடன் சரிபார்க்கவும்; இது நோயறிதல் அல்ல.",
      te: "ఇటీవల సేవ్ చేసిన నివేదిక నుంచి తీసినవి. విలువలు, యూనిట్లను అసలు నివేదికతో సరిపోల్చండి; ఇది రోగనిర్ధారణ కాదు."
    }[language];
    const latestReportLines = latestReport
      ? latestReport.tests.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      : [];
    const latestReportSection = latestReport
      ? `<section class="summary-recent-report" aria-label="${escapeHTML(latestReportHeading)}">
          <div class="summary-recent-report-heading"><strong>${escapeHTML(latestReportHeading)}</strong><span>${escapeHTML(shortDate(latestReport.date))}</span></div>
          <p class="summary-recent-report-source">${escapeHTML(latestReport.title)}${latestReport.provider ? ` · ${escapeHTML(latestReport.provider)}` : ""}</p>
          <ul>${latestReportLines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>
          <p class="summary-recent-report-note">${escapeHTML(reportResultsNote)}</p>
        </section>`
      : `<section class="summary-recent-report"><strong>${escapeHTML(latestReportHeading)}</strong><p>${escapeHTML(noReportResults)}</p></section>`;
    const statements = [
      `<p>${t.haveRecords(state.records.length)} ${t.labs(labs)} ${medicines ? t.meds(medicines) : ""}</p>`,
      latestReportSection,
      `<div class="summary-callout"><strong>${flagged.length ? resultLabels.review : ""}${resultLabels.tests}:</strong> ${flagged.length ? t.abnormal : t.normal}${flagged.map((result) => `<p>${escapeHTML(t.explainResult(result.direction, result.line))}</p>`).join("")}</div>`,
      `<p>${t.disclaimer}</p>`
    ];
    container.innerHTML = statements.join("");
  }

  function getGeneratedRecommendations() {
    const records = [...state.records].sort((a, b) => (b.date || b.createdAt || "").localeCompare(a.date || a.createdAt || "")).slice(0, 6);
    const recommendations = [];
    recommendations.push("For general nourishment, choose a variety of vegetables, fruit, whole grains, and protein, and drink water regularly. Follow any food plan given by your clinician.");

    if (records.some((record) => record.type === "lab")) {
      recommendations.push("Bring your reports and medicine list to your next appointment so your clinician can review them with you.");
    }

    return recommendations.slice(0, 4);
  }

  function findPrescriptionFoodLines(record) {
    return (record.rawText || "").split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /\b(food|meal|meals|eat|eating|diet|empty stomach|milk|dairy|alcohol|fasting|grapefruit)\b|भोजन|खाना|दूध|उपवास|உணவு|சாப்பாடு|பால்|உண்ணாவிரதம்|ఆహారం|భోజనం|పాలు|ఉపవాసం/i.test(line));
  }

  function getPrescriptionMedicineDetails(line) {
    const strengthMatch = line.match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|μg|g|ml|mL|%)\b/i);
    const strength = strengthMatch?.[0] || "";
    const form = line.match(/\b(tablets?|tabs?|capsules?|caps?|syrup|suspension|injection|drops?|cream|ointment|inhaler)\b/i)?.[0] || "";
    const directionPattern = /\b(?:once|twice|thrice|three times|four times)\s+(?:a\s+)?daily\b|\b(?:morning|afternoon|evening|night|bedtime|before meals|after meals|with food|after food|before food|empty stomach|as needed|when required)\b|\b(?:OD|BD|BID|TID|QID|SOS|HS|AC|PC)\b|\b\d+\s*-\s*\d+\s*-\s*\d+\b|\bfor\s+\d+\s*(?:days?|weeks?)\b/gi;
    const directionMatches = [...line.matchAll(directionPattern)];
    const directions = directionMatches.map((match) => match[0]);
    const endOfName = Math.min(
      strengthMatch?.index ?? line.length,
      directionMatches[0]?.index ?? line.length
    );
    const name = line.slice(0, endOfName)
      .replace(/^\s*(?:[-*•]\s*)?(?:rx[:.-]?\s*)?(?:take\s+)?(?:(?:\d+(?:\.\d+)?|one|two|three)\s+)?(?:(?:tablets?|tabs?|capsules?|caps?|pills?)\s+)?(?:of\s+)?/i, "")
      .replace(/^\s*(?:tablets?|tabs?|capsules?|caps?|syrup|suspension|injection|drops?|cream|ointment|inhaler)\.?\s*/i, "")
      .replace(/\s+(?:tablets?|tabs?|capsules?|caps?|pills?)\.?\s*$/i, "")
      .replace(/[\s,;:.-]+$/, "")
      .trim();
    return { line, name, strength, form, directions: [...new Set(directions)] };
  }

  function renderPrescriptionMedicineCards(lines, labels, noMedicinesText) {
    const details = lines.map(getPrescriptionMedicineDetails);
    if (!details.length) return `<p>${escapeHTML(noMedicinesText)}</p>`;
    return `<div class="prescription-medicine-cards">${details.map((medicine, index) => `
      <article class="prescription-medicine-card">
        <div class="prescription-medicine-card-title"><span>${index + 1}</span><strong>${escapeHTML(medicine.name || labels.notDetected)}</strong></div>
        <p class="prescription-medicine-line"><strong>${escapeHTML(labels.scannedLine)}:</strong> ${escapeHTML(medicine.line)}</p>
        <dl class="prescription-medicine-fields">
          <div><dt>${escapeHTML(labels.strength)}</dt><dd>${medicine.strength ? escapeHTML(medicine.strength) : escapeHTML(labels.notDetected)}</dd></div>
          <div><dt>${escapeHTML(labels.form)}</dt><dd>${medicine.form ? escapeHTML(medicine.form) : escapeHTML(labels.notDetected)}</dd></div>
          <div><dt>${escapeHTML(labels.instructions)}</dt><dd>${medicine.directions.length ? escapeHTML(medicine.directions.join(", ")) : escapeHTML(labels.notDetected)}</dd></div>
        </dl>
      </article>
    `).join("")}</div>`;
  }

  function renderPrescribedMedicines() {
    const list = $("#prescribed-medicines-list");
    const messages = {
      en: {
        none: "Upload and save a prescription to see its medicine details, food notes, and precautions here.",
        noMedicines: "No medicine details were clearly detected. Check the prescription and OCR transcript.",
        source: "Prescription",
        view: "Open full details",
        medicines: "Medicine details in simple words",
        medicineExplanation: "These lines show the medicine name, strength, and directions as recognized from the prescription. This app cannot tell what a medicine is for. Compare each line with the original prescription.",
        medicineFields: { scannedLine: "Prescription line", strength: "Strength", form: "Form", instructions: "Directions found", notDetected: "Name/details not clearly detected" },
        food: "Food and meals",
        foodNote: "Food-related text below is copied from the prescription, not interpreted. If no instruction was found, only general balanced-food guidance is shown.",
        foodGeneral: "No clear food instruction was detected in this prescription. In general, eat balanced meals with vegetables, fruit, whole grains, and protein. Follow any diet instructions from your clinician.",
        precautions: "Precautions",
        precautionsText: ["Check the medicine name, strength, and directions against the original prescription; OCR can make mistakes.", "Take medicines only as your prescriber instructed. Do not start, stop, or change a medicine based on this app.", "Ask your doctor or pharmacist about allergies, other medicines, interactions, or unclear instructions."]
      },
      hi: {
        none: "दवा का विवरण, भोजन संबंधी नोट और सावधानियाँ देखने के लिए प्रिस्क्रिप्शन अपलोड करके सेव करें।",
        noMedicines: "दवा का स्पष्ट विवरण नहीं मिला। प्रिस्क्रिप्शन और OCR पाठ जाँचें।",
        source: "प्रिस्क्रिप्शन",
        view: "पूरा विवरण खोलें",
        medicines: "दवा का सरल विवरण",
        medicineExplanation: "ये पंक्तियाँ प्रिस्क्रिप्शन से पहचाने गए दवा के नाम, ताकत और निर्देश दिखाती हैं। यह ऐप दवा का उपयोग नहीं बता सकता। हर पंक्ति को मूल प्रिस्क्रिप्शन से मिलाएँ।",
        medicineFields: { scannedLine: "प्रिस्क्रिप्शन की पंक्ति", strength: "ताकत", form: "रूप", instructions: "मिले निर्देश", notDetected: "नाम/विवरण स्पष्ट नहीं मिला" },
        food: "भोजन और आहार",
        foodNote: "नीचे का भोजन-संबंधी पाठ प्रिस्क्रिप्शन से लिया गया है, इसकी व्याख्या नहीं की गई है। निर्देश न मिलने पर केवल सामान्य संतुलित भोजन की जानकारी दिखाई जाती है।",
        foodGeneral: "इस प्रिस्क्रिप्शन में भोजन का स्पष्ट निर्देश नहीं मिला। सामान्य तौर पर सब्ज़ियाँ, फल, साबुत अनाज और प्रोटीन वाला संतुलित भोजन लें। डॉक्टर की आहार सलाह का पालन करें।",
        precautions: "सावधानियाँ",
        precautionsText: ["दवा का नाम, ताकत और निर्देश मूल प्रिस्क्रिप्शन से जाँचें; OCR में गलती हो सकती है।", "दवा केवल डॉक्टर के निर्देशानुसार लें। इस ऐप के आधार पर दवा शुरू, बंद या न बदलें।", "एलर्जी, अन्य दवाओं, आपसी प्रभाव या अस्पष्ट निर्देशों के बारे में डॉक्टर या फार्मासिस्ट से पूछें।"]
      },
      ta: {
        none: "மருந்து விவரங்கள், உணவு குறிப்புகள், முன்னெச்சரிக்கைகளைக் காண மருந்துச் சீட்டை பதிவேற்றி சேமிக்கவும்.",
        noMedicines: "தெளிவான மருந்து விவரம் கிடைக்கவில்லை. மருந்துச் சீட்டையும் OCR உரையையும் சரிபார்க்கவும்.",
        source: "மருந்துச் சீட்டு",
        view: "முழு விவரத்தைத் திற",
        medicines: "எளிய சொற்களில் மருந்து விவரங்கள்",
        medicineExplanation: "இந்த வரிகள் மருந்துச் சீட்டிலிருந்து படிக்கப்பட்ட மருந்துப் பெயர், வலிமை, வழிமுறைகளைக் காட்டுகின்றன. மருந்து எதற்கானது என்பதை இந்தச் செயலி கூறாது. ஒவ்வொரு வரியையும் அசல் மருந்துச் சீட்டுடன் ஒப்பிடவும்.",
        medicineFields: { scannedLine: "மருந்துச் சீட்டு வரி", strength: "வலிமை", form: "வடிவம்", instructions: "கண்டறிந்த வழிமுறைகள்", notDetected: "பெயர்/விவரம் தெளிவாகக் கண்டறியப்படவில்லை" },
        food: "உணவு மற்றும் உணவுமுறை",
        foodNote: "கீழே உள்ள உணவு தொடர்பான உரை மருந்துச் சீட்டிலிருந்து நகலெடுக்கப்பட்டது; விளக்கப்படவில்லை. வழிமுறை கிடைக்காவிட்டால் பொதுவான சமநிலை உணவு தகவல் மட்டுமே காட்டப்படும்.",
        foodGeneral: "இந்த மருந்துச் சீட்டில் தெளிவான உணவு வழிமுறை கண்டறியப்படவில்லை. பொதுவாக காய்கறிகள், பழங்கள், முழுதானியங்கள், புரதம் உள்ள சமநிலையான உணவைத் தேர்ந்தெடுக்கவும். மருத்துவர் கூறிய உணவுமுறையைப் பின்பற்றவும்.",
        precautions: "முன்னெச்சரிக்கைகள்",
        precautionsText: ["மருந்துப் பெயர், வலிமை, வழிமுறைகளை அசல் மருந்துச் சீட்டுடன் சரிபார்க்கவும்; OCR தவறாகப் படிக்கலாம்.", "மருத்துவர் கூறியபடி மட்டுமே மருந்துகளை எடுத்துக்கொள்ளவும். இந்தச் செயலியின் அடிப்படையில் மருந்தைத் தொடங்கவோ நிறுத்தவோ மாற்றவோ வேண்டாம்.", "ஒவ்வாமை, பிற மருந்துகள், மருந்து இடைவினைகள் அல்லது தெளிவில்லாத வழிமுறைகள் குறித்து மருத்துவர் அல்லது மருந்தாளரிடம் கேளுங்கள்."]
      },
      te: {
        none: "మందుల వివరాలు, ఆహార సూచనలు, జాగ్రత్తలు చూడటానికి ప్రిస్క్రిప్షన్‌ను అప్‌లోడ్ చేసి సేవ్ చేయండి.",
        noMedicines: "మందుల వివరాలు స్పష్టంగా గుర్తించబడలేదు. ప్రిస్క్రిప్షన్, OCR వచనాన్ని తనిఖీ చేయండి.",
        source: "ప్రిస్క్రిప్షన్",
        view: "పూర్తి వివరాలు తెరవండి",
        medicines: "సులభమైన మాటల్లో మందుల వివరాలు",
        medicineExplanation: "ఈ పంక్తులు ప్రిస్క్రిప్షన్‌లో గుర్తించిన మందు పేరు, బలం, సూచనలను చూపిస్తాయి. మందు దేనికోసం అన్నది ఈ యాప్ చెప్పదు. ప్రతి పంక్తిని అసలు ప్రిస్క్రిప్షన్‌తో సరిపోల్చండి.",
        medicineFields: { scannedLine: "ప్రిస్క్రిప్షన్ పంక్తి", strength: "బలం", form: "రూపం", instructions: "గుర్తించిన సూచనలు", notDetected: "పేరు/వివరాలు స్పష్టంగా గుర్తించలేదు" },
        food: "ఆహారం మరియు భోజనం",
        foodNote: "కింద ఉన్న ఆహారానికి సంబంధించిన వచనం ప్రిస్క్రిప్షన్ నుంచి తీసుకున్నది; దాని అర్థాన్ని వివరించలేదు. సూచన కనిపించకపోతే సాధారణ సమతుల్య ఆహార సమాచారం మాత్రమే చూపిస్తాం.",
        foodGeneral: "ఈ ప్రిస్క్రిప్షన్‌లో స్పష్టమైన ఆహార సూచన కనిపించలేదు. సాధారణంగా కూరగాయలు, పండ్లు, తృణధాన్యాలు, ప్రోటీన్‌తో సమతుల్య ఆహారం తీసుకోండి. వైద్యుడు ఇచ్చిన ఆహార సూచనలను పాటించండి.",
        precautions: "జాగ్రత్తలు",
        precautionsText: ["మందు పేరు, బలం, సూచనలను అసలు ప్రిస్క్రిప్షన్‌తో తనిఖీ చేయండి; OCR తప్పుగా చదవవచ్చు.", "వైద్యుడు చెప్పినట్లుగానే మందులు వాడండి. ఈ యాప్ ఆధారంగా మందును ప్రారంభించవద్దు, ఆపవద్దు లేదా మార్చవద్దు.", "అలర్జీలు, ఇతర మందులు, పరస్పర ప్రభావాలు లేదా అర్థంకాని సూచనల గురించి వైద్యుడు లేదా ఫార్మసిస్ట్‌ను అడగండి."]
      }
    }[language];
    const prescriptionRecords = [...state.records]
      .filter((record) => record.type === "prescription")
      .sort((a, b) => (b.date || b.createdAt || "").localeCompare(a.date || a.createdAt || ""));

    if (!prescriptionRecords.length) {
      list.innerHTML = `<p class="prescribed-medicines-empty">${messages.none}</p>`;
      return;
    }

    const record = prescriptionRecords[0];
    const medicineLines = (record.medicines || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const foodLines = findPrescriptionFoodLines(record);

    list.innerHTML = `
      <article class="prescribed-medicine-record">
        <div class="prescribed-medicine-source">
          <strong>${escapeHTML(record.title || messages.source)}</strong>
          <span>${escapeHTML(messages.source)} · ${escapeHTML(shortDate(record.date))}</span>
        </div>
        <section class="prescription-guide-section">
          <h4>${escapeHTML(messages.medicines)}</h4>
          <p>${escapeHTML(messages.medicineExplanation)}</p>
          ${renderPrescriptionMedicineCards(medicineLines, messages.medicineFields, messages.noMedicines)}
        </section>
        <section class="prescription-guide-section">
          <h4>${escapeHTML(messages.food)}</h4>
          ${foodLines.length
            ? `<ul>${foodLines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>`
            : `<p>${escapeHTML(messages.foodGeneral)}</p>`}
          <p class="prescription-guide-caution">${escapeHTML(messages.foodNote)}</p>
        </section>
        <section class="prescription-guide-section">
          <h4>${escapeHTML(messages.precautions)}</h4>
          <ul>${messages.precautionsText.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>
        </section>
        <button class="text-link prescribed-medicine-view" type="button" data-prescription-details="${escapeHTML(record.id)}">${escapeHTML(messages.view)} →</button>
      </article>
    `;

    list.querySelectorAll("[data-prescription-details]").forEach((button) => {
      button.addEventListener("click", () => {
        const record = state.records.find((item) => item.id === button.dataset.prescriptionDetails);
        if (record) openRecordDetails(record);
      });
    });
  }

  function getSavedRecommendations() {
    return Array.isArray(state.recommendations)
      ? state.recommendations.filter((recommendation) => !/\b(medication schedule|medicine schedule|these medicines|dose|dosage|tablet|capsule|drug)\b/i.test(recommendation))
      : [];
  }

  function renderRecommendations() {
    const list = $("#recommendation-list");
    if (!list) return;
    const savedRecommendations = getSavedRecommendations();
    const baseRecommendations = savedRecommendations.length ? savedRecommendations : getGeneratedRecommendations();
    const recommendations = baseRecommendations.filter(Boolean).slice(0, 4);
    if (!recommendations.length) {
      list.innerHTML = "<div class=\"empty-list\">No care recommendations yet.</div>";
      return;
    }
    list.innerHTML = recommendations.map((recommendation, index) => `
      <div class="recommendation-item">
        <span class="recommendation-bullet">${index + 1}</span>
        <div style="flex: 1; min-width:0;">
          <p>${escapeHTML(recommendation)}</p>
          <div class="recommendation-meta">
            <span class="quiet-label">Suggested care</span>
            <button class="recommendation-edit" type="button" data-recommendation-index="${index}">Edit</button>
          </div>
        </div>
      </div>
    `).join("");
    list.querySelectorAll("[data-recommendation-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.recommendationIndex);
        const currentList = getSavedRecommendations().length ? getSavedRecommendations() : getGeneratedRecommendations();
        const current = currentList[index];
        const updated = window.prompt("Update this recommendation:", current || "");
        if (updated === null) return;
        const text = updated.trim();
        if (!text) return;

        const previousState = JSON.parse(JSON.stringify(state));
        const nextList = [...(getSavedRecommendations().length ? getSavedRecommendations() : getGeneratedRecommendations())];
        nextList[index] = text;
        state.recommendations = nextList.filter(Boolean).slice(0, 4);
        saveState(previousState);
        renderRecommendations();
      });
    });
  }

  function renderRecords() {
    const list = $("#records-list");
    const matchingRecords = state.records.filter((record) => {
      const searchable = [record.title, record.fileName, record.provider, record.diagnosis, record.medicines, record.tests]
        .join(" ").toLocaleLowerCase();
      return searchable.includes(recordSearch);
    }).sort((a, b) => (b.date || b.createdAt || "").localeCompare(a.date || a.createdAt || ""));
    const recent = (recordSearch ? matchingRecords : matchingRecords.slice(0, 5));
    $("#record-search-status").textContent = recordSearch
      ? `${matchingRecords.length} matching record${matchingRecords.length === 1 ? "" : "s"}`
      : "";
    if (!recent.length) {
      list.innerHTML = recordSearch
        ? `<div class="empty-list">No records match “${escapeHTML(recordSearch)}”. Try another search.</div>`
        : `<div class="empty-list"><strong>${translations[language].noneFound}</strong>${translations[language].noneDescription}</div>`;
      return;
    }
    list.innerHTML = recent.map((record) => `
      <div class="record-row">
        <span class="record-file-icon ${escapeHTML(record.type)}" aria-hidden="true">${record.type === "lab" ? "⌁" : record.type === "prescription" ? "✚" : record.type === "discharge" ? "▣" : "▤"}</span>
        <div class="record-info"><strong title="${escapeHTML(record.title)}">${escapeHTML(record.title)}</strong><small>${escapeHTML(record.provider || "Provider not noted")} · ${escapeHTML(shortDate(record.date))}</small></div>
        <div class="record-meta"><span class="type-chip">${escapeHTML(typeLabels[record.type]?.[language] || typeLabels.other[language])}</span><div class="row-actions"><button class="row-action" data-details="${escapeHTML(record.id)}" type="button" aria-label="View details for ${escapeHTML(record.title)}" title="View details">ⓘ</button><button class="row-action" data-edit="${escapeHTML(record.id)}" type="button" aria-label="Edit ${escapeHTML(record.title)}" title="Edit">✎</button><button class="row-action" data-delete="${escapeHTML(record.id)}" type="button" aria-label="Delete ${escapeHTML(record.title)}" title="Delete">×</button></div></div>
      </div>`).join("");
    list.querySelectorAll("[data-details]").forEach((button) => button.addEventListener("click", () => {
      const record = state.records.find((item) => item.id === button.dataset.details);
      if (record) openRecordDetails(record);
    }));
    list.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editRecord(button.dataset.edit)));
    list.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteRecord(button.dataset.delete)));
  }

  function renderTimeline() {
    const list = $("#timeline-list");
    const records = [...state.records].sort((a, b) => (b.date || b.createdAt || "").localeCompare(a.date || a.createdAt || ""));
    if (!records.length) {
      list.innerHTML = `<div class="empty-list">${translations[language].noTimeline}</div>`;
      return;
    }
    list.innerHTML = records.map((record) => `<div class="timeline-item"><div class="timeline-date">${escapeHTML(shortDate(record.date))}</div><div class="timeline-track"><span class="timeline-dot"></span></div><div class="timeline-text"><strong>${escapeHTML(record.title)}</strong><small>${escapeHTML(typeLabels[record.type]?.[language] || typeLabels.other[language])}${record.provider ? ` · ${escapeHTML(record.provider)}` : ""}</small></div></div>`).join("");
  }

  function formatAbha(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 14);
    return digits.replace(/(\d{2})(?=\d)/g, "$1-");
  }

  function renderProfile() {
    const profile = state.profile;
    const name = profile.name || "Your name";
    $("#profile-name").textContent = name;
    $("#user-name-side").textContent = name;
    $("#greeting").innerHTML = `${escapeHTML(translations[language].hello(name))} <span class="wave">✦</span>`;
    const age = profile.dob ? calculateAge(profile.dob) : null;
    const ageLabel = { en: "years old", hi: "वर्ष", ta: "வயது", te: "సంవత్సరాలు" }[language];
    $("#profile-demographics").textContent = [age !== null ? `${age} ${ageLabel}` : "", translations[language].profileDemographics].filter(Boolean).join(" · ");
    $("#profile-blood").textContent = profile.bloodGroup || localized[language].notAdded;
    $("#profile-allergies").textContent = profile.allergies || localized[language].notAdded;
    $("#profile-abha").textContent = formatAbha(profile.abhaId) || localized[language].notLinked;
    $("#abha-status").textContent = profile.abhaId ? localized[language].mockLinked : localized[language].notLinked;
    $("#stat-records").textContent = state.records.length;
    $("#stat-labs").textContent = state.records.filter((record) => record.type === "lab").length;
    $("#stat-medicines").textContent = new Set(state.records.flatMap((record) => (record.medicines || "").split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean))).size;
  }

  function render() {
    renderProfile();
    renderSummary();
    renderPrescribedMedicines();
    renderRecommendations();
    renderRecords();
    renderTimeline();
    for (const [id, value] of Object.entries(translations[language].ui)) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }
    document.documentElement.lang = language;
    $("#language-toggle").value = language;
    localStorage.setItem("my-smr-language", language);
    $("#profile-shortcut").setAttribute("aria-label", translations[language].ui["profile-shortcut-label"]);
    $("#edit-profile-secondary").textContent = localized[language].editProfile;
    $("#export-data").setAttribute("aria-label", translations[language].ui["export-data-label"]);
    $("#record-search-input").placeholder = localized[language].searchPlaceholder;
    $("#symptom-age").placeholder = localized[language].symptomAgePlaceholder;
    $("#symptom-text").placeholder = localized[language].symptomPlaceholder;
    $("#upload-patient-age").placeholder = localized[language].uploadAgePlaceholder;
    $("#record-search-form button").textContent = localized[language].search;
    $("#tool-shortcuts-label").textContent = localized[language].toolHelp;
    $("#symptom-quick-link").textContent = localized[language].symptomLink;
    $("#recommendation-eyebrow").textContent = { en: "SMART CARE TIPS", hi: "स्मार्ट केयर सुझाव", ta: "சிறந்த பராமரிப்பு குறிப்புகள்", te: "స్మార్ట్ కేర్ సూచనలు" }[language];
    $("#recommendation-heading").textContent = { en: "General wellness & follow-up", hi: "सामान्य स्वास्थ्य और फॉलो-अप", ta: "பொது நலன் மற்றும் பின்தொடர்தல்", te: "సాధారణ ఆరోగ్యం & ఫాలో-అప్" }[language];
    $("#recommendation-note").textContent = { en: "General food and follow-up information only. This app does not recommend or prescribe medicines.", hi: "केवल सामान्य भोजन और फॉलो-अप जानकारी। यह ऐप दवाएँ सुझाता या निर्धारित नहीं करता।", ta: "பொதுவான உணவு மற்றும் பின்தொடர்தல் தகவல்கள் மட்டுமே. இந்தச் செயலி மருந்துகளைப் பரிந்துரைக்கவோ எழுதவோ செய்யாது.", te: "సాధారణ ఆహారం మరియు ఫాలో-అప్ సమాచారం మాత్రమే. ఈ యాప్ మందులను సూచించదు లేదా ప్రిస్క్రైబ్ చేయదు." }[language];
    $("#prescribed-medicines-eyebrow").textContent = { en: "FROM YOUR PRESCRIPTION", hi: "आपके प्रिस्क्रिप्शन से", ta: "உங்கள் மருந்துச் சீட்டிலிருந்து", te: "మీ ప్రిస్క్రిప్షన్ నుంచి" }[language];
    $("#prescribed-medicines-heading").textContent = { en: "Prescription guide", hi: "प्रिस्क्रिप्शन गाइड", ta: "மருந்துச் சீட்டு வழிகாட்டி", te: "ప్రిస్క్రిప్షన్ గైడ్" }[language];
    $("#prescribed-medicines-note").textContent = {
      en: "This guide repeats details found in your prescription and adds general food information. It does not explain what a medicine treats or replace advice from your prescriber or pharmacist.",
      hi: "यह गाइड प्रिस्क्रिप्शन में मिली जानकारी और सामान्य भोजन संबंधी जानकारी दिखाती है। यह दवा का उपयोग नहीं बताती और डॉक्टर या फार्मासिस्ट की सलाह का विकल्प नहीं है।",
      ta: "இந்த வழிகாட்டி மருந்துச் சீட்டில் உள்ள விவரங்களையும் பொதுவான உணவு தகவல்களையும் காட்டுகிறது. மருந்து எதற்கானது என்பதை விளக்காது; மருத்துவர் அல்லது மருந்தாளரின் ஆலோசனைக்கு மாற்றாகாது.",
      te: "ఈ గైడ్ ప్రిస్క్రిప్షన్‌లోని వివరాలు, సాధారణ ఆహార సమాచారాన్ని చూపిస్తుంది. మందు దేనికోసం అన్నది చెప్పదు; వైద్యుడు లేదా ఫార్మసిస్ట్ సలహాకు బదులు కాదు."
    }[language];
  }

  function calculateAge(dob) {
    const date = new Date(`${dob}T12:00:00`);
    if (Number.isNaN(date.getTime()) || date > new Date()) return null;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    if (now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())) age--;
    return age;
  }

  async function analyzeDocument(file, text, requestedType, patientAge) {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.slice(0, 12000),
        fileName: file.name,
        mimeType: file.type || "text/plain",
        requestedType,
        patientAge
      })
    });
    const result = await readApiJson(response);
    if (!response.ok) throw new Error(result.error || "The local backend could not analyze this document.");
    return result;
  }

  async function saveRecordImagePreview(file) {
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error("The uploaded image could not be prepared for the saved record.");
    }
    try {
      const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare an image preview.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const preview = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Your browser could not create an image preview.")), "image/jpeg", 0.78);
      });
      if (preview.size > 1900000) throw new Error("The compressed image preview is too large. Try a smaller image.");
      const response = await fetch("/api/record-images", {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: preview
      });
      const result = await readApiJson(response);
      if (!response.ok) throw new Error(result.error || "The local backend could not save the image preview.");
      return result.imageId;
    } finally {
      bitmap.close();
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) return resolve();
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("OCR library could not be loaded. Check your internet connection and try again.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("OCR library could not be loaded. Check your internet connection and try again."));
      document.head.append(script);
    });
  }

  async function extractText(file) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (file.type === "text/plain" || extension === "txt") return file.text();
    if (file.type === "application/pdf" || extension === "pdf") throw new Error("PDF text extraction is not enabled yet. Please upload an image (JPG or PNG) or paste the text into a .txt file.");
    const imageExtension = ["jpg", "jpeg", "png"].includes(extension);
    if (!file.type.startsWith("image/") && !imageExtension) throw new Error("This file type is not supported. Please upload a JPG, PNG, or text file.");
    const ocrLanguage = $("#record-language").value;
    await loadScript(OCR_SCRIPT);
    const languages = { en: "eng", hi: "eng+hin", ta: "eng+tam", te: "eng+tel" };
    const image = await prepareImageForOCR(file);
    const result = await window.Tesseract.recognize(image, languages[ocrLanguage] || "eng", {
      logger: (message) => {
        if (message.status === "recognizing text" && message.progress) {
          elements.uploadStatus.textContent = `Reading text… ${Math.round(message.progress * 100)}%`;
        }
      }
    });
    return result.data.text || "";
  }

  async function prepareImageForOCR(file) {
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error("The image could not be opened for text recognition. Try another image format.");
    }
    try {
      const longestEdge = Math.max(bitmap.width, bitmap.height);
      const scale = Math.min(1.5, 2200 / longestEdge);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Your browser could not prepare the image for text recognition.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < image.data.length; index += 4) {
        const gray = image.data[index] * 0.299 + image.data[index + 1] * 0.587 + image.data[index + 2] * 0.114;
        const contrast = Math.max(0, Math.min(255, (gray - 128) * 1.2 + 128));
        image.data[index] = contrast;
        image.data[index + 1] = contrast;
        image.data[index + 2] = contrast;
      }
      context.putImageData(image, 0, 0);
      return canvas;
    } finally {
      bitmap.close();
    }
  }

  function openReview(record) {
    $("#record-id").value = record.id || "";
    $("#record-file-name").value = record.fileName || "";
    $("#record-mime-type").value = record.mimeType || "";
    $("#record-patient-age").value = record.patientAge ?? "";
    $("#record-image-id").value = record.imageId || "";
    const reviewImage = $("#record-review-image");
    const reviewImagePreview = $("#record-review-image-preview");
    reviewImage.hidden = !record.imageId;
    reviewImagePreview.removeAttribute("src");
    if (record.imageId) reviewImagePreview.src = `/api/record-images/${encodeURIComponent(record.imageId)}`;
    $("#review-patient-age").textContent = record.patientAge === undefined
      ? ""
      : {
        en: `Patient age provided for this upload: ${record.patientAge} years.`,
        hi: `इस अपलोड के लिए दी गई उम्र: ${record.patientAge} वर्ष।`,
        ta: `இந்தப் பதிவேற்றத்திற்குக் குறிப்பிடப்பட்ட வயது: ${record.patientAge}.`,
        te: `ఈ అప్‌లోడ్ కోసం ఇచ్చిన వయస్సు: ${record.patientAge}.`
      }[language];
    $("#review-title").textContent = record.id
      ? { en: "Edit health record", hi: "स्वास्थ्य रिकॉर्ड संपादित करें", ta: "சுகாதாரப் பதிவைத் திருத்து", te: "ఆరోగ్య రికార్డును సవరించండి" }[language]
      : { en: "Review your record", hi: "अपना रिकॉर्ड जाँचें", ta: "உங்கள் பதிவைச் சரிபார்க்கவும்", te: "మీ రికార్డును సమీక్షించండి" }[language];
    $("#review-name").value = record.title || "";
    $("#review-type").value = record.type || "other";
    $("#review-date").value = record.date || "";
    $("#review-provider").value = record.provider || "";
    $("#review-diagnosis").value = record.diagnosis || "";
    $("#review-medicines").value = record.medicines || "";
    $("#review-tests").value = record.tests || "";
    $("#review-raw").value = record.rawText || "";
    $("#review-medicine-note").textContent = localized[language].scanMedicineNote;
    $("#review-report-note").textContent = localized[language].scanReportNote;
    const medicineLines = (record.medicines || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const reportLines = (record.tests || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const findings = $("#review-findings-content");
    findings.innerHTML = [
      medicineLines.length ? `<strong>${translations[language].findingMedicines}</strong><ul>${medicineLines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>` : "",
      reportLines.length ? `<strong>${translations[language].findingReports}</strong><ul>${reportLines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>` : "",
      medicineLines.length || reportLines.length ? "" : `<p>${translations[language].findingEmpty}</p>`
    ].join("");
    elements.recordDialog.showModal();
  }

  function openRecordDetails(record) {
    const type = typeLabels[record.type]?.[language] || typeLabels.other[language];
    const testLines = (record.tests || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const medicineLines = (record.medicines || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const foodLines = record.type === "prescription" ? findPrescriptionFoodLines(record) : [];
    const prescriptionCopy = {
      en: {
        medicines: "Medicine details in simple words",
        medicineNote: "These are the name, strength, and directions read from the prescription. This app cannot tell what a medicine treats. Check the text against the original prescription.",
        noMedicines: "No medicine details were clearly detected. Open the OCR transcript and check the original prescription.",
        medicineFields: { scannedLine: "Prescription line", strength: "Strength", form: "Form", instructions: "Directions found", notDetected: "Name/details not clearly detected" },
        food: "Food and meals",
        foodFallback: "No clear food instruction was detected. Choose a balanced variety of vegetables, fruit, whole grains, and protein, unless your clinician has advised a different diet.",
        foodNote: "Food-related text is shown as copied; it has not been interpreted.",
        precautionsTitle: "Precautions",
        precautions: ["Verify every medicine name, strength, and direction with the original prescription; OCR can make mistakes.", "Follow your prescriber's instructions. Do not start, stop, or change a medicine based on this app.", "Ask your prescriber or pharmacist about allergies, other medicines, interactions, and unclear instructions."]
      },
      hi: {
        medicines: "दवा का सरल विवरण",
        medicineNote: "यह प्रिस्क्रिप्शन से पढ़े गए नाम, ताकत और निर्देश हैं। यह ऐप दवा का उपयोग नहीं बता सकता। मूल प्रिस्क्रिप्शन से मिलान करें।",
        noMedicines: "दवा का स्पष्ट विवरण नहीं मिला। OCR पाठ और मूल प्रिस्क्रिप्शन जाँचें।",
        medicineFields: { scannedLine: "प्रिस्क्रिप्शन की पंक्ति", strength: "ताकत", form: "रूप", instructions: "मिले निर्देश", notDetected: "नाम/विवरण स्पष्ट नहीं मिला" },
        food: "भोजन और आहार",
        foodFallback: "भोजन का स्पष्ट निर्देश नहीं मिला। डॉक्टर की अलग सलाह न हो तो सब्ज़ियों, फल, साबुत अनाज और प्रोटीन वाला संतुलित भोजन लें।",
        foodNote: "भोजन संबंधी पाठ जस का तस दिखाया गया है; इसकी व्याख्या नहीं की गई।",
        precautionsTitle: "सावधानियाँ",
        precautions: ["दवा का नाम, ताकत और निर्देश मूल प्रिस्क्रिप्शन से जाँचें; OCR में गलती हो सकती है।", "डॉक्टर के निर्देशों का पालन करें। इस ऐप के आधार पर दवा शुरू, बंद या न बदलें।", "एलर्जी, अन्य दवाओं, आपसी प्रभाव या अस्पष्ट निर्देशों के बारे में डॉक्टर या फार्मासिस्ट से पूछें।"]
      },
      ta: {
        medicines: "எளிய சொற்களில் மருந்து விவரங்கள்",
        medicineNote: "இவை மருந்துச் சீட்டிலிருந்து படிக்கப்பட்ட பெயர், வலிமை, வழிமுறைகள். மருந்து எதற்கானது என்பதை இந்தச் செயலி கூறாது. அசல் மருந்துச் சீட்டுடன் ஒப்பிடவும்.",
        noMedicines: "தெளிவான மருந்து விவரம் கிடைக்கவில்லை. OCR உரையையும் அசல் மருந்துச் சீட்டையும் சரிபார்க்கவும்.",
        medicineFields: { scannedLine: "மருந்துச் சீட்டு வரி", strength: "வலிமை", form: "வடிவம்", instructions: "கண்டறிந்த வழிமுறைகள்", notDetected: "பெயர்/விவரம் தெளிவாகக் கண்டறியப்படவில்லை" },
        food: "உணவு மற்றும் உணவுமுறை",
        foodFallback: "தெளிவான உணவு வழிமுறை கண்டறியப்படவில்லை. மருத்துவர் வேறு உணவுமுறை கூறாவிட்டால் காய்கறி, பழம், முழுதானியம், புரதம் உள்ள சமநிலை உணவைத் தேர்ந்தெடுக்கவும்.",
        foodNote: "உணவு தொடர்பான உரை அப்படியே காட்டப்படுகிறது; விளக்கப்படவில்லை.",
        precautionsTitle: "முன்னெச்சரிக்கைகள்",
        precautions: ["மருந்துப் பெயர், வலிமை, வழிமுறைகளை அசல் மருந்துச் சீட்டுடன் சரிபார்க்கவும்; OCR தவறாகப் படிக்கலாம்.", "மருத்துவர் கூறிய வழிமுறைகளைப் பின்பற்றவும். இந்தச் செயலியின் அடிப்படையில் மருந்தைத் தொடங்கவோ நிறுத்தவோ மாற்றவோ வேண்டாம்.", "ஒவ்வாமை, பிற மருந்துகள், இடைவினைகள், தெளிவில்லாத வழிமுறைகள் குறித்து மருத்துவர் அல்லது மருந்தாளரிடம் கேளுங்கள்."]
      },
      te: {
        medicines: "సులభమైన మాటల్లో మందుల వివరాలు",
        medicineNote: "ఇవి ప్రిస్క్రిప్షన్ నుంచి చదివిన పేరు, బలం, సూచనలు. మందు దేనికోసం అన్నది ఈ యాప్ చెప్పదు. అసలు ప్రిస్క్రిప్షన్‌తో సరిపోల్చండి.",
        noMedicines: "మందుల వివరాలు స్పష్టంగా గుర్తించబడలేదు. OCR వచనం, అసలు ప్రిస్క్రిప్షన్‌ను తనిఖీ చేయండి.",
        medicineFields: { scannedLine: "ప్రిస్క్రిప్షన్ పంక్తి", strength: "బలం", form: "రూపం", instructions: "గుర్తించిన సూచనలు", notDetected: "పేరు/వివరాలు స్పష్టంగా గుర్తించలేదు" },
        food: "ఆహారం మరియు భోజనం",
        foodFallback: "స్పష్టమైన ఆహార సూచన కనిపించలేదు. వైద్యుడు వేరే ఆహారం చెప్పకపోతే కూరగాయలు, పండ్లు, తృణధాన్యాలు, ప్రోటీన్‌తో సమతుల్య ఆహారం తీసుకోండి.",
        foodNote: "ఆహారానికి సంబంధించిన వచనం ఉన్నట్లుగానే చూపించాం; అర్థాన్ని వివరించలేదు.",
        precautionsTitle: "జాగ్రత్తలు",
        precautions: ["మందు పేరు, బలం, సూచనలను అసలు ప్రిస్క్రిప్షన్‌తో తనిఖీ చేయండి; OCR తప్పుగా చదవవచ్చు.", "వైద్యుడి సూచనలను పాటించండి. ఈ యాప్ ఆధారంగా మందును ప్రారంభించవద్దు, ఆపవద్దు లేదా మార్చవద్దు.", "అలర్జీలు, ఇతర మందులు, పరస్పర ప్రభావాలు, అర్థంకాని సూచనల గురించి వైద్యుడు లేదా ఫార్మసిస్ట్‌ను అడగండి."]
      }
    }[language];
    const sections = [
      `<dl class="record-detail-metadata">
        <div><dt>Document type</dt><dd>${escapeHTML(type)}</dd></div>
        <div><dt>Date</dt><dd>${escapeHTML(shortDate(record.date))}</dd></div>
        <div><dt>Clinic / provider</dt><dd>${escapeHTML(record.provider || "Not noted")}</dd></div>
      </dl>`,
      record.imageId
        ? `<figure class="record-source-image"><figcaption>Uploaded document · ${escapeHTML(record.fileName || "Scanned image")}</figcaption><img src="/api/record-images/${encodeURIComponent(record.imageId)}" alt="Uploaded image for ${escapeHTML(record.title || "health record")}"></figure>`
        : "",
      record.diagnosis ? `<section class="record-detail-section"><h3>Notes copied from the document</h3><p>${escapeHTML(record.diagnosis)}</p></section>` : "",
      record.type === "prescription" ? `<section class="record-detail-section"><h3>${escapeHTML(prescriptionCopy.medicines)}</h3><p>${escapeHTML(prescriptionCopy.medicineNote)}</p>${renderPrescriptionMedicineCards(medicineLines, prescriptionCopy.medicineFields, prescriptionCopy.noMedicines)}</section>` : "",
      record.type === "prescription" ? `<section class="record-detail-section"><h3>${escapeHTML(prescriptionCopy.food)}</h3>${foodLines.length
        ? `<ul>${foodLines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>`
        : `<p>${escapeHTML(prescriptionCopy.foodFallback)}</p>`}<p class="record-detail-caution">${escapeHTML(prescriptionCopy.foodNote)}</p></section>` : "",
      record.type === "prescription" ? `<section class="record-detail-section"><h3>${escapeHTML(prescriptionCopy.precautionsTitle)}</h3><ul>${prescriptionCopy.precautions.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul></section>` : "",
      record.type !== "prescription" ? `<section class="record-detail-section"><h3>Medicine lines found</h3>${medicineLines.length
        ? `<ul>${medicineLines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>`
        : `<p>No medicine lines were identified.</p>`}</section>` : "",
      record.type === "lab" || testLines.length ? `<section class="record-detail-section"><h3>Report details extracted</h3>${testLines.length
        ? `<ul>${testLines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>`
        : `<p>No test-result lines were confidently identified. Check the OCR transcript below and compare it with the original report.</p>`}</section>` : "",
      `<details class="record-ocr-transcript"${testLines.length ? "" : " open"}><summary>Full OCR transcript</summary><pre>${escapeHTML(record.rawText || "No OCR text was saved for this record.")}</pre></details>`,
      `<p class="record-detail-caution">${record.type === "prescription"
        ? "OCR can misread medicine names, strengths, and directions. Confirm everything against the original prescription and ask your prescriber or pharmacist if anything is unclear."
        : "OCR can misread names, numbers, units, and reference ranges. These extracted details are not a diagnosis or clinical interpretation. Confirm them against the original document and ask a healthcare professional what they mean."}</p>`
    ];
    $("#record-details-title").textContent = record.title || "Report details";
    $("#record-details-content").innerHTML = sections.filter(Boolean).join("");
    $("#record-details-dialog").showModal();
  }

  function editRecord(id) {
    const record = state.records.find((item) => item.id === id);
    if (record) openReview(record);
  }

  async function deleteRecord(id) {
    const record = state.records.find((item) => item.id === id);
    if (!record || !window.confirm(`Delete "${record.title}" from this browser?`)) return;
    const previousState = JSON.parse(JSON.stringify(state));
    state.records = state.records.filter((item) => item.id !== id);
    if (await saveState(previousState)) {
      render();
      showToast("Record deleted from the local database.");
    }
  }

  function openProfile() {
    const profile = state.profile;
    $("#input-name").value = profile.name || "";
    $("#input-dob").value = profile.dob || "";
    $("#input-blood").value = profile.bloodGroup || "";
    $("#input-allergies").value = profile.allergies || "";
    $("#input-abha").value = profile.abhaId || "";
    elements.profileDialog.showModal();
  }

  function exportData() {
    const exportBundle = {
      resourceType: "Bundle",
      type: "collection",
      meta: { profile: "MY-SMR local export", fhirModel: "FHIR R4-inspired; not ABDM certified", exportedAt: new Date().toISOString() },
      entry: [
        {
          resource: {
            resourceType: "Patient", id: "local-patient",
            name: [{ text: state.profile.name || "" }],
            birthDate: state.profile.dob || undefined,
            extension: [
              ...(state.profile.bloodGroup ? [{ url: "local:condition/blood-group", valueString: state.profile.bloodGroup }] : []),
              ...(state.profile.allergies ? [{ url: "local:allergies", valueString: state.profile.allergies }] : []),
              ...(state.profile.abhaId ? [{ url: "local:mock-abha-id", valueString: state.profile.abhaId }] : [])
            ]
          }
        },
        ...state.records.map((record) => ({
          resource: {
            resourceType: "DocumentReference", id: record.id,
            status: "current", description: record.title,
            date: record.date ? new Date(`${record.date}T12:00:00`).toISOString() : record.createdAt,
            type: { text: typeLabels[record.type]?.en || "Other record" },
            ...(record.patientAge !== undefined ? { extension: [{ url: "local:patient-age-at-upload-years", valueDecimal: record.patientAge }] } : {}),
            content: [{ attachment: { contentType: record.mimeType, title: record.fileName || record.title } }],
            context: {
              ...(record.provider ? { sourcePatientInfo: { display: record.provider } } : {}),
              ...(record.diagnosis || record.medicines || record.tests ? { note: [record.diagnosis, record.medicines, record.tests].filter(Boolean).map((text) => ({ text })) } : {})
            },
            contained: [
              ...(record.tests ? [{ resourceType: "DiagnosticReport", status: "unknown", code: { text: "Extracted test results" }, conclusion: record.tests }] : []),
              ...(record.medicines ? [{ resourceType: "MedicationStatement", status: "unknown", medicationCodeableConcept: { text: record.medicines } }] : [])
            ]
          }
        }))
      ]
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: "application/fhir+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-smr-health-records.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("FHIR-inspired health data exported as JSON.");
  }

  $("#upload-trigger").addEventListener("click", () => {
    elements.uploadStatus.textContent = "";
    elements.uploadStatus.className = "upload-status";
    $("#record-language").value = language;
    elements.uploadDialog.showModal();
  });
  $("#insight-upload").addEventListener("click", () => $("#upload-trigger").click());
  function chooseUploadSource(input) {
    if (!$("#upload-patient-age").reportValidity()) return;
    input.click();
  }
  $("#choose-file").addEventListener("click", () => chooseUploadSource(elements.fileInput));
  $("#take-photo").addEventListener("click", () => chooseUploadSource(elements.cameraInput));
  $("#cancel-upload").addEventListener("click", () => elements.uploadDialog.close());
  async function processSelectedFiles(input) {
    const files = [...input.files];
    if (!files.length) return;
    if (!$("#upload-patient-age").reportValidity()) {
      input.value = "";
      return;
    }
    $("#choose-file").disabled = true;
    $("#take-photo").disabled = true;
    $("#cancel-upload").disabled = true;
    try {
      for (const file of files) {
        if (!elements.uploadDialog.open) elements.uploadDialog.showModal();
        elements.uploadStatus.className = "upload-status";
        elements.uploadStatus.textContent = `Preparing ${file.name}…`;
        try {
          const text = await extractText(file);
          if (!text.trim()) throw new Error("No readable text was found. Try a clearer image or type the information into a text file.");
          elements.uploadStatus.textContent = "Analyzing extracted details on the local backend…";
          const analyzedRecord = await analyzeDocument(file, text, $("#record-type").value, Number($("#upload-patient-age").value));
          if (file.type.startsWith("image/") || /\.(?:jpe?g|png)$/i.test(file.name)) {
            elements.uploadStatus.textContent = "Saving a compressed image preview on this device…";
            analyzedRecord.imageId = await saveRecordImagePreview(file);
          }
          elements.uploadDialog.close();
          openReview(analyzedRecord);
          await new Promise((resolve) => elements.recordDialog.addEventListener("close", resolve, { once: true }));
        } catch (error) {
          console.error("Unable to process uploaded record.", error);
          const message = error instanceof Error ? error.message : "Unable to process this file.";
          if (elements.uploadDialog.open) {
            elements.uploadStatus.className = "upload-status error";
            elements.uploadStatus.textContent = message;
          } else {
            showToast(message);
          }
        }
      }
    } finally {
      $("#choose-file").disabled = false;
      $("#take-photo").disabled = false;
      $("#cancel-upload").disabled = false;
      input.value = "";
    }
  }
  elements.fileInput.addEventListener("change", () => processSelectedFiles(elements.fileInput));
  elements.cameraInput.addEventListener("change", () => processSelectedFiles(elements.cameraInput));

  $("#record-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("#record-id").value;
    const existing = state.records.find((record) => record.id === id);
    const record = {
      ...(existing || {}),
      id: id || (crypto.randomUUID ? crypto.randomUUID() : `record-${Date.now()}-${Math.random().toString(36).slice(2)}`),
      title: $("#review-name").value.trim(),
      type: $("#review-type").value,
      date: $("#review-date").value,
      provider: $("#review-provider").value.trim(),
      diagnosis: $("#review-diagnosis").value.trim(),
      medicines: $("#review-medicines").value.trim(),
      tests: $("#review-tests").value.trim(),
      rawText: $("#review-raw").value,
      fileName: $("#record-file-name").value,
      mimeType: $("#record-mime-type").value || "text/plain",
      imageId: $("#record-image-id").value || existing?.imageId || "",
      patientAge: $("#record-patient-age").value === "" ? undefined : Number($("#record-patient-age").value),
      createdAt: existing?.createdAt || new Date().toISOString()
    };
    if (!record.title) return;
    const previousState = JSON.parse(JSON.stringify(state));
    if (existing) state.records = state.records.map((item) => item.id === id ? record : item);
    else state.records.push(record);
    if (await saveState(previousState)) {
      render();
      elements.recordDialog.close();
      openRecordDetails(record);
      showToast(existing ? "Record updated. Showing the saved details." : "Health record added. Showing the extracted details.");
    }
  });

  $("#close-record-details").addEventListener("click", () => $("#record-details-dialog").close());
  $("#close-record-details-button").addEventListener("click", () => $("#record-details-dialog").close());

  $("#profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const previousState = JSON.parse(JSON.stringify(state));
    state.profile = {
      ...state.profile,
      name: $("#input-name").value.trim() || "Your name",
      dob: $("#input-dob").value,
      bloodGroup: $("#input-blood").value,
      allergies: $("#input-allergies").value.trim(),
      abhaId: $("#input-abha").value.trim()
    };
    if (await saveState(previousState)) {
      render();
      elements.profileDialog.close();
      showToast("Health profile saved in the local database.");
    }
  });

  $("#edit-profile").addEventListener("click", openProfile);
  $("#edit-profile-secondary").addEventListener("click", openProfile);
  $("#profile-shortcut").addEventListener("click", openProfile);
  $("#export-data").addEventListener("click", exportData);
  $("#refresh-summary").addEventListener("click", () => { renderSummary(); showToast("Summary refreshed from your saved records."); });
  $("#refresh-recommendations").addEventListener("click", () => {
    const previousState = JSON.parse(JSON.stringify(state));
    state.recommendations = [];
    if (saveState(previousState)) {
      renderRecommendations();
      showToast("Recommendations refreshed from the latest records.");
    }
  });
  $("#language-toggle").addEventListener("change", (event) => {
    language = event.currentTarget.value;
    render();
  });
  $("#record-search-input").addEventListener("input", (event) => {
    recordSearch = event.currentTarget.value.trim().toLocaleLowerCase();
    renderRecords();
  });
  $("#record-search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    $("#records").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#auth-nav-link").addEventListener("click", (event) => {
    event.preventDefault();
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      window.location.assign("login.html");
    } catch (error) {
      console.error("Unable to end the demo sign-in session.", error);
      showToast("Could not sign out in this browser. Try closing this tab.");
    }
  });

  const emergencyPatterns = [
    /\b(chest pain|chest pressure|severe chest discomfort|difficulty breathing|trouble breathing|shortness of breath|cannot breathe|can't breathe|blue lips|unconscious|unresponsive|stroke|face drooping|slurred speech|sudden weakness|one-sided weakness|sudden numbness|one-sided numbness|seizure|convulsion|uncontrolled bleeding|heavy bleeding|vomiting blood|severe allergic reaction|throat swelling|tongue swelling|anaphylaxis|sudden vision loss|suddenly cannot see|suicidal thoughts?|want to kill myself|might hurt myself|self[- ]harm|can't keep myself safe)\b/i,
    /(सीने में दर्द|सीने में दबाव|सांस लेने में कठिनाई|सांस नहीं आ रही|सांस फूलना|बेहोश|अचेत|चेहरा लटक|बोलने में कठिनाई|अचानक कमजोरी|एक तरफ कमजोरी|अचानक सुन्न|दौरा|फिट आना|बहुत खून बहना|खून की उल्टी|जीभ में सूजन|गले में सूजन|खुद को नुकसान|आत्महत्या)/i,
    /(நெஞ்சு வலி|மூச்சு விட சிரமம்|மூச்சுத் திணறல்|மயக்கம்|நினைவிழப்பு|வலிப்பு|அதிக ரத்தப்போக்கு|தொண்டை வீக்கம்|திடீர் பார்வை இழப்பு|தற்கொலை|தன்னைத்தானே காயப்படுத்த)/i,
    /(ఛాతి నొప్పి|శ్వాస తీసుకోవడంలో ఇబ్బంది|ఊపిరి ఆడకపోవడం|స్పృహ కోల్పోవడం|అపస్మారక|మూర్ఛ|అధిక రక్తస్రావం|గొంతు వాపు|అకస్మాత్తుగా చూపు కోల్పోవడం|ఆత్మహత్య|నన్ను నేను హాని)/i
  ];
  const sameDayPatterns = [
    /\b(severe pain|very painful|high fever|fever over|persistent vomiting|can't keep (?:fluids|water) down|cannot keep (?:fluids|water) down|dehydration|getting worse quickly|rapidly worsening|confusion|very drowsy|not drinking|not urinating|blood in (?:my )?urine|sudden hearing loss|sudden severe eye pain)\b/i,
    /(तेज दर्द|बहुत तेज दर्द|बहुत तेज बुखार|लगातार उल्टी|पानी नहीं रुक रहा|पानी नहीं पी पा रहा|तेजी से बिगड़|भ्रम|बहुत सुस्ती|पेशाब नहीं हो रहा)/i,
    /(கடுமையான வலி|அதிக காய்ச்சல்|தொடர்ந்து வாந்தி|நீரிழப்பு|வேகமாக மோசமடை|மிகவும் சோர்வு)/i,
    /(తీవ్రమైన నొప్పి|అధిక జ్వరం|నిరంతర వాంతులు|నిర్జలీకరణ|త్వరగా తీవ్రమవ|చాలా మగత)/i
  ];

  function hasUnnegatedWarning(text, patterns) {
    for (const pattern of patterns) {
      const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
      for (const match of text.matchAll(new RegExp(pattern.source, flags))) {
        const precedingText = text.slice(Math.max(0, match.index - 55), match.index);
        const followingText = text.slice(match.index + match[0].length, match.index + match[0].length + 35);
        const negatedBefore = /(?:\b(?:no|not|without|denies|don't have|doesn't have)\b|नहीं|இல்லை|இல்ல|లేదు|కాదు)\s+(?:any\s+|कोई\s+)?(?:[\p{L}\w-]+\s+){0,2}$/iu.test(precedingText);
        const negatedAfter = /^(?:\s*(?:(?:is|are|was|were)\s+)?(?:not present|absent|denied)\b|\s*(?:नहीं|नही|இல்லை|இல்ல|లేదు|కాదు))/iu.test(followingText);
        if (!negatedBefore && !negatedAfter) return true;
      }
    }
    return false;
  }

  function hasEmergencyWarning(text) {
    return hasUnnegatedWarning(text, emergencyPatterns);
  }

  const symptomTopicPatterns = [
    { id: "fever", pattern: /\b(fever|febrile|temperature|chills)\b|बुखार|तापमान|காய்ச்சல்|జ్వరం/i },
    { id: "cold", pattern: /\b(cough|cold|runny nose|stuffy nose|congestion|sneez(?:e|ing)|flu)\b|खांसी|खाँसी|जुकाम|नाक बहना|இருமல்|சளி|దగ్గు|జలుబు/i },
    { id: "stomach", pattern: /\b(nausea|vomit(?:ing)?|diarrh?ea|loose stools?|stomach upset|stomach ache|abdominal pain)\b|उल्टी|दस्त|पेट दर्द|வாந்தி|வயிற்றுப்போக்கு|வயிற்று வலி|వాంతి|విరేచనాలు|కడుపు నొప్పి/i },
    { id: "headache", pattern: /\b(headache|migraine|head pain)\b|सिरदर्द|सिर दर्द|தலைவலி|తలనొప్పి/i },
    { id: "throat", pattern: /\b(sore throat|throat pain|painful swallowing)\b|गले में दर्द|गला खराब|தொண்டை வலி|தொண்டை கரகரப்பு|గొంతు నొప్పి/i },
    { id: "constipation", pattern: /\b(constipat(?:ed|ion)|hard stools?)\b|कब्ज़|कब्ज|மலச்சிக்கல்|మலబద్ధకం/i }
    ,{ id: "breathing", pattern: /\b(wheez(?:e|ing)|breathless(?:ness)?|shortness of breath|rapid breathing|noisy breathing)\b|घरघराहट|सांस फूलना|साँस फूलना|மூச்சிரைப்பு|வீசிங்|వీజింగ్|ఊపిరి తీసుకోవడంలో ఇబ్బంది/i, group: "breathing", labels: { en: "Wheezing or breathing changes", hi: "घरघराहट या साँस में बदलाव", ta: "மூச்சிரைப்பு அல்லது சுவாச மாற்றம்", te: "గురక లేదా శ్వాసలో మార్పు" } },
    { id: "heart", pattern: /\b(palpitations?|racing heart|fast heartbeat|irregular heartbeat|skipped beats?)\b|दिल की धड़कन तेज|धड़कन अनियमित|இதயத் துடிப்பு|வேகமான இதயத் துடிப்பு|గుండె దడ|గుండె వేగంగా కొట్టుకోవడం/i, group: "general", labels: { en: "Heartbeat changes or palpitations", hi: "दिल की धड़कन में बदलाव", ta: "இதயத் துடிப்பில் மாற்றம்", te: "గుండె చప్పుడులో మార్పు" } },
    { id: "dizziness", pattern: /\b(dizz(?:y|iness)|lightheaded|vertigo|off balance|balance problems?)\b|चक्कर|संतुलन की समस्या|தலைச்சுற்றல்|மயக்கம்|சமநிலை பிரச்சினை|తల తిరగడం|మైకం|సమతుల్యత సమస్య/i, group: "general", labels: { en: "Dizziness or balance problems", hi: "चक्कर या संतुलन की समस्या", ta: "தலைச்சுற்றல் அல்லது சமநிலைப் பிரச்சினை", te: "తలతిరగడం లేదా సమతుల్యత సమస్య" } },
    { id: "neurological", pattern: /\b(numb(?:ness)?|tingl(?:e|ing)|pins and needles|tremor|shak(?:y|ing)|muscle twitch(?:ing)?)\b|सुन्नपन|झुनझुनी|कंपकंपी|கை மரத்தல்|மரத்துப் போதல்|கூச்ச உணர்வு|நடுக்கம்|తిమ్మిరి|చిమ్మటలు|వణుకు/i, group: "movement", labels: { en: "Numbness, tingling, or tremor", hi: "सुन्नपन, झुनझुनी या कंपन", ta: "மரத்தல், கூச்சம் அல்லது நடுக்கம்", te: "తిమ్మిరి, చిమ్మటలు లేదా వణుకు" } },
    { id: "eye", pattern: /\b(eye pain|red eyes?|itchy eyes|watery eyes|dry eyes|blurred vision|blurry vision|double vision|light sensitivity|eye discharge)\b|आँख में दर्द|आंख में दर्द|लाल आंख|लाल आँख|धुंधला दिखना|दोहरा दिखना|आंखों में खुजली|கண் வலி|சிவந்த கண்|மங்கலான பார்வை|இரட்டைப் பார்வை|கண் அரிப்பு|కంటి నొప్పి|కళ్ళు ఎర్రబడటం|మసక చూపు|రెండు కనిపించడం|కంటి దురద/i, group: "eye", labels: { en: "Eye or vision symptoms", hi: "आँख या दृष्टि के लक्षण", ta: "கண் அல்லது பார்வை அறிகுறிகள்", te: "కంటి లేదా చూపు లక్షణాలు" } },
    { id: "ear", pattern: /\b(earache|ear pain|ringing in (?:the )?ears?|tinnitus|hearing loss|muffled hearing|ear discharge)\b|कान दर्द|कान में दर्द|कान बजना|सुनाई कम देना|காது வலி|காதில் ஒலி|கேள்வித்திறன் குறைவு|చెవి నొప్పి|చెవిలో శబ్దం|వినికిడి తగ్గడం/i, group: "ear", labels: { en: "Ear or hearing symptoms", hi: "कान या सुनने के लक्षण", ta: "காது அல்லது கேள்வித்திறன் அறிகுறிகள்", te: "చెవి లేదా వినికిడి లక్షణాలు" } },
    { id: "skin", pattern: /\b(rash|itch(?:y|ing)(?!\s+eyes?)|hives|skin redness|skin irritation|dry skin|skin lesion|blister(?:s|ing)?)\b|चकत्ते|दाने|खुजली|त्वचा पर लालिमा|छाले|சொறி|அரிப்பு|தோல் சிவத்தல்|கொப்புளம்|దద్దుర్లు|దురద|చర్మం ఎర్రబడటం|బొబ్బలు/i, group: "skin", labels: { en: "Skin changes, rash, or itching", hi: "त्वचा में बदलाव, दाने या खुजली", ta: "தோல் மாற்றம், சொறி அல்லது அரிப்பு", te: "చర్మ మార్పులు, దద్దుర్లు లేదా దురద" } },
    { id: "allergy", pattern: /\b(allerg(?:y|ic)|seasonal allergy|food reaction)\b|एलर्जी|ஒவ்வாமை|அலர்ஜி|అలర్జీ|అలెర్జీ/i, group: "skin", labels: { en: "Possible allergy symptoms", hi: "संभावित एलर्जी के लक्षण", ta: "ஒவ்வாமை அறிகுறிகள்", te: "అలర్జీ లక్షణాలు" } },
    { id: "urinary", pattern: /\b(painful urination|pain when urinating|burning (?:when|while) urinating|burning urination|frequent urination|urinary urgency|urinary frequency|incontinence|trouble urinating|difficulty urinating)\b|पेशाब में जलन|पेशाब में दर्द|बार-बार पेशाब|पेशाब रुकना|मूत्र असंयम|சிறுநீர் கழிக்க வலி|சிறுநீர் எரிச்சல்|அடிக்கடி சிறுநீர்|சிறுநீர் கழிக்க சிரமம்|మూత్రంలో మంట|మూత్ర విసర్జనలో నొప్పి|తరచుగా మూత్రం|మూత్రం రావడంలో ఇబ్బంది/i, group: "urinary", labels: { en: "Urinary symptoms", hi: "पेशाब से जुड़े लक्षण", ta: "சிறுநீர் அறிகுறிகள்", te: "మూత్ర సంబంధిత లక్షణాలు" } },
    { id: "urine-blood", pattern: /\b(blood in (?:my )?urine|bloody urine|dark urine|cloudy urine)\b|पेशाब में खून|मूत्र में खून|சிறுநீரில் இரத்தம்|மூத்திரத்தில் இரத்தம்|మూత్రంలో రక్తం/i, group: "urinary", labels: { en: "Urine color or blood changes", hi: "पेशाब के रंग या खून में बदलाव", ta: "சிறுநீரின் நிறம் அல்லது இரத்த மாற்றம்", te: "మూత్రం రంగు లేదా రక్త మార్పు" } },
    { id: "mouth", pattern: /\b(toothache|tooth pain|mouth ulcer|mouth sore|gum pain|bleeding gums|bad breath|dry mouth)\b|दांत दर्द|दाँत दर्द|मुंह के छाले|मसूड़ों में दर्द|मसूड़ों से खून|பல் வலி|வாய் புண்|ஈறு வலி|ஈறுகளில் இரத்தம்|வாய் உலர்வு|పంటి నొప్పి|నోటి పుండ్లు|చిగుళ్ల నొప్పి|చిగుళ్ల రక్తస్రావం|నోరు ఎండిపోవడం/i, group: "mouth", labels: { en: "Mouth, teeth, or gum symptoms", hi: "मुँह, दाँत या मसूड़ों के लक्षण", ta: "வாய், பல் அல்லது ஈறு அறிகுறிகள்", te: "నోరు, పళ్లు లేదా చిగుళ్ల లక్షణాలు" } },
    { id: "movement", pattern: /\b(back pain|lower back pain|neck pain|joint pain|muscle pain|body aches?|stiffness|muscle cramps?|limping)\b|पीठ दर्द|कमर दर्द|गर्दन दर्द|जोड़ों का दर्द|मांसपेशियों में दर्द|शरीर दर्द|जकड़न|முதுகு வலி|மூட்டு வலி|தசை வலி|உடல் வலி|விறைப்பு|వీపు నొప్పి|నడుము నొప్పి|మెడ నొప్పి|కీళ్ల నొప్పి|కండరాల నొప్పి|ఒళ్ళు నొప్పులు|బిగుతు/i, group: "movement", labels: { en: "Back, joint, or muscle symptoms", hi: "पीठ, जोड़ या मांसपेशियों के लक्षण", ta: "முதுகு, மூட்டு அல்லது தசை அறிகுறிகள்", te: "వీపు, కీళ్లు లేదా కండరాల లక్షణాలు" } },
    { id: "menstrual", pattern: /\b(period pain|painful periods?|irregular periods?|missed period|heavy period|menstrual cramps?|vaginal discharge|pelvic pain)\b|मासिक धर्म में दर्द|अनियमित माहवारी|माहवारी में देरी|अधिक रक्तस्राव|योनि स्राव|पेल्विक दर्द|மாதவிடாய் வலி|ஒழுங்கற்ற மாதவிடாய்|மாதவிடாய் தாமதம்|அதிக இரத்தப்போக்கு|யோனி வெளியேற்றம்|இடுப்பு வலி|నెలసరి నొప్పి|క్రమరహిత నెలసరి|నెలసరి ఆలస్యం|అధిక రక్తస్రావం|యోని స్రావం|కటి నొప్పి/i, group: "reproductive", labels: { en: "Menstrual or pelvic symptoms", hi: "माहवारी या पेल्विक लक्षण", ta: "மாதவிடாய் அல்லது இடுப்பு அறிகுறிகள்", te: "నెలసరి లేదా కటి లక్షణాలు" } },
    { id: "pregnancy", pattern: /\b(pregnan(?:t|cy)|morning sickness|pregnancy nausea)\b|गर्भावस्था|गर्भवती|கர்ப்பம்|கர்ப்பிணி|గర్భం|గర్భిణి/i, group: "reproductive", labels: { en: "Pregnancy-related concerns", hi: "गर्भावस्था से जुड़ी चिंताएँ", ta: "கர்ப்பம் தொடர்பான கவலைகள்", te: "గర్భధారణ సంబంధిత ఆందోళనలు" } },
    { id: "fatigue", pattern: /\b(fatigue|tired(?:ness)?|low energy|exhaust(?:ed|ion)|weakness|loss of appetite|poor appetite|weight loss|weight gain|night sweats?)\b|थकान|कमजोरी|भूख न लगना|वजन कम होना|वज़न घटना|वजन बढ़ना|रात में पसीना|சோர்வு|களைப்பு|பசியின்மை|எடை குறைவு|எடை அதிகரிப்பு|இரவில் வியர்வை|అలసట|నీరసం|ఆకలి లేకపోవడం|బరువు తగ్గడం|బరువు పెరగడం|రాత్రి చెమటలు/i, group: "general", labels: { en: "Energy, appetite, or weight changes", hi: "ऊर्जा, भूख या वजन में बदलाव", ta: "ஆற்றல், பசி அல்லது எடை மாற்றம்", te: "శక్తి, ఆకలి లేదా బరువు మార్పు" } },
    { id: "sleep", pattern: /\b(insomnia|trouble sleeping|difficulty sleeping|sleep problems?|sleepy all the time|excessive sleepiness)\b|नींद न आना|सोने में परेशानी|बहुत नींद आना|தூக்கமின்மை|தூங்குவதில் சிரமம்|அதிக தூக்கம்|నిద్రలేమి|నిద్ర సమస్య|అధిక నిద్ర/i, group: "general", labels: { en: "Sleep changes", hi: "नींद में बदलाव", ta: "தூக்க மாற்றங்கள்", te: "నిద్రలో మార్పులు" } },
    { id: "mental", pattern: /\b(anxiety|anxious|panic attack|panic attacks|low mood|feeling depressed|depression|feeling stressed|stress|irritable|mood swings?)\b|चिंता|घबराहट|तनाव|उदासी|अवसाद|மனஅழுத்தம்|பதட்டம்|கவலை|மனச்சோர்வு|மனநிலை மாற்றம்|ఆందోళన|భయం|ఒత్తిడి|నిరాశ|కుంగుబాటు|మానసిక స్థితి మార్పు/i, group: "mental", labels: { en: "Mood, stress, or anxiety symptoms", hi: "मनोदशा, तनाव या चिंता के लक्षण", ta: "மனநிலை, மனஅழுத்தம் அல்லது பதட்ட அறிகுறிகள்", te: "మానసిక స్థితి, ఒత్తిడి లేదా ఆందోళన లక్షణాలు" } },
    { id: "swelling", pattern: /\b(swelling|swollen|edema|oedema|puffy ankles?|puffy feet|swollen legs?)\b|सूजन|पैरों में सूजन|चेहरे पर सूजन|வீக்கம்|கால் வீக்கம்|முக வீக்கம்|వాపు|కాళ్ల వాపు|ముఖం వాపు/i, group: "general", labels: { en: "Swelling", hi: "सूजन", ta: "வீக்கம்", te: "వాపు" } },
    { id: "bleeding", pattern: /\b(easy bruising|bruis(?:e|es|ing)|nosebleed|nose bleed|unusual bleeding|bleeding easily)\b|नील पड़ना|आसानी से खून बहना|नाक से खून|असामान्य रक्तस्राव|எளிதில் காயம்|மூக்கில் இரத்தம்|அசாதாரண இரத்தப்போக்கு|సులభంగా గాయాలు|ముక్కు రక్తం|అసాధారణ రక్తస్రావం/i, group: "general", labels: { en: "Unusual bruising or bleeding", hi: "असामान्य नील या रक्तस्राव", ta: "அசாதாரண காயம் அல்லது இரத்தப்போக்கு", te: "అసాధారణ గాయాలు లేదా రక్తస్రావం" } }
  ];
  const symptomAdvice = {
    en: {
      info: "General information",
      description: "Your description mentions {topics}. Many different things can cause these symptoms; this guide cannot determine the cause or diagnose an illness.",
      unmatched: "No supported symptom group was recognized. Note when symptoms started, how they change, and any other symptoms; a healthcare professional can assess the full picture.",
      care: "General comfort and food ideas",
      medicines: "Medicine safety",
      medicineText: "This tool cannot safely choose a medicine or dose from symptoms alone. Ask a clinician or pharmacist what is appropriate, especially for a child, pregnancy, allergies, long-term conditions, or other medicines. Do not use someone else's prescription or start antibiotics on your own.",
      groups: {
        general: ["Note when symptoms began and any changes or triggers. Rest and drink normally if able, unless a clinician has advised otherwise. Seek professional advice if symptoms persist, worsen, or concern you."],
        breathing: ["Avoid smoke or other irritants and rest in a comfortable position. Severe or worsening breathing difficulty is an emergency; seek help immediately."],
        eye: ["Avoid rubbing your eyes and note any vision changes. Sudden vision loss, severe eye pain, or an eye injury needs urgent medical care."],
        ear: ["Avoid putting objects or unprescribed drops in the ear. Sudden hearing loss, severe pain, or discharge should be assessed by a healthcare professional."],
        skin: ["Avoid a suspected new irritant and note when the skin change began. Rapidly spreading rash, facial/throat swelling, or breathing trouble needs urgent help."],
        urinary: ["Note changes in urine, pain, or frequency; drink normally unless you have a fluid restriction. Blood in urine, inability to urinate, or fever with urinary pain needs prompt medical advice."],
        mouth: ["Choose comfortable soft foods and keep up gentle oral hygiene. Facial swelling, severe pain, or trouble swallowing or breathing needs urgent care."],
        movement: ["Rest the affected area and avoid forcing painful movement. New weakness, major injury, or severe/worsening pain needs prompt professional assessment."],
        reproductive: ["Record timing and changes; a clinician can assess persistent or concerning symptoms. Severe pelvic pain, heavy bleeding, or pregnancy-related bleeding needs prompt medical advice."],
        mental: ["Consider talking with someone you trust and a healthcare professional. If you may hurt yourself or someone else, seek immediate help from emergency services or a trusted person nearby."]
      },
      next: "When to get help",
      topics: {
        fever: ["Fever or chills", ["Rest and drink fluids regularly if able; take small sips if feeling unwell.", "Choose comfortable, easy-to-eat foods; do not force food.", "Keep a note of the temperature and when it was measured."]],
        cold: ["Cough or cold symptoms", ["Rest and drink water or warm fluids if comfortable.", "Avoid smoke and other irritants; choose soft foods if your throat is sore.", "Breathing difficulty, blue lips, or rapidly worsening symptoms need emergency help."]],
        stomach: ["Nausea, vomiting, or loose stools", ["Take small, frequent sips of safe fluids; if using oral rehydration solution, prepare it exactly as the packet says.", "When ready to eat, try small portions of familiar, simple foods; do not force food.", "Very little urine, blood in vomit or stool, severe belly pain, or inability to keep fluids down needs prompt medical advice."]],
        headache: ["Headache", ["Drink water if thirsty and avoid skipping regular meals.", "Rest in a calm, dim room if that feels comfortable.", "A sudden, extremely severe headache or one with weakness, confusion, fainting, or vision/speech changes needs emergency help."]],
        throat: ["Sore throat", ["Sip warm or cool fluids, whichever feels soothing.", "Choose soft foods that are comfortable to swallow.", "Trouble breathing or being unable to swallow fluids needs urgent medical help."]],
        constipation: ["Constipation", ["Drink water regularly unless you have been told to restrict fluids.", "Gradually include fiber-rich foods such as vegetables, fruit, beans, and whole grains.", "Severe belly pain, vomiting, or a swollen abdomen needs prompt medical advice."]]
      },
      urgent: "Seek emergency help now. Call 112 in India or your local emergency number, or go to an emergency department. Do not wait for this tool.",
      infant: "A fever in a baby younger than 3 months needs urgent medical assessment now. Contact a pediatric clinician or emergency service.",
      sameDay: "Contact a healthcare professional today. Get urgent help sooner if symptoms become severe or worsen quickly.",
      young: "For a child under 5, contact a caregiver or pediatric clinician if symptoms are concerning, persistent, or worsening.",
      older: "For an adult 65 or older, seek professional advice for new, persistent, or worsening symptoms.",
      routine: "If symptoms are mild and improving, monitor them. Contact a healthcare professional if they persist, worsen, or worry you."
    },
    hi: {
      info: "सामान्य जानकारी",
      description: "आपके विवरण में {topics} जैसे लक्षण हैं। इनके कई कारण हो सकते हैं; यह मार्गदर्शिका कारण नहीं बता सकती और निदान नहीं करती।",
      unmatched: "कोई समर्थित लक्षण समूह पहचाना नहीं गया। कब शुरू हुआ, कैसे बदल रहा है और अन्य लक्षण नोट करें; स्वास्थ्य विशेषज्ञ पूरी स्थिति का आकलन कर सकते हैं।",
      care: "आराम और भोजन के सामान्य सुझाव",
      medicines: "दवा सुरक्षा",
      medicineText: "यह टूल केवल लक्षणों से सुरक्षित रूप से दवा या खुराक नहीं चुन सकता। डॉक्टर या फार्मासिस्ट से पूछें—विशेषकर बच्चे, गर्भावस्था, एलर्जी, पुरानी बीमारी या अन्य दवाओं की स्थिति में। किसी और की दवा न लें और स्वयं एंटीबायोटिक शुरू न करें।",
      groups: {
        general: ["लक्षण कब शुरू हुए और उनमें क्या बदलाव या कारण दिखते हैं, लिखें। यदि संभव हो तो सामान्य रूप से आराम और तरल लें, जब तक डॉक्टर ने मना न किया हो। लक्षण बने रहें, बिगड़ें या चिंता हो तो स्वास्थ्य विशेषज्ञ से संपर्क करें।"],
        breathing: ["धुएँ और जलन पैदा करने वाली चीज़ों से बचें और आरामदायक स्थिति में विश्राम करें। साँस लेने में गंभीर या बढ़ती कठिनाई आपातकाल है; तुरंत मदद लें।"],
        eye: ["आँखें न रगड़ें और दृष्टि में बदलाव पर ध्यान दें। अचानक दिखाई न देना, तेज आँख दर्द या आँख में चोट पर तुरंत चिकित्सा लें।"],
        ear: ["कान में वस्तु या बिना सलाह की बूंदें न डालें। अचानक सुनाई कम देना, तेज दर्द या स्राव पर स्वास्थ्य विशेषज्ञ से जाँच कराएँ।"],
        skin: ["नए संदिग्ध संपर्क से बचें और त्वचा में बदलाव कब शुरू हुआ लिखें। तेजी से फैलते दाने, चेहरे/गले में सूजन या साँस की समस्या पर तुरंत मदद लें।"],
        urinary: ["पेशाब के रंग, दर्द या बारंबारता में बदलाव लिखें; तरल सीमित करने की सलाह हो तो उसका पालन करें। पेशाब में खून, पेशाब न कर पाना या दर्द के साथ बुखार पर शीघ्र सलाह लें।"],
        mouth: ["आरामदायक नरम भोजन लें और धीरे से मुँह की सफाई करें। चेहरे में सूजन, तेज दर्द या निगलने/साँस लेने में कठिनाई पर तुरंत मदद लें।"],
        movement: ["प्रभावित हिस्से को आराम दें और दर्द वाली गति ज़बरदस्ती न करें। नई कमजोरी, बड़ी चोट या तेज/बढ़ते दर्द पर शीघ्र चिकित्सकीय जाँच कराएँ।"],
        reproductive: ["समय और बदलाव लिखें; बने रहने या चिंता वाले लक्षणों का स्वास्थ्य विशेषज्ञ आकलन कर सकते हैं। तेज पेल्विक दर्द, अधिक रक्तस्राव या गर्भावस्था में रक्तस्राव पर शीघ्र मदद लें।"],
        mental: ["किसी भरोसेमंद व्यक्ति और स्वास्थ्य विशेषज्ञ से बात करने पर विचार करें। यदि खुद को या किसी अन्य को नुकसान पहुँचने का खतरा हो, तो तुरंत आपातकालीन सेवा या पास के भरोसेमंद व्यक्ति से मदद लें।"]
      },
      next: "कब मदद लें",
      topics: {
        fever: ["बुखार या ठंड लगना", ["आराम करें और यदि संभव हो तो नियमित रूप से तरल लें; अस्वस्थ लगने पर छोटे घूँट लें।", "आसानी से खाए जाने वाले भोजन चुनें; ज़बरदस्ती न खिलाएँ।", "तापमान और उसे मापने का समय लिखें।"]],
        cold: ["खाँसी या जुकाम", ["आराम करें और सहज लगे तो पानी या गुनगुने तरल लें।", "धुएँ और जलन पैदा करने वाली चीज़ों से बचें; गला दुखे तो नरम भोजन लें।", "साँस लेने में कठिनाई, होंठ नीले पड़ना या तेजी से बिगड़ना आपातकालीन स्थिति है।"]],
        stomach: ["मतली, उल्टी या दस्त", ["सुरक्षित तरल के छोटे-छोटे घूँट बार-बार लें; ORS लें तो पैकेट के निर्देशों के अनुसार ही घोलें।", "खाने का मन हो तो परिचित, सादा भोजन थोड़ी मात्रा में लें; ज़बरदस्ती न खाएँ।", "बहुत कम पेशाब, उल्टी/मल में खून, तेज पेट दर्द या तरल न रुकना हो तो तुरंत चिकित्सकीय सलाह लें।"]],
        headache: ["सिरदर्द", ["प्यास लगे तो पानी पिएँ और नियमित भोजन न छोड़ें।", "सुविधाजनक हो तो शांत, कम रोशनी वाली जगह पर आराम करें।", "अचानक बहुत तेज सिरदर्द या साथ में कमजोरी, भ्रम, बेहोशी, दृष्टि/बोलने में बदलाव पर आपातकालीन मदद लें।"]],
        throat: ["गले में दर्द", ["जो आरामदायक लगे, ऐसे गुनगुने या ठंडे तरल के घूँट लें।", "निगलने में सहज नरम भोजन चुनें।", "साँस लेने या तरल निगलने में कठिनाई पर तुरंत चिकित्सकीय मदद लें।"]],
        constipation: ["कब्ज़", ["यदि तरल सीमित करने को नहीं कहा गया है, तो नियमित पानी पिएँ।", "सब्ज़ी, फल, दाल और साबुत अनाज जैसे रेशेदार भोजन धीरे-धीरे बढ़ाएँ।", "तेज पेट दर्द, उल्टी या पेट फूलने पर शीघ्र चिकित्सकीय सलाह लें।"]]
      },
      urgent: "अभी आपातकालीन सहायता लें। भारत में 112 या अपने स्थानीय आपातकालीन नंबर पर कॉल करें अथवा आपातकालीन विभाग जाएँ। इस टूल की प्रतीक्षा न करें।",
      infant: "3 महीने से छोटे शिशु में बुखार होने पर अभी तत्काल चिकित्सकीय जाँच ज़रूरी है। बाल-चिकित्सक या आपातकालीन सेवा से संपर्क करें।",
      sameDay: "आज ही स्वास्थ्य विशेषज्ञ से संपर्क करें। लक्षण गंभीर हों या तेजी से बिगड़ें तो तुरंत आपातकालीन सहायता लें।",
      young: "5 वर्ष से कम उम्र के बच्चे के लक्षण चिंताजनक हों, बने रहें या बिगड़ें तो देखभालकर्ता या बाल-चिकित्सक से संपर्क करें।",
      older: "65 वर्ष या अधिक उम्र में नए, बने रहने वाले या बिगड़ते लक्षणों पर स्वास्थ्य विशेषज्ञ से सलाह लें।",
      routine: "लक्षण हल्के हों और सुधर रहे हों तो उन पर नज़र रखें। बने रहने, बिगड़ने या चिंता होने पर स्वास्थ्य विशेषज्ञ से संपर्क करें।"
    },
    ta: {
      info: "பொதுவான தகவல்",
      description: "நீங்கள் குறிப்பிட்டதில் {topics} போன்ற அறிகுறிகள் உள்ளன. இவற்றுக்குப் பல காரணங்கள் இருக்கலாம்; இந்த வழிகாட்டி காரணத்தைக் கண்டறியவோ நோயறிதல் செய்யவோ முடியாது.",
      unmatched: "ஆதரிக்கப்படும் அறிகுறி வகை அடையாளம் காணப்படவில்லை. எப்போது தொடங்கியது, எப்படி மாறுகிறது, வேறு அறிகுறிகள் உள்ளனவா என்பதைக் குறித்துக் கொள்ளுங்கள்; மருத்துவ நிபுணர் முழுமையாக மதிப்பிடுவார்.",
      care: "பொதுவான ஓய்வு மற்றும் உணவு யோசனைகள்",
      medicines: "மருந்துப் பாதுகாப்பு",
      medicineText: "அறிகுறிகளின் அடிப்படையில் இந்தக் கருவி மருந்தையோ அளவையோ பாதுகாப்பாகத் தேர்வு செய்ய முடியாது. குறிப்பாக குழந்தை, கர்ப்பம், ஒவ்வாமை, நீண்டகால நோய் அல்லது பிற மருந்துகள் இருந்தால் மருத்துவர் அல்லது மருந்தாளரிடம் கேளுங்கள். பிறரின் மருந்தைப் பயன்படுத்தவோ தானாகவே ஆன்டிபயாட்டிக் தொடங்கவோ வேண்டாம்.",
      groups: {
        general: ["அறிகுறிகள் எப்போது தொடங்கின, என்ன மாற்றம் அல்லது தூண்டுதல் உள்ளது என்பதைக் குறித்துக் கொள்ளுங்கள். மருத்துவர் திரவத்தை கட்டுப்படுத்தச் சொல்லவில்லை எனில் வழக்கம்போல் ஓய்வெடுத்து திரவம் குடிக்கவும். அறிகுறிகள் நீடித்தால், மோசமானால் அல்லது கவலை இருந்தால் மருத்துவ நிபுணரை அணுகுங்கள்."],
        breathing: ["புகை மற்றும் எரிச்சலூட்டும் பொருட்களைத் தவிர்த்து வசதியான நிலையில் ஓய்வெடுக்கவும். மூச்சு விடுவதில் கடுமையான அல்லது அதிகரிக்கும் சிரமம் அவசரநிலை; உடனே உதவி பெறுங்கள்."],
        eye: ["கண்களைத் தேய்க்க வேண்டாம்; பார்வை மாற்றங்களைக் கவனிக்கவும். திடீர் பார்வை இழப்பு, கடுமையான கண் வலி அல்லது கண் காயம் இருந்தால் உடனடி மருத்துவ உதவி பெறுங்கள்."],
        ear: ["காதில் பொருட்களையோ பரிந்துரைக்கப்படாத சொட்டுகளையோ விட வேண்டாம். திடீர் கேள்வித்திறன் குறைவு, கடுமையான வலி அல்லது சுரப்பு இருந்தால் மருத்துவ நிபுணரிடம் பரிசோதிக்கவும்."],
        skin: ["புதிதாகத் தொடங்கியதாக சந்தேகிக்கும் பொருளைத் தவிர்த்து, தோல் மாற்றம் எப்போது தொடங்கியது என்பதைக் குறிக்கவும். வேகமாகப் பரவும் சொறி, முகம்/தொண்டை வீக்கம் அல்லது மூச்சுச் சிரமம் இருந்தால் உடனடி உதவி பெறுங்கள்."],
        urinary: ["சிறுநீரின் நிறம், வலி அல்லது அடிக்கடி கழித்தல் மாற்றங்களைக் குறித்துக் கொள்ளுங்கள்; திரவக் கட்டுப்பாடு இருந்தால் அதைப் பின்பற்றவும். சிறுநீரில் இரத்தம், சிறுநீர் கழிக்க முடியாமை அல்லது வலியுடன் காய்ச்சல் இருந்தால் விரைவாக மருத்துவ ஆலோசனை பெறுங்கள்."],
        mouth: ["வசதியான மென்மையான உணவைத் தேர்ந்தெடுத்து மெதுவாக வாயைச் சுத்தம் செய்யவும். முக வீக்கம், கடுமையான வலி அல்லது விழுங்க/மூச்சுவிட சிரமம் இருந்தால் உடனடி உதவி பெறுங்கள்."],
        movement: ["பாதிக்கப்பட்ட பகுதியை ஓய்வெடுக்கச் செய்து வலிக்கும் இயக்கத்தை வற்புறுத்த வேண்டாம். புதிய பலவீனம், பெரிய காயம் அல்லது கடுமையான/அதிகரிக்கும் வலி இருந்தால் விரைவாக மருத்துவ மதிப்பீடு பெறுங்கள்."],
        reproductive: ["நேரம் மற்றும் மாற்றங்களைக் குறித்துக் கொள்ளுங்கள்; நீடிக்கும் அல்லது கவலைக்குரிய அறிகுறிகளை மருத்துவ நிபுணர் மதிப்பிடலாம். கடுமையான இடுப்பு வலி, அதிக இரத்தப்போக்கு அல்லது கர்ப்பகால இரத்தப்போக்கு இருந்தால் விரைவாக மருத்துவ ஆலோசனை பெறுங்கள்."],
        mental: ["நம்பகமான ஒருவருடனும் மருத்துவ நிபுணருடனும் பேசலாம். உங்களுக்கோ வேறொருவருக்கோ தீங்கு ஏற்படும் ஆபத்து இருந்தால் உடனடியாக அவசர சேவை அல்லது அருகிலுள்ள நம்பகமான நபரிடம் உதவி பெறுங்கள்."]
      },
      next: "எப்போது உதவி பெற வேண்டும்",
      topics: {
        fever: ["காய்ச்சல் அல்லது குளிர் நடுக்கம்", ["ஓய்வெடுத்து, முடிந்தால் அடிக்கடி திரவம் குடிக்கவும்; உடல்நலம் சரியில்லையெனில் சிறு மிடறுகளாகக் குடிக்கவும்.", "எளிதாக உண்ணக்கூடிய உணவைத் தேர்ந்தெடுக்கவும்; கட்டாயப்படுத்தி உண்ண வேண்டாம்.", "வெப்பநிலையையும் அளந்த நேரத்தையும் பதிவு செய்யவும்."]],
        cold: ["இருமல் அல்லது சளி", ["ஓய்வெடுத்து, வசதியாக இருந்தால் தண்ணீர் அல்லது வெதுவெதுப்பான திரவம் குடிக்கவும்.", "புகை மற்றும் எரிச்சலூட்டும் பொருட்களைத் தவிர்க்கவும்; தொண்டை வலித்தால் மென்மையான உணவைத் தேர்ந்தெடுக்கவும்.", "மூச்சுத் திணறல், உதடு நீலமாதல் அல்லது வேகமாக மோசமாதல் அவசரநிலை."]],
        stomach: ["குமட்டல், வாந்தி அல்லது வயிற்றுப்போக்கு", ["பாதுகாப்பான திரவங்களைச் சிறு மிடறுகளாக அடிக்கடி குடிக்கவும்; ORS பயன்படுத்தினால் பொட்டல வழிமுறையின்படி சரியாகக் கலக்கவும்.", "உண்ணத் தயாராக இருக்கும்போது எளிய பழக்கமான உணவைச் சிறு அளவில் எடுத்துக் கொள்ளுங்கள்; கட்டாயப்படுத்த வேண்டாம்.", "சிறுநீர் மிகவும் குறைதல், வாந்தி/மலத்தில் ரத்தம், கடுமையான வயிற்றுவலி அல்லது திரவம் தங்காமை ஏற்பட்டால் விரைவாக மருத்துவ ஆலோசனை பெறுங்கள்."]],
        headache: ["தலைவலி", ["தாகமாக இருந்தால் தண்ணீர் குடித்து, வழக்கமான உணவைத் தவிர்க்க வேண்டாம்.", "வசதியாக இருந்தால் அமைதியான, மங்கலான அறையில் ஓய்வெடுக்கவும்.", "திடீர் கடுமையான தலைவலி அல்லது பலவீனம், குழப்பம், மயக்கம், பார்வை/பேச்சு மாற்றம் இருந்தால் அவசர உதவி பெறுங்கள்."]],
        throat: ["தொண்டை வலி", ["இதமாக இருந்தால் வெதுவெதுப்பான அல்லது குளிர்ந்த திரவங்களைச் சிறு மிடறுகளாகக் குடிக்கவும்.", "விழுங்க வசதியான மென்மையான உணவைத் தேர்ந்தெடுக்கவும்.", "மூச்சுவிட அல்லது திரவம் விழுங்க சிரமம் இருந்தால் உடனடி மருத்துவ உதவி பெறுங்கள்."]],
        constipation: ["மலச்சிக்கல்", ["திரவத்தை கட்டுப்படுத்தச் சொல்லப்படவில்லை எனில் அடிக்கடி தண்ணீர் குடிக்கவும்.", "காய்கறி, பழம், பருப்பு, முழுதானியம் போன்ற நார்ச்சத்து உணவை மெதுவாக அதிகரிக்கவும்.", "கடுமையான வயிற்றுவலி, வாந்தி அல்லது வயிறு வீக்கம் இருந்தால் விரைவாக மருத்துவ ஆலோசனை பெறுங்கள்."]]
      },
      urgent: "உடனடியாக அவசர உதவி பெறுங்கள். இந்தியாவில் 112 அல்லது உள்ளூர் அவசர எண்ணை அழைக்கவும் அல்லது அவசர சிகிச்சைப் பிரிவுக்குச் செல்லவும்.",
      infant: "3 மாதங்களுக்குக் குறைவான குழந்தைக்கு காய்ச்சல் இருந்தால் உடனடி மருத்துவ மதிப்பீடு தேவை. குழந்தை மருத்துவர் அல்லது அவசர சேவையைத் தொடர்புகொள்ளுங்கள்.",
      sameDay: "இன்றே மருத்துவ நிபுணரைத் தொடர்புகொள்ளுங்கள். அறிகுறிகள் கடுமையானால் அல்லது வேகமாக மோசமானால் உடனடி அவசர உதவி பெறுங்கள்.",
      young: "5 வயதுக்குக் குறைவான குழந்தையின் அறிகுறிகள் கவலைக்குரியதாகவோ நீடித்தோ மோசமானாலோ பராமரிப்பாளர் அல்லது குழந்தை மருத்துவரை அணுகுங்கள்.",
      older: "65 வயது அல்லது அதற்கு மேற்பட்டவர்களுக்கு புதிய, நீடிக்கும் அல்லது மோசமாகும் அறிகுறிகள் இருந்தால் மருத்துவ ஆலோசனை பெறுங்கள்.",
      routine: "அறிகுறிகள் லேசாக இருந்து மேம்பட்டால் கண்காணிக்கவும். நீடித்தால், மோசமானால் அல்லது கவலை இருந்தால் மருத்துவ நிபுணரை அணுகுங்கள்."
    },
    te: {
      info: "సాధారణ సమాచారం",
      description: "మీరు వివరించిన వాటిలో {topics} వంటి లక్షణాలు ఉన్నాయి. వీటికి అనేక కారణాలు ఉండవచ్చు; ఈ మార్గదర్శిని కారణాన్ని గుర్తించదు లేదా రోగనిర్ధారణ చేయదు.",
      unmatched: "మద్దతు ఉన్న నిర్దిష్ట లక్షణాల వర్గం గుర్తించబడలేదు. ఎప్పుడు మొదలైంది, ఎలా మారుతోంది, ఇతర లక్షణాలు ఉన్నాయా నమోదు చేయండి; వైద్య నిపుణుడు మొత్తం పరిస్థితిని అంచనా వేయగలరు.",
      care: "సాధారణ విశ్రాంతి, ఆహార సూచనలు",
      medicines: "మందుల భద్రత",
      medicineText: "లక్షణాల ఆధారంగా ఈ సాధనం మందులు లేదా మోతాదులను సురక్షితంగా ఎంచుకోలేదు. ముఖ్యంగా పిల్లలు, గర్భధారణ, అలర్జీలు, దీర్ఘకాలిక సమస్యలు లేదా ఇతర మందులు ఉన్నప్పుడు వైద్యుడు లేదా ఫార్మసిస్ట్‌ను అడగండి. ఇతరుల ప్రిస్క్రిప్షన్ వాడకండి; మీరే యాంటీబయాటిక్స్ ప్రారంభించవద్దు.",
      groups: {
        general: ["లక్షణాలు ఎప్పుడు మొదలయ్యాయి, ఏ మార్పులు లేదా కారణాలు కనిపిస్తున్నాయో నమోదు చేయండి. వైద్యుడు ద్రవాలను పరిమితం చేయమని చెప్పకపోతే సాధారణంగా విశ్రాంతి తీసుకుని ద్రవాలు తాగండి. లక్షణాలు కొనసాగితే, తీవ్రమైతే లేదా ఆందోళన కలిగిస్తే వైద్య నిపుణుడిని సంప్రదించండి."],
        breathing: ["పొగ లేదా చికాకు కలిగించే వాటిని నివారించి సౌకర్యంగా విశ్రాంతి తీసుకోండి. శ్వాస తీసుకోవడంలో తీవ్రమైన లేదా పెరుగుతున్న ఇబ్బంది అత్యవసర పరిస్థితి; వెంటనే సహాయం పొందండి."],
        eye: ["కళ్లను రుద్దకండి; చూపులో మార్పులను గమనించండి. అకస్మాత్తుగా చూపు కోల్పోవడం, తీవ్రమైన కంటి నొప్పి లేదా కంటి గాయం ఉంటే వెంటనే వైద్య సహాయం పొందండి."],
        ear: ["చెవిలో వస్తువులు లేదా వైద్యుడు సూచించని చుక్కలు వేయకండి. అకస్మాత్తుగా వినికిడి తగ్గడం, తీవ్రమైన నొప్పి లేదా స్రావం ఉంటే వైద్య నిపుణుడిని సంప్రదించండి."],
        skin: ["కొత్తగా తగిలిన అనుమానాస్పద పదార్థాన్ని నివారించి, చర్మ మార్పు ఎప్పుడు మొదలైందో నమోదు చేయండి. వేగంగా వ్యాపించే దద్దుర్లు, ముఖం/గొంతు వాపు లేదా శ్వాస ఇబ్బంది ఉంటే వెంటనే సహాయం పొందండి."],
        urinary: ["మూత్రం రంగు, నొప్పి లేదా తరచుదనంలో మార్పులను నమోదు చేయండి; ద్రవాలపై పరిమితి ఉంటే దాన్ని పాటించండి. మూత్రంలో రక్తం, మూత్రం పోకపోవడం లేదా నొప్పితో కూడిన జ్వరం ఉంటే త్వరగా వైద్య సలహా పొందండి."],
        mouth: ["సౌకర్యంగా ఉండే మెత్తని ఆహారం తీసుకుని నోటిని మెల్లగా శుభ్రం చేయండి. ముఖం వాపు, తీవ్రమైన నొప్పి లేదా మింగడం/శ్వాసలో ఇబ్బంది ఉంటే వెంటనే సహాయం పొందండి."],
        movement: ["ప్రభావిత భాగానికి విశ్రాంతి ఇవ్వండి; నొప్పి కలిగించే కదలికను బలవంతం చేయకండి. కొత్త బలహీనత, పెద్ద గాయం లేదా తీవ్రమైన/పెరుగుతున్న నొప్పి ఉంటే త్వరగా వైద్య పరీక్ష చేయించుకోండి."],
        reproductive: ["సమయం, మార్పులను నమోదు చేయండి; కొనసాగుతున్న లేదా ఆందోళన కలిగించే లక్షణాలను వైద్య నిపుణుడు అంచనా వేయగలరు. తీవ్రమైన కటి నొప్పి, అధిక రక్తస్రావం లేదా గర్భధారణలో రక్తస్రావం ఉంటే త్వరగా వైద్య సలహా పొందండి."],
        mental: ["మీరు నమ్మే వ్యక్తితో మరియు వైద్య నిపుణుడితో మాట్లాడండి. మీకు లేదా మరొకరికి హాని కలిగే ప్రమాదం ఉంటే వెంటనే అత్యవసర సేవలు లేదా దగ్గరలోని నమ్మకమైన వ్యక్తి నుంచి సహాయం పొందండి."]
      },
      next: "ఎప్పుడు సహాయం పొందాలి",
      topics: {
        fever: ["జ్వరం లేదా చలి", ["విశ్రాంతి తీసుకోండి; సాధ్యమైతే తరచుగా ద్రవాలు తాగండి. అస్వస్థంగా ఉంటే చిన్న చిన్న సిప్‌లు తీసుకోండి.", "సులభంగా తినగలిగే ఆహారం తీసుకోండి; బలవంతంగా తినవద్దు.", "ఉష్ణోగ్రతను, కొలిచిన సమయాన్ని నమోదు చేయండి."]],
        cold: ["దగ్గు లేదా జలుబు", ["విశ్రాంతి తీసుకోండి; సౌకర్యంగా ఉంటే నీరు లేదా గోరువెచ్చని ద్రవాలు తాగండి.", "పొగ, చికాకు కలిగించే వాటికి దూరంగా ఉండండి; గొంతు నొప్పి ఉంటే మెత్తని ఆహారం తీసుకోండి.", "శ్వాస తీసుకోవడంలో ఇబ్బంది, పెదాలు నీలంగా మారడం లేదా వేగంగా తీవ్రమవడం అత్యవసర పరిస్థితి."]],
        stomach: ["వికారం, వాంతులు లేదా విరేచనాలు", ["సురక్షితమైన ద్రవాలను తరచుగా చిన్న సిప్‌లుగా తాగండి; ORS వాడితే ప్యాకెట్ సూచనల ప్రకారం కలపండి.", "తినడానికి సిద్ధంగా ఉన్నప్పుడు కొద్దిగా సాదా, అలవాటైన ఆహారం తీసుకోండి; బలవంతం చేయవద్దు.", "మూత్రం చాలా తగ్గడం, వాంతి/మలంలో రక్తం, తీవ్రమైన కడుపునొప్పి లేదా ద్రవాలు నిలవకపోతే త్వరగా వైద్య సలహా పొందండి."]],
        headache: ["తలనొప్పి", ["దాహంగా ఉంటే నీరు తాగండి; సాధారణ భోజనం మానవద్దు.", "సౌకర్యంగా ఉంటే ప్రశాంతమైన, తక్కువ వెలుతురు ఉన్న గదిలో విశ్రాంతి తీసుకోండి.", "అకస్మాత్తుగా తీవ్రమైన తలనొప్పి లేదా బలహీనత, గందరగోళం, స్పృహ తప్పడం, చూపు/మాటలో మార్పు ఉంటే అత్యవసర సహాయం పొందండి."]],
        throat: ["గొంతు నొప్పి", ["సౌకర్యంగా అనిపించే గోరువెచ్చని లేదా చల్లని ద్రవాలను చిన్న సిప్‌లుగా తాగండి.", "మింగడానికి సులభమైన మెత్తని ఆహారం తీసుకోండి.", "శ్వాస తీసుకోవడం లేదా ద్రవాలు మింగడం కష్టమైతే వెంటనే వైద్య సహాయం పొందండి."]],
        constipation: ["మలబద్ధకం", ["ద్రవాలు పరిమితం చేయమని చెప్పకపోతే తరచుగా నీరు తాగండి.", "కూరగాయలు, పండ్లు, పప్పులు, తృణధాన్యాలు వంటి పీచు ఉన్న ఆహారాన్ని క్రమంగా పెంచండి.", "తీవ్రమైన కడుపునొప్పి, వాంతులు లేదా కడుపు ఉబ్బరం ఉంటే త్వరగా వైద్య సలహా పొందండి."]]
      },
      urgent: "వెంటనే అత్యవసర సహాయం పొందండి. భారతదేశంలో 112 లేదా మీ స్థానిక అత్యవసర నంబర్‌కు కాల్ చేయండి లేదా అత్యవసర విభాగానికి వెళ్లండి.",
      infant: "3 నెలల లోపు శిశువుకు జ్వరం ఉంటే వెంటనే వైద్య పరీక్ష అవసరం. శిశువైద్యుడిని లేదా అత్యవసర సేవను సంప్రదించండి.",
      sameDay: "ఈరోజే వైద్య నిపుణుడిని సంప్రదించండి. లక్షణాలు తీవ్రంగా లేదా త్వరగా తీవ్రమవుతుంటే వెంటనే అత్యవసర సహాయం పొందండి.",
      young: "5 ఏళ్లలోపు పిల్లల లక్షణాలు ఆందోళనకరంగా, కొనసాగుతూ లేదా తీవ్రమవుతుంటే సంరక్షకుడు లేదా శిశువైద్యుడిని సంప్రదించండి.",
      older: "65 ఏళ్లు లేదా అంతకంటే ఎక్కువ వయస్సులో కొత్తగా వచ్చిన, కొనసాగుతున్న లేదా తీవ్రమవుతున్న లక్షణాలపై వైద్య సలహా పొందండి.",
      routine: "లక్షణాలు స్వల్పంగా ఉండి మెరుగవుతుంటే గమనించండి. కొనసాగితే, తీవ్రమైతే లేదా ఆందోళన కలిగిస్తే వైద్య నిపుణుడిని సంప్రదించండి."
    }
  };

  $("#symptom-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    const age = Number($("#symptom-age").value);
    const symptomText = $("#symptom-text").value.trim();
    if (!symptomText) return;

    const emergency = hasEmergencyWarning(symptomText);
    const infantFever = age < 0.25 && hasUnnegatedWarning(symptomText, [/\b(fever|temperature|febrile)\b|बुखार|तापमान|காய்ச்சல்|జ్వరం/i]);
    const promptCare = hasUnnegatedWarning(symptomText, sameDayPatterns)
      || infantFever;
    const result = $("#symptom-result");
    result.className = emergency ? "symptom-result urgent" : promptCare ? "symptom-result caution" : "symptom-result guidance";
    result.hidden = false;
    if (language === "ta" || language === "te") {
      const wording = language === "ta"
        ? {
          urgent: "உடனடியாக மருத்துவ உதவி பெறுங்கள். அவசர எச்சரிக்கை அறிகுறியாக இருக்கக்கூடிய சொற்கள் உள்ளன. இந்தியாவில் 112 அல்லது உங்கள் உள்ளூர் அவசர எண்ணை அழைக்கவும். இது நோயறிதல் அல்ல.",
          infant: "மூன்று மாதங்களுக்குக் குறைவான குழந்தைக்கு காய்ச்சல் இருந்தால் உடனடியாக மருத்துவ மதிப்பீடு தேவை. குழந்தை மருத்துவர் அல்லது அவசர சேவையைத் தொடர்புகொள்ளுங்கள். இது நோயறிதல் அல்ல.",
          caution: "இன்று மருத்துவ நிபுணரிடம் ஆலோசனை பெறுங்கள். அறிகுறிகள் கடுமையாகவோ வேகமாக மோசமாவதாகவோ இருந்தால் அவசர உதவி பெறுங்கள். இது நோயறிதல் அல்ல; மருந்தைப் பரிந்துரைக்காது.",
          guidance: "இந்த எளிய சொல்-சோதனையில் எச்சரிக்கைச் சொல் கண்டறியப்படவில்லை; அதனால் பாதுகாப்பு உறுதி ஆகாது. அறிகுறிகள் நீடித்தால், மோசமானால் அல்லது கவலை இருந்தால் மருத்துவ நிபுணரை அணுகுங்கள். இது நோயறிதல் அல்ல."
        }
        : {
          urgent: "వెంటనే వైద్య సహాయం పొందండి. అత్యవసర హెచ్చరిక లక్షణం కావచ్చని సూచించే పదాలు ఉన్నాయి. భారతదేశంలో 112 లేదా మీ స్థానిక అత్యవసర నంబర్‌కు కాల్ చేయండి. ఇది రోగనిర్ధారణ కాదు.",
          infant: "మూడు నెలల లోపు శిశువుకు జ్వరం ఉంటే వెంటనే వైద్య పరీక్ష అవసరం. శిశువైద్యుడిని లేదా అత్యవసర సేవను సంప్రదించండి. ఇది రోగనిర్ధారణ కాదు.",
          caution: "ఈరోజే వైద్య నిపుణుడిని సంప్రదించండి. లక్షణాలు తీవ్రంగా ఉంటే లేదా త్వరగా పెరుగుతుంటే అత్యవసర సహాయం పొందండి. ఇది రోగనిర్ధారణ కాదు; మందులను సూచించదు.",
          guidance: "ఈ సరళమైన పదాల తనిఖీలో హెచ్చరిక పదం కనిపించలేదు; దీని అర్థం మీరు సురక్షితంగా ఉన్నారని కాదు. లక్షణాలు కొనసాగితే, తీవ్రమైతే లేదా ఆందోళన కలిగిస్తే వైద్య నిపుణుడిని సంప్రదించండి. ఇది రోగనిర్ధారణ కాదు."
        };
      result.textContent = emergency ? wording.urgent : infantFever ? wording.infant : promptCare ? wording.caution : wording.guidance;
    } else if (language === "hi") {
      result.textContent = emergency
        ? "तुरंत मदद लें। आपके लिखे शब्दों में संभावित आपातकालीन चेतावनी संकेत है। भारत में 112 या अपने स्थानीय आपातकालीन नंबर पर कॉल करें, या नज़दीकी आपातकालीन विभाग जाएँ। यह निदान नहीं है।"
        : promptCare
          ? infantFever
            ? "तीन महीने से छोटे शिशु में बुखार पर तुरंत बाल-चिकित्सक या आपातकालीन सेवा से संपर्क करें। यह निदान नहीं है।"
            : age < 5
              ? "आज ही बाल-चिकित्सक या स्वास्थ्य सेवा से सलाह लें; छोटे बच्चों में लक्षण जल्दी बदल सकते हैं। बच्चा बहुत बीमार लगे या हालत बिगड़े तो तुरंत आपातकालीन सहायता लें। यह निदान नहीं है और कोई दवा नहीं सुझाता।"
              : "आपके लिखे कुछ शब्दों पर आज ही स्वास्थ्य विशेषज्ञ से सलाह लेना उचित है। लक्षण गंभीर हों या तेजी से बिगड़ें तो आपातकालीन सहायता लें। यह निदान नहीं है और कोई दवा नहीं सुझाता।"
          : age < 5
            ? "यदि लक्षण हल्के और सुधर रहे हैं, बच्चे पर नज़र रखें और देखभालकर्ता/बाल-चिकित्सक से सलाह लें। छोटे बच्चों में चिंता, बिगड़ते या लगातार बने लक्षणों पर चिकित्सा सलाह लें। यह टूल बीमारी या ठीक होने का समय नहीं बता सकता और दवा नहीं सुझाता।"
            : age >= 65
              ? "यदि लक्षण हल्के और सुधर रहे हैं, निगरानी रखें; नए, बने रहने वाले या बिगड़ते लक्षणों पर स्वास्थ्य विशेषज्ञ से सलाह लें। उम्र और लक्षणों से बीमारी या ठीक होने का समय इस टूल से नहीं बताया जा सकता। खुद से दवा शुरू न करें।"
              : "यदि लक्षण हल्के, हाल में शुरू हुए और सुधर रहे हैं, तो निगरानी रखें और आराम/पर्याप्त तरल जैसे सामान्य उपाय अपनाएँ। लक्षण बने रहें, बिगड़ें या चिंता हो तो स्वास्थ्य विशेषज्ञ से सलाह लें। यह टूल बीमारी या ठीक होने का समय नहीं बता सकता और दवा नहीं सुझाता।";
    } else {
      result.textContent = emergency
        ? "Get urgent help now. Your words include a possible emergency warning sign. Call 112 in India (or your local emergency number) or go to the nearest emergency department. This is not a diagnosis."
        : promptCare
          ? infantFever
            ? "For a fever in an infant under 3 months, contact a pediatric clinician or emergency service now. This is not a diagnosis."
            : age < 5
              ? "Please contact a pediatric clinician or health service today; young children can change quickly. Seek emergency help if the child seems very unwell or worsens. This is not a diagnosis and does not recommend medicine."
              : "Some words you entered make same-day advice from a healthcare professional appropriate. If symptoms are severe or rapidly worsening, seek emergency care. This is not a diagnosis and does not recommend medicine."
          : age < 5
            ? "If symptoms are mild and improving, monitor the child and consult a caregiver or pediatric clinician. Seek medical advice for concerning, persistent, or worsening symptoms. This tool cannot identify an illness or predict recovery time and does not recommend medicine."
            : age >= 65
              ? "If symptoms are mild and improving, monitor them; contact a healthcare professional about new, persistent, or worsening symptoms. This tool cannot identify an illness or predict recovery time. Do not start medicine without professional advice."
              : "If symptoms are mild, recent, and improving, monitor them and use general measures such as rest and fluids. Contact a healthcare professional if they persist, worsen, or concern you. This tool cannot identify an illness or predict recovery time and does not recommend medicine.";
    }
    const nextStep = result.textContent;
    const copy = symptomAdvice[language] || symptomAdvice.en;
    const matchedTopics = symptomTopicPatterns
      .filter(({ pattern }) => hasUnnegatedWarning(symptomText, [pattern]))
      .map((topic) => copy.topics[topic.id] || [topic.labels[language] || topic.labels.en, copy.groups[topic.group] || copy.groups.general]);
    if (emergency) {
      result.innerHTML = `<section class="symptom-detail-card"><h3>${escapeHTML(copy.next)}</h3><p>${escapeHTML(nextStep)}</p></section>`;
      return;
    }
    const description = matchedTopics.length
      ? copy.description.replace("{topics}", matchedTopics.map(([title]) => title).join(", "))
      : copy.unmatched;
    const topicCards = matchedTopics.map(([title, tips]) =>
      `<section class="symptom-detail-card"><h4>${escapeHTML(title)}</h4><ul>${tips.map((tip) => `<li>${escapeHTML(tip)}</li>`).join("")}</ul></section>`
    ).join("");
    result.innerHTML = [
      `<section class="symptom-detail-card"><h3>${escapeHTML(copy.info)}</h3><p>${escapeHTML(description)}</p></section>`,
      topicCards ? `<section class="symptom-detail-group"><h3>${escapeHTML(copy.care)}</h3>${topicCards}</section>` : "",
      `<section class="symptom-detail-card"><h3>${escapeHTML(copy.medicines)}</h3><p>${escapeHTML(copy.medicineText)}</p></section>`,
      `<section class="symptom-detail-card"><h3>${escapeHTML(copy.next)}</h3><p>${escapeHTML(nextStep)}</p></section>`
    ].filter(Boolean).join("");
  });
  $("#symptom-form").addEventListener("input", () => {
    $("#symptom-result").hidden = true;
  });

  $("#voice-input").addEventListener("click", () => {
    if (!$("#symptom-age").reportValidity()) return;
    const voiceMessages = {
      en: { unavailable: "Voice recognition is not available in this browser. Please type the symptoms.", listening: "Listening… start speaking.", added: "Voice text added. Review it before checking next steps.", failed: "Voice recognition failed. Please type the symptoms.", microphone: "Could not start the microphone. Check permissions or type the symptoms." },
      hi: { unavailable: "इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया लक्षण लिखें।", listening: "सुन रहे हैं… बोलना शुरू करें।", added: "आवाज़ से लक्षण लिखे गए। जाँचने से पहले पढ़कर पुष्टि करें।", failed: "आवाज़ पहचान नहीं हो सकी। कृपया लक्षण लिखें।", microphone: "माइक्रोफ़ोन शुरू नहीं हो सका। अनुमति जाँचें या लक्षण लिखें।" },
      ta: { unavailable: "இந்த உலாவியில் குரல் அறிதல் இல்லை. அறிகுறிகளைத் தட்டச்சு செய்யவும்.", listening: "கேட்கிறது… பேசத் தொடங்குங்கள்.", added: "குரல் உரை சேர்க்கப்பட்டது. சரிபார்ப்பதற்கு முன் படித்துப் பார்க்கவும்.", failed: "குரல் அறிதல் தோல்வியடைந்தது. அறிகுறிகளைத் தட்டச்சு செய்யவும்.", microphone: "மைக்ரோஃபோனைத் தொடங்க முடியவில்லை. அனுமதியைச் சரிபார்க்கவும் அல்லது தட்டச்சு செய்யவும்." },
      te: { unavailable: "ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు. లక్షణాలను టైప్ చేయండి.", listening: "వింటున్నాం… మాట్లాడండి.", added: "వాయిస్ వచనం జోడించబడింది. తనిఖీకి ముందు చదివి నిర్ధారించండి.", failed: "వాయిస్ గుర్తింపు విఫలమైంది. లక్షణాలను టైప్ చేయండి.", microphone: "మైక్రోఫోన్ ప్రారంభం కాలేదు. అనుమతులను తనిఖీ చేయండి లేదా టైప్ చేయండి." }
    }[language];
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      $("#voice-status").textContent = voiceMessages.unavailable;
      return;
    }
    if (activeRecognition) {
      activeRecognition.stop();
      return;
    }
    try {
      activeRecognition = new Recognition();
      activeRecognition.lang = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN" }[language];
      activeRecognition.interimResults = false;
      activeRecognition.onstart = () => {
        $("#voice-input-label").textContent = translations[language].ui["voice-stop-label"];
        $("#voice-status").textContent = voiceMessages.listening;
      };
      activeRecognition.onresult = (speechEvent) => {
        const spokenText = speechEvent.results[0][0].transcript.trim();
        const input = $("#symptom-text");
        input.value = [input.value.trim(), spokenText].filter(Boolean).join(" ");
        input.focus();
        $("#voice-status").textContent = voiceMessages.added;
      };
      activeRecognition.onerror = (speechEvent) => {
        console.error("Browser voice recognition failed.", speechEvent.error);
        $("#voice-status").textContent = voiceMessages.failed;
      };
      activeRecognition.onend = () => {
        activeRecognition = null;
        $("#voice-input-label").textContent = translations[language].ui["voice-input-label"];
      };
      activeRecognition.start();
    } catch (error) {
      activeRecognition = null;
      console.error("Unable to start browser voice recognition.", error);
      $("#voice-status").textContent = voiceMessages.microphone;
    }
  });
  $("#cancel-review").addEventListener("click", () => elements.recordDialog.close());
  $("#cancel-profile").addEventListener("click", () => elements.profileDialog.close());

  const dropZone = $("#drop-zone");
  for (const eventName of ["dragenter", "dragover"]) dropZone.addEventListener(eventName, (event) => { event.preventDefault(); dropZone.classList.add("dragging"); });
  for (const eventName of ["dragleave", "drop"]) dropZone.addEventListener(eventName, (event) => { event.preventDefault(); dropZone.classList.remove("dragging"); });
  dropZone.addEventListener("drop", (event) => {
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    elements.fileInput.files = files;
    elements.fileInput.dispatchEvent(new Event("change"));
  });

  document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  }));

  render();
  void initializeBackend();
})();
