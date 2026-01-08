/**
 * AFUSSI LEMONFA PRO - Système d'Intelligence Supérieure
 * Code configuré pour le mode Public/Privé sécurisé
 */

let db;
let estIdentifie = false;
let modeGarde = false;
let pointTresor = null;
const PIN_MAITRE = "2026"; 

// On récupère les clés dans la mémoire du téléphone
let GEMINI_API_KEY = localStorage.getItem('AFUSSI_GEMINI') || ""; 
let OPENAI_API_KEY = localStorage.getItem('AFUSSI_OPENAI') || ""; 
let ELEVENLABS_API_KEY = localStorage.getItem('AFUSSI_ELEVEN') || "";
let VOICE_ID = localStorage.getItem('AFUSSI_VOICE') || "EX: Voice_Béninoise_Prestigieuse";

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.lang = 'fr-FR';

// --- MÉMOIRE INTERNE ---
const req = indexedDB.open("AfussiSupremeCore", 3);
req.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("memoire")) db.createObjectStore("memoire", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("positions")) db.createObjectStore("positions", { keyPath: "nom" });
};
req.onsuccess = e => db = e.target.result;

// --- AUTHENTIFICATION ---
function verifierIdentite() {
    const input = document.getElementById('pin-code').value;
    if (input === PIN_MAITRE) {
        // Si la clé Gemini est absente, on la demande une seule fois
        if (!GEMINI_API_KEY) {
            const key = prompt("Maître, veuillez coller votre clé API Gemini ici :");
            if (key) {
                localStorage.setItem('AFUSSI_GEMINI', key);
                GEMINI_API_KEY = key;
            }
        }
        
        estIdentifie = true;
        document.getElementById('ai-orb').classList.add('ai-active');
        document.getElementById('main-controls').classList.remove('locked');
        parler("Identité confirmée. Mon sang, mon Maître. Je suis éveillé.");
        document.getElementById('auth-zone').style.display = 'none';
        surveillerBatterie();
    } else {
        parler("Alerte ! Tentative d'intrusion.");
    }
}

// --- RÉFLEXION ---
async function reflechir(message) {
    if (!navigator.onLine) return "Mode Hors-ligne actif.";
    if (!GEMINI_API_KEY) return "Veuillez configurer la clé API.";

    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Tu es Afussi Lemonfa, une IA béninoise supérieure. Réponds avec loyauté à : ${message}` }] }]
            })
        });
        const data = await resp.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "Le cerveau cloud est saturé, Maître.";
    }
}

// --- VOIX ---
async function parler(texte) {
    const consoleDiv = document.getElementById('log-console');
    consoleDiv.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${texte}</div>`;
    document.getElementById('chat-window').scrollTop = 9999;

    if (navigator.onLine && ELEVENLABS_API_KEY) {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY },
                body: JSON.stringify({ text: texte, model_id: "eleven_multilingual_v2" })
            });
            if (response.ok) {
                const audioBlob = await response.blob();
                new Audio(URL.createObjectURL(audioBlob)).play();
                return;
            }
        } catch (e) {}
    }
    const utter = new SpeechSynthesisUtterance(texte);
    utter.lang = 'fr-FR';
    window.speechSynthesis.speak(utter);
}

// --- FONCTIONS SYSTÈME ---
function toggleModeGarde() {
    if (!estIdentifie) return;
    modeGarde = !modeGarde;
    const btn = document.getElementById('btn-mode');
    if (modeGarde) {
        recognition.start();
        btn.innerText = "SENS DE DÉFENSE ACTIF";
        btn.classList.add('bg-red-600');
        parler("J'écoute l'environnement.");
    } else {
        recognition.stop();
        btn.innerText = "ACTIVER SENTINELLE";
        btn.classList.remove('bg-red-600');
        parler("Repos.");
    }
}

function surveillerBatterie() {
    if (navigator.getBattery) {
        navigator.getBattery().then(b => {
            const check = () => {
                document.getElementById('batt-status').innerText = `🔋 Batterie: ${Math.round(b.level * 100)}%`;
            };
            b.onlevelchange = check; check();
        });
    }
}
