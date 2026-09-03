import logging
import os
import tempfile

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
)

from backend.app.services.voice_service import (
    transcribe_audio,
)

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/voice",
    tags=["Voice Intelligence"],
)


@router.post("/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: str = Form("en"),
):

    # ========================================================
    # LANGUAGE
    # ========================================================

    language = (
        language or "en"
    ).lower().strip()

    if language not in ["en", "hi"]:
        language = "en"


    # ========================================================
    # FILE
    # ========================================================

    filename = (
        audio.filename
        or "voice.webm"
    )

    extension = os.path.splitext(
        filename
    )[1].lower()

    if not extension:
        extension = ".webm"


    temp_path = None


    try:

        # ====================================================
        # READ AUDIO
        # ====================================================

        audio_bytes = await audio.read()

        if not audio_bytes:

            raise HTTPException(
                status_code=400,
                detail="Empty audio file.",
            )


        # ====================================================
        # TEMP FILE
        # ====================================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension,
        ) as temp_file:

            temp_file.write(
                audio_bytes
            )

            temp_path = temp_file.name


        logger.info(
            "[VOICE API] Transcribe request | filename: %s | language: %s | size: %d bytes",
            filename,
            language,
            len(audio_bytes),
        )


        # ====================================================
        # TRANSCRIBE
        # ====================================================

        result = transcribe_audio(
            temp_path,
            language=language,
        )


        text = (
            result.get("text") or ""
        ).strip()


        # ====================================================
        # RESPONSE
        # ====================================================

        return {
            "success": bool(text),
            "filename": filename,
            "text": text,
            "language": language,
            "language_probability": result.get(
                "language_probability",
                0,
            ),
        }


    except HTTPException:
        raise


    except Exception as error:

        logger.error(
            "[VOICE ERROR] Transcription failed: %r",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


    finally:

        # ====================================================
        # DELETE TEMP AUDIO
        # ====================================================

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            try:

                os.remove(
                    temp_path
                )

            except Exception:
                pass