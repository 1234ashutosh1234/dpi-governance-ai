from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


# ============================================================
# MULTILINGUAL TRAINING DATA
# ============================================================

training_texts = [

    # --------------------------------------------------------
    # WATER SUPPLY
    # --------------------------------------------------------

    "There is no drinking water in our village",
    "There is no clean water supply",
    "Our village has a water shortage",
    "We do not have proper drinking water",
    "Water pipeline is damaged",
    "There is no water connection in our area",
    "People are facing drinking water problems",
    "Our hand pump is not working",
    "Clean drinking water is not available",
    "Water supply is irregular",

    "हमारे गांव में पीने का पानी नहीं है",
    "हमारे गांव में साफ पानी नहीं है",
    "पीने के लिए स्वच्छ पानी उपलब्ध नहीं है",
    "हमारे इलाके में पानी की समस्या है",
    "गांव में पानी की बहुत कमी है",
    "पानी की पाइपलाइन खराब है",
    "हमारे क्षेत्र में पानी की सप्लाई नहीं है",
    "हैंडपंप खराब है",
    "लोगों को पीने का साफ पानी नहीं मिल रहा है",
    "हमारे गांव में पानी की व्यवस्था खराब है",


    # --------------------------------------------------------
    # ROADS
    # --------------------------------------------------------

    "Our village road has many potholes",
    "The road is damaged",
    "Roads need immediate repair",
    "There is no proper road in our village",
    "The main road is broken",
    "Road infrastructure is poor",
    "The village road is full of potholes",
    "Road construction is incomplete",
    "The road is unsafe",
    "We need a new road",

    "हमारे गांव की सड़क बहुत खराब है",
    "सड़क में बहुत गड्ढे हैं",
    "हमारी सड़क टूटी हुई है",
    "गांव की सड़क की मरम्मत की जरूरत है",
    "मुख्य सड़क खराब हो गई है",
    "सड़क निर्माण अधूरा है",
    "हमारे क्षेत्र में सड़क की समस्या है",
    "सड़क पर बड़े बड़े गड्ढे हैं",
    "गांव की सड़क चलने लायक नहीं है",
    "नई सड़क बनाने की जरूरत है",


    # --------------------------------------------------------
    # HEALTHCARE
    # --------------------------------------------------------

    "There is no doctor at our health centre",
    "Our hospital does not have doctors",
    "Healthcare facilities are not available",
    "The primary health centre has no doctor",
    "We need a medical facility",
    "There are no medicines in our hospital",
    "The health centre is understaffed",
    "People cannot access healthcare",
    "Emergency medical services are unavailable",
    "Our village needs a hospital",

    "हमारे स्वास्थ्य केंद्र में डॉक्टर नहीं है",
    "गांव में इलाज की सुविधा नहीं है",
    "अस्पताल में डॉक्टर उपलब्ध नहीं हैं",
    "प्राथमिक स्वास्थ्य केंद्र में डॉक्टर नहीं है",
    "हमारे क्षेत्र में स्वास्थ्य सुविधा नहीं है",
    "अस्पताल में दवाइयां नहीं हैं",
    "स्वास्थ्य केंद्र में कर्मचारी नहीं हैं",
    "लोगों को इलाज नहीं मिल रहा है",
    "आपातकालीन चिकित्सा सुविधा उपलब्ध नहीं है",
    "हमारे गांव में अस्पताल की जरूरत है",


    # --------------------------------------------------------
    # ELECTRICITY
    # --------------------------------------------------------

    "There is no electricity in our village",
    "Electricity supply is unreliable",
    "Power cuts happen every day",
    "Our village has frequent power outages",
    "Electric poles are damaged",
    "There is no proper power supply",
    "Electricity infrastructure is poor",
    "We need electricity connection",
    "The transformer is not working",
    "Power supply is interrupted",

    "हमारे गांव में बिजली नहीं है",
    "बिजली की सप्लाई ठीक नहीं है",
    "हर दिन बिजली कट जाती है",
    "गांव में बार बार बिजली जाती है",
    "बिजली के खंभे खराब हैं",
    "बिजली की उचित व्यवस्था नहीं है",
    "हमारे क्षेत्र में बिजली की समस्या है",
    "बिजली का कनेक्शन नहीं है",
    "ट्रांसफार्मर खराब है",
    "बिजली की आपूर्ति बाधित है",


    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    "The government school building is damaged",
    "Our village school needs repair",
    "There are no teachers in our school",
    "School infrastructure is poor",
    "Students do not have classrooms",
    "The school building is unsafe",
    "There is no proper school in our village",
    "Our school needs more teachers",
    "School facilities are inadequate",
    "Children need better education facilities",

    "हमारे गांव का सरकारी स्कूल खराब है",
    "स्कूल की इमारत टूट गई है",
    "हमारे स्कूल में शिक्षक नहीं हैं",
    "स्कूल की व्यवस्था खराब है",
    "छात्रों के लिए कक्षा नहीं है",
    "स्कूल की इमारत सुरक्षित नहीं है",
    "गांव में उचित स्कूल नहीं है",
    "स्कूल में शिक्षकों की कमी है",
    "स्कूल में सुविधाएं उपलब्ध नहीं हैं",
    "बच्चों के लिए बेहतर शिक्षा सुविधा चाहिए",
]


