import logging
import os
import re
import subprocess
import tempfile
import wave

from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)


# ============================================================
# WHISPER MODEL
# ============================================================

logger.info("[VOICE] Loading Whisper small model...")

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8",
)

logger.info("[VOICE] Whisper model loaded successfully.")


# ============================================================
# CONVERT ANY BROWSER AUDIO TO STANDARD WAV
# 16 kHz / MONO / 16-bit PCM
# ============================================================

def convert_to_wav(input_file: str) -> str:

    output_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".wav",
    ).name

    command = [
        "ffmpeg",
        "-y",
        "-i",
        input_file,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-sample_fmt",
        "s16",
        output_file,
    ]

    logger.info("[VOICE] Converting audio to 16kHz mono WAV...")

    result = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if result.returncode != 0:

        logger.error("[FFMPEG ERROR] %s", result.stderr)

        raise RuntimeError(
            "FFmpeg could not convert the uploaded audio."
        )

    logger.debug(
        "[VOICE] WAV created: %s",
        output_file,
    )

    return output_file


# ============================================================
# CHECK AUDIO
# ============================================================

def check_wav(path: str):

    with wave.open(path, "rb") as wav:

        channels = wav.getnchannels()
        sample_rate = wav.getframerate()
        sample_width = wav.getsampwidth()
        frames = wav.getnframes()

        duration = (
            frames / sample_rate
            if sample_rate
            else 0
        )

        logger.debug(
            "[VOICE] Audio info | Channels: %s | Sample rate: %s Hz | Sample width: %s bytes | Duration: %.2f s",
            channels,
            sample_rate,
            sample_width,
            round(duration, 2),
        )

        return duration


# ============================================================
# REMOVE EXCESSIVE WORD REPETITION
# ============================================================

def remove_repetition(text: str) -> str:

    if not text:
        return text

    words = text.split()

    if len(words) < 5:
        return text

    cleaned = []

    previous_word = None
    repeat_count = 0

    for word in words:

        normalized = word.lower()

        if normalized == previous_word:

            repeat_count += 1

        else:

            repeat_count = 0

        # Don't allow endless repetition
        if repeat_count >= 2:
            continue

        cleaned.append(word)

        previous_word = normalized

    return " ".join(cleaned)


# ============================================================
# HINDI NORMALIZATION
# ============================================================

def correct_hindi_text(text: str) -> str:

    if not text:
        return text

    text = text.strip()


    # --------------------------------------------------------
    # Common Whisper Hindi mistakes
    # --------------------------------------------------------

    replacements = {

        # -------------------------
        # OUR / OUR VILLAGE
        # -------------------------

        "अमारे": "हमारे",
        "अमारा": "हमारा",
        "अमाडे": "हमारे",

        "हमारे गों": "हमारे गांव",
        "हमारे गाव": "हमारे गांव",
        "हमारे गाँव": "हमारे गांव",

        "गों": "गांव",
        "गाव": "गांव",
        "गाँव": "गांव",

        # -------------------------
        # WATER
        # -------------------------

        "पाली": "पानी",
        "पानि": "पानी",
        "पानीएग": "पानी",

        # -------------------------
        # CLEAN
        # -------------------------

        "साभ": "साफ",
        "साफ पानी": "साफ पानी",

        # -------------------------
        # NOT
        # -------------------------

        "नहि": "नहीं",
        "नही": "नहीं",

        # -------------------------
        # HEALTH
        # -------------------------

        "स्वास्थ": "स्वास्थ्य",
        "स्वास्थ्": "स्वास्थ्य",

        # -------------------------
        # SCHOOL
        # -------------------------

        "स्कुल": "स्कूल",
        "सकूल": "स्कूल",

        # -------------------------
        # ROAD
        # -------------------------

        "सडक़": "सड़क",
        "सडक": "सड़क",

    }


    # Longer phrases first
    for wrong, correct in sorted(
        replacements.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):

        text = text.replace(
            wrong,
            correct,
        )


    # --------------------------------------------------------
    # Remove repeated words
    # --------------------------------------------------------

    text = remove_repetition(text)


    # --------------------------------------------------------
    # Normalize spaces
    # --------------------------------------------------------

    text = re.sub(
        r"\s+",
        " ",
        text,
    ).strip()


    return text


# ============================================================
# DETECT BAD / HALLUCINATED HINDI
# ============================================================

def is_bad_hindi_transcription(text: str) -> bool:

    if not text:
        return True


    words = text.split()


    # Very short result
    if len(words) <= 1:
        return True


    # --------------------------------------------------------
    # Known garbage patterns
    # --------------------------------------------------------

    bad_patterns = [

        "अमाडेग",
        "पानीएग",

    ]


    for pattern in bad_patterns:

        if pattern in text:

            logger.warning(
                "[VOICE] Bad Hindi pattern detected: %s",
                pattern,
            )

            return True


    # --------------------------------------------------------
    # Excessive same-word repetition
    # --------------------------------------------------------

    counts = {}

    for word in words:

        clean = (
            word
            .lower()
            .strip(
                ".,!?;:।॥"
            )
        )

        if clean:

            counts[clean] = (
                counts.get(
                    clean,
                    0,
                ) + 1
            )


    if counts:

        maximum_repeat = max(
            counts.values()
        )

        if (
            maximum_repeat >= 5
            and maximum_repeat
            / len(words)
            > 0.50
        ):

            logger.warning(
                "[VOICE] Excessive repetition detected in Hindi audio."
            )

            return True


    # --------------------------------------------------------
    # Check Devanagari percentage
    # --------------------------------------------------------

    characters = (
        text.replace(" ", "")
    )

    if not characters:
        return True


    hindi_count = sum(
        1
        for char in characters
        if "\u0900"
        <= char
        <= "\u097F"
    )


    hindi_ratio = (
        hindi_count
        / len(characters)
    )


    if hindi_ratio < 0.50:

        logger.warning(
            "[VOICE] Hindi character ratio too low: %.2f",
            round(
                hindi_ratio,
                2,
            ),
        )

        return True


    return False


