import { useState, useRef } from "react";
import API, { API_BASE_URL } from "../services/api";

function CitizenPortal() {
  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    text: "",
    language: "en",
    latitude: 25.5941,
    longitude: 85.1376,
    district: "Patna",
    state: "Bihar",
  });

  // ============================================================
  // REQUEST STATE
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // LOCATION STATE
  // ============================================================

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  // ============================================================
  // VOICE STATE
  // ============================================================

  const [listening, setListening] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // ============================================================
  // HANDLE FORM INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear old voice message when language changes
    if (name === "language") {
      setVoiceMessage("");
    }
  };

  // ============================================================
  // VOICE INPUT
  // ============================================================

  const startVoiceInput = async () => {
    setVoiceMessage("");
    setError("");

    try {
      // --------------------------------------------------------
      // Browser support
      // --------------------------------------------------------

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setVoiceMessage(
          "🎤 Microphone recording is not supported by this browser."
        );
        return;
      }

      if (!window.MediaRecorder) {
        setVoiceMessage(
          "🎤 Voice recording is not supported by this browser."
        );
        return;
      }

      // --------------------------------------------------------
      // Request microphone
      // --------------------------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      streamRef.current = stream;

      audioChunksRef.current = [];

      // --------------------------------------------------------
      // Select a browser-supported audio format
      // --------------------------------------------------------

      let mimeType = "";

      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      // --------------------------------------------------------
      // Create recorder
      // --------------------------------------------------------

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: 128000,
          })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      // --------------------------------------------------------
      // Receive audio chunks
      // --------------------------------------------------------

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // --------------------------------------------------------
      // Recording started
      // --------------------------------------------------------

      recorder.onstart = () => {
        setListening(true);

        setVoiceMessage(
          form.language === "hi"
            ? "🎙️ रिकॉर्डिंग हो रही है... अपनी समस्या स्पष्ट रूप से बताइए।"
            : "🎙️ Recording... Please clearly describe your problem."
        );
      };

      // --------------------------------------------------------
      // Recording stopped
      // --------------------------------------------------------

      recorder.onstop = async () => {
        setListening(false);

        // Stop microphone
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }

        // ------------------------------------------------------
        // Make audio blob
        // ------------------------------------------------------

        const actualMimeType =
          recorder.mimeType || "audio/webm";

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: actualMimeType,
          }
        );

        audioChunksRef.current = [];

        // ------------------------------------------------------
        // Empty audio
        // ------------------------------------------------------

        if (!audioBlob || audioBlob.size === 0) {
          setVoiceMessage(
            form.language === "hi"
              ? "⚠️ आवाज़ रिकॉर्ड नहीं हुई। कृपया दोबारा प्रयास करें।"
              : "⚠️ No audio was recorded. Please try again."
          );

          return;
        }

        // ------------------------------------------------------
        // Start conversion
        // ------------------------------------------------------

        setVoiceLoading(true);

        setVoiceMessage(
          form.language === "hi"
            ? "🤖 आपकी आवाज़ को टेक्स्ट में बदला जा रहा है..."
            : "🤖 Converting your voice to text..."
        );

        try {
          const formData = new FormData();

          // ----------------------------------------------------
          // Correct file extension
          // ----------------------------------------------------

          let extension = "webm";

          if (actualMimeType.includes("ogg")) {
            extension = "ogg";
          } else if (actualMimeType.includes("webm")) {
            extension = "webm";
          }

          formData.append(
            "audio",
            audioBlob,
            `citizen_voice.${extension}`
          );

          // ----------------------------------------------------
          // IMPORTANT:
          // Explicitly send selected language
          // ----------------------------------------------------

          formData.append(
            "language",
            form.language === "hi" ? "hi" : "en"
          );

          // ----------------------------------------------------
          // API request
          // ----------------------------------------------------

          const response = await fetch(
            `${API_BASE_URL}/voice/transcribe`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(
              `Voice API returned ${response.status}`
            );
          }

          const data = await response.json();

          // ----------------------------------------------------
          // Empty / failed transcription
          // ----------------------------------------------------

          if (
            !data.success ||
            !data.text ||
            !data.text.trim()
          ) {
            setVoiceMessage(
              form.language === "hi"
                ? "⚠️ आवाज़ स्पष्ट नहीं मिली। कृपया पास से और स्पष्ट बोलें।"
                : "⚠️ Clear speech was not detected. Please speak closer to the microphone and try again."
            );

            return;
          }

          const transcript =
            data.text.trim();

          // ----------------------------------------------------
          // Put transcription into textarea
          //
          // REPLACE old text instead of repeatedly appending
          // hallucinated text.
          // ----------------------------------------------------

          setForm((previous) => ({
            ...previous,
            text: transcript,
          }));

          // ----------------------------------------------------
          // IMPORTANT:
          // Keep the language selected by the citizen.
          //
          // Do NOT blindly replace Hindi with Whisper's guess.
          // ----------------------------------------------------

          setVoiceMessage(
            form.language === "hi"
              ? `✓ आवाज़ टेक्स्ट में बदल गई: ${transcript}`
              : `✓ Voice converted: ${transcript}`
          );
        } catch (voiceError) {
          console.error(
            "[VOICE] Transcription error:",
            voiceError
          );

          setVoiceMessage(
            form.language === "hi"
              ? "❌ आवाज़ को टेक्स्ट में बदलने में समस्या हुई। कृपया दोबारा प्रयास करें।"
              : "❌ Unable to convert voice to text. Please try again."
          );
        } finally {
          setVoiceLoading(false);
        }
      };

      // --------------------------------------------------------
      // Recorder error
      // --------------------------------------------------------

      recorder.onerror = (event) => {
        console.error(
          "[VOICE] Recorder error:",
          event
        );

        setListening(false);
        setVoiceLoading(false);

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }

        setVoiceMessage(
          form.language === "hi"
            ? "❌ रिकॉर्डिंग में समस्या हुई।"
            : "❌ Recording failed."
        );
      };

      // --------------------------------------------------------
      // Start recording
      // --------------------------------------------------------

      recorder.start(250);
    } catch (error) {
      console.error(
        "[VOICE] Microphone error:",
        error
      );

      setListening(false);
      setVoiceLoading(false);

      if (error.name === "NotAllowedError") {
        setVoiceMessage(
          form.language === "hi"
            ? "🎤 माइक्रोफोन की अनुमति नहीं मिली। कृपया Browser Settings में Microphone Allow करें।"
            : "🎤 Microphone permission was denied. Please allow microphone access."
        );
      } else if (error.name === "NotFoundError") {
        setVoiceMessage(
          form.language === "hi"
            ? "🎤 कोई माइक्रोफोन नहीं मिला।"
            : "🎤 No microphone was found."
        );
      } else {
        setVoiceMessage(
          `Microphone error: ${error.message}`
        );
      }
    }
  };

  // ============================================================
  // STOP VOICE INPUT
  // ============================================================

  const stopVoiceInput = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }
  };

  // ============================================================
  // GPS + REVERSE GEOCODING
  // ============================================================

  const getCurrentLocation = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        // ------------------------------------------------------
        // Immediately update coordinates
        // ------------------------------------------------------

        setForm((previous) => ({
          ...previous,
          latitude,
          longitude,
        }));

        try {
          setLocationMessage(
            "📍 GPS detected. Finding district..."
          );

          // ----------------------------------------------------
          // Reverse geocoding API
          // ----------------------------------------------------

          const response = await fetch(
            `${API_BASE_URL}/location/reverse`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(
              `Location API returned ${response.status}`
            );
          }

          const locationData =
            await response.json();

          // ----------------------------------------------------
          // Update location information
          // ----------------------------------------------------

          setForm((previous) => ({
            ...previous,

            latitude,
            longitude,

            district:
              locationData.district ||
              previous.district,

            state:
              locationData.state ||
              previous.state,
          }));

          setLocationMessage(
            `📍 Location detected: ${
              locationData.district ||
              "Unknown district"
            }, ${
              locationData.state ||
              "Unknown state"
            }`
          );
        } catch (error) {
          console.error(
            "[LOCATION] Reverse geocoding error:",
            error
          );

          setLocationMessage(
            `📍 GPS detected: ${latitude.toFixed(
              5
            )}, ${longitude.toFixed(
              5
            )}. District could not be determined automatically.`
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error(
          "[LOCATION] GPS error:",
          error
        );

        setLocationLoading(false);

        if (error.code === 1) {
          setLocationMessage(
            "⚠️ Location permission denied. Please allow location access for localhost."
          );
        } else if (error.code === 2) {
          setLocationMessage(
            "⚠️ Location is currently unavailable. Please try again."
          );
        } else if (error.code === 3) {
          setLocationMessage(
            "⚠️ Location request timed out. Please try again."
          );
        } else {
          setLocationMessage(
            "⚠️ Unable to detect location."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // ============================================================
  // SUBMIT REQUEST
  // ============================================================

  const submitRequest = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!form.text.trim()) {
      setError(
        form.language === "hi"
          ? "कृपया अपनी समस्या बताएं।"
          : "Please describe your problem."
      );

      setLoading(false);

      return;
    }

    try {
      const response = await API.post(
        "/requests/analyze",
        {
          ...form,

          text: form.text.trim(),

          latitude:
            Number(form.latitude),

          longitude:
            Number(form.longitude),
        }
      );

      setResult(
        response.data
      );

      setVoiceMessage("");
    } catch (err) {
      console.error(
        "[REQUEST] Submit error:",
        err
      );

      setError(
        form.language === "hi"
          ? "आपका अनुरोध भेजने में समस्या हुई। कृपया दोबारा प्रयास करें।"
          : "Unable to submit your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="citizen-page">

      <div className="citizen-container">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="citizen-header">

          <div className="citizen-icon">
            🏛️
          </div>

          <h1>
            Citizen Development Portal
          </h1>

          <p>
            Report local infrastructure
            and public service problems.
          </p>

        </div>


        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          className="citizen-form"
          onSubmit={submitRequest}
        >

          {/* ===================================================
              PROBLEM
          ==================================================== */}

          <div className="form-group">

            <label>
              {form.language === "hi"
                ? "अपनी समस्या बताएं"
                : "Describe your problem"}
            </label>

            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              placeholder={
                form.language === "hi"
                  ? "उदाहरण: हमारे गांव में पीने के लिए साफ पानी नहीं है..."
                  : "Example: There is no clean drinking water in our village..."
              }
              rows="6"
              required
            />


            {/* =================================================
                VOICE
            ================================================== */}

            <div className="voice-section">

              {!listening ? (

                <button
                  type="button"
                  className="voice-button"
                  onClick={startVoiceInput}
                  disabled={voiceLoading}
                >
                  {voiceLoading
                    ? "🤖 Converting..."
                    : form.language === "hi"
                    ? "🎙️ अपनी समस्या बोलें"
                    : "🎙️ Speak Your Problem"}
                </button>

              ) : (

                <button
                  type="button"
                  className="voice-button listening"
                  onClick={stopVoiceInput}
                >
                  🔴 Stop Listening
                </button>

              )}


              {voiceMessage && (

                <p className="voice-message">
                  {voiceMessage}
                </p>

              )}

            </div>

          </div>


          {/* ===================================================
              LANGUAGE + DISTRICT
          ==================================================== */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Language
              </label>

              <select
                name="language"
                value={form.language}
                onChange={handleChange}
              >

                <option value="en">
                  English
                </option>

                <option value="hi">
                  Hindi
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                District
              </label>

              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* ===================================================
              STATE + LATITUDE + LONGITUDE
          ==================================================== */}

          <div className="form-row">

            <div className="form-group">

              <label>
                State
              </label>

              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Latitude
              </label>

              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Longitude
              </label>

              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* ===================================================
              LOCATION
          ==================================================== */}

          <div className="location-section">

            <button
              type="button"
              className="location-button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
            >

              {locationLoading
                ? "📍 Detecting Location..."
                : "📍 Use My Current Location"}

            </button>


            {locationMessage && (

              <p className="location-message">
                {locationMessage}
              </p>

            )}

          </div>


          {/* ===================================================
              SUBMIT
          ==================================================== */}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >

            {loading
              ? "🤖 AI Analyzing..."
              : "Submit Development Request"}

          </button>

        </form>


        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="error-box">
            {error}
          </div>

        )}


        {/* =====================================================
            AI RESULT
        ====================================================== */}

        {result && (

          <div className="result-card">

            <div className="result-header">

              <div>

                <span className="result-label">
                  AI Analysis Complete
                </span>

                <h2>
                  Request #{result.id}
                </h2>

              </div>


              <div className="success-icon">
                ✓
              </div>

            </div>


            <div className="analysis-grid">

              <div className="analysis-item">

                <span>
                  Category
                </span>

                <strong>
                  {result.analysis?.category}
                </strong>

              </div>


              <div className="analysis-item">

                <span>
                  AI Confidence
                </span>

                <strong>
                  {result.analysis?.confidence}
                </strong>

              </div>


              <div className="analysis-item">

                <span>
                  District
                </span>

                <strong>
                  {result.location?.district}
                </strong>

              </div>


              <div className="analysis-item">

                <span>
                  Database
                </span>

                <strong>
                  {result.database_status}
                </strong>

              </div>

            </div>


            <div className="result-message">

              <strong>
                Your request has been recorded.
              </strong>

              <p>
                The AI system has categorized
                your development concern and
                added it to the government
                intelligence system.
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default CitizenPortal;