training_labels = (
    ["Water Supply"] * 20
    + ["Roads"] * 20
    + ["Healthcare"] * 20
    + ["Electricity"] * 20
    + ["Education"] * 20
)


# ============================================================
# TF-IDF MODEL
# ============================================================

vectorizer = TfidfVectorizer(
    analyzer="char_wb",
    ngram_range=(2, 5),
    min_df=1,
    sublinear_tf=True,
)


X = vectorizer.fit_transform(training_texts)


# ============================================================
# LOGISTIC REGRESSION CLASSIFIER
# ============================================================

model = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
)


# The training data contains exactly 100 texts and 100 labels.
model.fit(
    X,
    training_labels,
)




# ============================================================
# ROBUST MULTILINGUAL CLASSIFICATION
# ============================================================

import re


def _contains_hindi(text: str) -> bool:
    """
    Detect Devanagari/Hindi text.
    """
    return bool(re.search(r"[\u0900-\u097F]", text))


def _normalize_hindi(text: str) -> str:
    """
    Normalize Hindi text for reliable keyword matching.
    """
    text = text.strip().lower()

    # Normalize common punctuation
    text = re.sub(r"[।,!?;:()\[\]{}\"']", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    return text


def _classify_hindi(text: str):
    """
    Rule-based Hindi infrastructure classifier.

    This is intentionally used before the ML model because
    short Hindi citizen complaints can be classified poorly
    by a small TF-IDF training set.
    """

    text = _normalize_hindi(text)

    # --------------------------------------------------------
    # WATER SUPPLY
    # --------------------------------------------------------

    water_phrases = [
        "पानी",
        "पीने का पानी",
        "पीने के लिए पानी",
        "पीने के पानी",
        "साफ पानी",
        "स्वच्छ पानी",
        "पीने के लिए साफ पानी",
        "पीने के लिए स्वच्छ पानी",
        "पानी की समस्या",
        "पानी की कमी",
        "पानी नहीं है",
        "पानी उपलब्ध नहीं",
        "पानी नहीं मिल",
        "पानी की सप्लाई",
        "पानी की आपूर्ति",
        "जल की समस्या",
        "जल की कमी",
        "जल आपूर्ति",
        "जल सप्लाई",
        "नल का पानी",
        "नल में पानी",
        "पाइपलाइन",
        "पानी की पाइपलाइन",
        "हैंडपंप",
        "चापाकल",
        "पंप खराब",
        "पानी की व्यवस्था",
    ]

    if any(phrase in text for phrase in water_phrases):
        return {
            "category": "Water Supply",
            "confidence": 0.95,
        }


    # --------------------------------------------------------
    # ROADS
    # --------------------------------------------------------

    road_phrases = [
        "सड़क",
        "सड़क",
        "रोड",
        "गड्ढा",
        "गड्ढे",
        "सड़क खराब",
        "सड़क टूटी",
        "सड़क की समस्या",
        "सड़क की मरम्मत",
        "सड़क बनाने",
        "रोड खराब",
        "रोड टूटी",
        "रोड की मरम्मत",
        "पुल",
        "पुलिया",
    ]

    if any(phrase in text for phrase in road_phrases):
        return {
            "category": "Roads",
            "confidence": 0.95,
        }


    # --------------------------------------------------------
    # HEALTHCARE
    # --------------------------------------------------------

    healthcare_phrases = [
        "डॉक्टर",
        "डाक्टर",
        "अस्पताल",
        "स्वास्थ्य केंद्र",
        "स्वास्थ्य केन्द्र",
        "स्वास्थ्य केंद्र में डॉक्टर",
        "इलाज",
        "इलाज की सुविधा",
        "दवा",
        "दवाइयां",
        "दवाई",
        "चिकित्सा",
        "चिकित्सा सुविधा",
        "नर्स",
        "एम्बुलेंस",
        "मरीज",
        "मेडिकल",
        "प्राथमिक स्वास्थ्य केंद्र",
        "पीएचसी",
    ]

    if any(phrase in text for phrase in healthcare_phrases):
        return {
            "category": "Healthcare",
            "confidence": 0.95,
        }


    # --------------------------------------------------------
    # ELECTRICITY
    # --------------------------------------------------------

    electricity_phrases = [
        "बिजली",
        "बिजली की समस्या",
        "बिजली नहीं है",
        "बिजली नहीं आती",
        "बिजली जाती है",
        "बिजली कट",
        "बिजली कटौती",
        "बिजली की सप्लाई",
        "बिजली की आपूर्ति",
        "बिजली का कनेक्शन",
        "बिजली कनेक्शन",
        "बिजली का खंभा",
        "बिजली के खंभे",
        "ट्रांसफार्मर",
        "पावर कट",
        "विद्युत",
        "विद्युत आपूर्ति",
    ]

    if any(
        phrase in text
        for phrase in electricity_phrases
    ):
        return {
            "category": "Electricity",
            "confidence": 0.95,
        }


    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    education_phrases = [
        "स्कूल",
        "विद्यालय",
        "शिक्षा",
        "शिक्षक",
        "टीचर",
        "स्कूल की समस्या",
        "स्कूल खराब",
        "स्कूल की मरम्मत",
        "स्कूल भवन",
        "विद्यालय भवन",
        "कक्षा",
        "क्लासरूम",
        "बच्चों की पढ़ाई",
        "बच्चों की पढाई",
        "पढ़ाई",
        "पढ़ने",
        "शिक्षा की सुविधा",
    ]

    if any(
        phrase in text
        for phrase in education_phrases
    ):
        return {
            "category": "Education",
            "confidence": 0.95,
        }


    # --------------------------------------------------------
    # NO CLEAR HINDI MATCH
    # --------------------------------------------------------

    return None


def classify_request(text: str):

    # --------------------------------------------------------
    # EMPTY INPUT
    # --------------------------------------------------------

    if not text or not text.strip():
        return {
            "category": "Other",
            "confidence": 0.0,
        }


    text = text.strip()


    # --------------------------------------------------------
    # HINDI RULE-BASED CLASSIFICATION
    # --------------------------------------------------------

    if _contains_hindi(text):

        hindi_result = _classify_hindi(text)

        if hindi_result is not None:
            return hindi_result


    # --------------------------------------------------------
    # EXISTING ML CLASSIFIER
    # --------------------------------------------------------

    features = vectorizer.transform([text])

    prediction = model.predict(features)[0]

    probabilities = model.predict_proba(features)[0]

    confidence = float(
        max(probabilities)
    )

    return {
        "category": prediction,
        "confidence": round(
            confidence,
            3
        ),
    }