# ============================================================
# TRANSCRIBE AUDIO
# ============================================================

def transcribe_audio(
    audio_path: str,
    language: str = "en",
):

    # ========================================================
    # NORMALIZE LANGUAGE
    # ========================================================

    language = (
        language or "en"
    ).lower().strip()


    if language not in [
        "en",
        "hi",
    ]:

        language = "en"


    logger.info(
        "[VOICE] Starting transcription | requested language: %s | audio file: %s",
        language,
        audio_path,
    )


    wav_path = None


    try:

        # ====================================================
        # CONVERT AUDIO
        # ====================================================

        wav_path = convert_to_wav(
            audio_path
        )


        # ====================================================
        # CHECK AUDIO
        # ====================================================

        duration = check_wav(
            wav_path
        )


        # Reject recordings that are too short
        if duration < 0.8:

            logger.warning(
                "[VOICE] Recording is too short (<0.8s)."
            )

            return {
                "text": "",
                "language": language,
                "language_probability": 0,
            }


        # ====================================================
        # WHISPER
        # ====================================================

        logger.info(
            "[VOICE] Running Whisper transcription engine..."
        )


        segments, info = model.transcribe(

            wav_path,

            # ------------------------------------------------
            # FORCE SELECTED LANGUAGE
            # ------------------------------------------------

            language=language,

            task="transcribe",

            # ------------------------------------------------
            # ACCURACY
            # ------------------------------------------------

            beam_size=5,

            best_of=5,

            temperature=0,

            # ------------------------------------------------
            # VOICE ACTIVITY DETECTION
            # ------------------------------------------------

            vad_filter=True,

            vad_parameters={

                "threshold": 0.45,

                "min_speech_duration_ms": 200,

                "min_silence_duration_ms": 500,

                "speech_pad_ms": 300,
            },

            # ------------------------------------------------
            # IMPORTANT
            # Prevent previous segment hallucination
            # ------------------------------------------------

            condition_on_previous_text=False,

            # ------------------------------------------------
            # HALLUCINATION PROTECTION
            # ------------------------------------------------

            compression_ratio_threshold=2.4,

            log_prob_threshold=-1.0,

            no_speech_threshold=0.6,
        )


        # ====================================================
        # COLLECT SEGMENTS
        # ====================================================

        parts = []


        for segment in segments:

            segment_text = (
                segment.text or ""
            ).strip()


            if not segment_text:
                continue


            avg_logprob = getattr(
                segment,
                "avg_logprob",
                0,
            )


            no_speech_prob = getattr(
                segment,
                "no_speech_prob",
                0,
            )


            logger.debug(
                "[VOICE SEGMENT] %r | logprob: %.3f | no_speech_prob: %.3f",
                segment_text,
                round(avg_logprob, 3),
                round(no_speech_prob, 3),
            )


            # ------------------------------------------------
            # Ignore silence
            # ------------------------------------------------

            if no_speech_prob > 0.75:

                logger.debug(
                    "[VOICE] Ignoring silence segment."
                )

                continue


            # ------------------------------------------------
            # Ignore extremely poor segments
            # ------------------------------------------------

            if avg_logprob < -1.8:

                logger.debug(
                    "[VOICE] Ignoring low-confidence segment."
                )

                continue


            parts.append(
                segment_text
            )


        # ====================================================
        # COMBINE
        # ====================================================

        text = " ".join(
            parts
        ).strip()


        text = re.sub(
            r"\s+",
            " ",
            text,
        ).strip()


        # ====================================================
        # REMOVE REPETITION
        # ====================================================

        text = remove_repetition(
            text
        )


        # ====================================================
        # HINDI PROCESSING
        # ====================================================

        if language == "hi":

            logger.info(
                "[VOICE] Applying Hindi normalization..."
            )


            text = correct_hindi_text(
                text
            )


            # ------------------------------------------------
            # Reject obvious garbage
            # ------------------------------------------------

            if is_bad_hindi_transcription(
                text
            ):

                logger.warning(
                    "[VOICE] Hindi transcription rejected."
                )

                text = ""


        # ====================================================
        # LANGUAGE INFORMATION
        # ====================================================

        detected_language = getattr(
            info,
            "language",
            language,
        )


        language_probability = getattr(
            info,
            "language_probability",
            0,
        )


        # ====================================================
        # FINAL OUTPUT
        # ====================================================

        logger.info(
            "[VOICE] Final transcription result | Text length: %d | Requested: %s | Detected: %s | Probability: %.3f",
            len(text),
            language,
            detected_language,
            round(float(language_probability), 3),
        )


        return {

            "text": text,

            # Always return the language
            # selected by the citizen.
            "language": language,

            "language_probability": round(
                float(
                    language_probability
                ),
                3,
            ),
        }


    finally:

        # ====================================================
        # DELETE TEMP WAV
        # ====================================================

        if (
            wav_path
            and os.path.exists(
                wav_path
            )
        ):

            try:

                os.remove(
                    wav_path
                )

                logger.debug(
                    "[VOICE] Temporary WAV deleted."
                )

            except Exception as error:

                logger.warning(
                    "[VOICE] Could not delete temporary WAV: %s",
                    error,
                )