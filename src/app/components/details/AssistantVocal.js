"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function AssistantVocal({ etapes = [], changeEtape }) {
    // compatibilité et interface
    const [supporte, setSupporte] = useState(false); // supporte les APIs vocales ou non
    const [showFallback, setShowFallback] = useState(false); // affiche interface de secours si supporte pas

    // états de l'assistant
    const [ecoute, setEcoute] = useState(false);
    const [active, setActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReadingStep, setIsReadingStep] = useState(false);

    // navigation et feedback
    const [etapeActuelle, setEtapeActuelle] = useState(0);
    const [lastCommand, setLastCommand] = useState(""); // pour le tooltip

    // refs pour éviter les problèmes de closure dans les callbacks
    const recognitionRef = useRef(null);
    const utteranceRef = useRef(null);
    const restartTimeoutRef = useRef(null); // pour redémarrage automatique
    const speechQueueRef = useRef(false); // pour éviter les synthèses vocales multiples
    const etapeActuelleRef = useRef(0);

    // seuil min. pour la confiance vocale
    const CONFIDENCE_THRESHOLD = 0.7;

    // gestion vocale
    const gererVocal = useCallback((action, params = {}) => {
        const { texte, isStep = false, etapeIndex } = params;

        switch (action) {
            case 'parler':
                // éviter les synthèses multiples simultanées
                if (speechQueueRef.current) {
                    console.log('Synthèse déjà en cours, commande ignorée');
                    return;
                }
                // synthèse en cours
                speechQueueRef.current = true;

                // arrêter toute synthèse précédente pour éviter les conflits
                window.speechSynthesis.cancel();
                if (utteranceRef.current) utteranceRef.current = null;

                // configurer et lancer la synthèse
                const speak = () => {
                    const utterance = new SpeechSynthesisUtterance(texte);

                    utterance.lang = 'fr-FR';
                    utterance.rate = 0.8;
                    utterance.pitch = 1.0;
                    utterance.volume = 1.0;

                    // imposer voix fr
                    const voices = window.speechSynthesis.getVoices();

                    // voix Amélie safari
                    let selectedVoice = voices.find(voice => voice.name === 'Amélie');
                    if (!selectedVoice) {
                        selectedVoice = voices.find(voice => voice.name.includes('Google français'));
                    }
                    // 1ere voix fr disponible ou voix par défaut
                    if (!selectedVoice) {
                        selectedVoice = voices.find(voice => voice.lang.startsWith('fr')) || voices[0];
                    }

                    utterance.voice = selectedVoice;

                    utterance.onstart = () => {
                        setIsProcessing(true);
                        if (isStep) setIsReadingStep(true);
                    };

                    // réinitialiser tous les états
                    utterance.onend = () => {
                        setIsProcessing(false);
                        speechQueueRef.current = false;
                        utteranceRef.current = null;
                        if (isStep) setIsReadingStep(false);
                    };

                    utterance.onerror = (event) => {
                        console.error('Erreur lors de la synthèse vocale:', event.error);
                        // réinitialiser en cas d'erreur
                        setIsProcessing(false);
                        speechQueueRef.current = false;
                        utteranceRef.current = null;
                        if (isStep) setIsReadingStep(false);
                    };

                    // sauvegarder la ref et lancer la synthèse
                    utteranceRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                };

                // code généré par Claude.ai
                // gérer le cas où les voix sont pas encore chargées
                if (window.speechSynthesis.getVoices().length === 0) {
                    // Attendre le chargement des voix
                    window.speechSynthesis.onvoiceschanged = () => {
                        window.speechSynthesis.onvoiceschanged = null; // Nettoyer le listener
                        speak();
                    };
                    // Fallback en cas de problème avec onvoiceschanged
                    setTimeout(speak, 1000);
                } else {
                    // Les voix sont déjà disponibles
                    speak();
                }
                break;

            case 'changerEtape':
                // éviter les chgmt d'étape pdt que l'assistant parle
                if (speechQueueRef.current || isProcessing) {
                    console.log('Assistant en train de parler, changement d\'étape reporté');
                    return;
                }

                // vérif des limites de navigation
                if (etapeIndex < 0) {
                    gererVocal('parler', { texte: "Vous êtes déjà à la première étape" });
                    return;
                }
                if (etapeIndex >= etapes.length) {
                    gererVocal('parler', { texte: "C'est la fin de la recette. Bon appétit !" });
                    return;
                }

                // maj de l'état de l'étape actuelle
                etapeActuelleRef.current = etapeIndex; 
                setEtapeActuelle(etapeIndex);

                // notifier le composant parent du chgmt d'étape
                setTimeout(() => {
                    if (changeEtape) {
                        changeEtape(etapeIndex);
                    }
                }, 0);

                console.log(`Navigation vers l'étape ${etapeIndex + 1}/${etapes.length}`);

                // s'assurer que l'état est à jour
                setTimeout(() => {
                    const etapeTexte = etapes[etapeIndex]?.etape;
                    if (etapeTexte) {
                        let texteFinal = `Étape ${etapeIndex + 1}: ${etapeTexte}`;

                        // msg de fin si dernière étape
                        if (etapeIndex === etapes.length - 1) {
                            texteFinal += ". C'est la fin de la recette. Bon appétit !";
                        }

                        // lancer la synthèse vocale de l'étape
                        gererVocal('parler', {
                            texte: texteFinal,
                            isStep: true 
                        });
                    }
                }, 200);

                // maj affichage de dernière commande
                setLastCommand(`Étape ${etapeIndex + 1}`);
                break;

            default:
                console.warn(`Action vocale inconnue: ${action}`);
        }
    }, [etapes, changeEtape, isProcessing]);

    // arrêt complet assistant
    const stopAssistant = useCallback(() => {
        console.log('Arrêt complet de l\'assistant vocal');

        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // empêcher le redémarrage automatique
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        clearTimeout(restartTimeoutRef.current);

        // réinitialiser tous les états
        setEcoute(false);
        setActive(false);
        setIsProcessing(false);
        setIsReadingStep(false);
        speechQueueRef.current = false;
        utteranceRef.current = null;

        console.log('Assistant complètement arrêté');
    }, []);

    // traiter commandes vocales
    const traiterCommande = useCallback((transcript, confidence) => {
        // Ignorer commandes avec confiance trop faible
        if (confidence < CONFIDENCE_THRESHOLD) {
            console.log(`Commande ignorée (confiance ${confidence} < ${CONFIDENCE_THRESHOLD})`);
            return false;
        }

        const texte = transcript.toLowerCase().trim();
        console.log(`Traitement de la commande: "${texte}" (confiance: ${confidence})`);

        // nav par num
        // Recherche de patterns comme "étape 3" ou juste "3"
        const matchNumero = texte.match(/étape\s*(\d+)|^(\d+)$/);
        if (matchNumero) {
            const numero = parseInt(matchNumero[1] || matchNumero[2]);
            // vérif que le num existe
            if (numero >= 1 && numero <= etapes.length) {
                const targetIndex = numero - 1;
                gererVocal('changerEtape', { etapeIndex: targetIndex });
                return true;
            }
        }
        // récup étape actuelle
        const currentEtape = etapeActuelleRef.current;

        // définir les commandes
        const commandes = {
            'étape suivante': () => {
                const newIndex = Math.min(currentEtape + 1, etapes.length - 1);
                if (newIndex !== currentEtape) { // évite actions redondantes
                    gererVocal('changerEtape', { etapeIndex: newIndex });
                }
            },

            'étape précédente': () => {
                const newIndex = Math.max(currentEtape - 1, 0);
                if (newIndex !== currentEtape) {
                    gererVocal('changerEtape', { etapeIndex: newIndex });
                }
            },

            'répéter': () => {
                gererVocal('changerEtape', { etapeIndex: currentEtape });
            },

            'ok chef': () => {
                gererVocal('changerEtape', { etapeIndex: 0 });
            },

            'désactiver': () => {
                if (recognitionRef.current) {
                    recognitionRef.current.onend = null;
                    recognitionRef.current.stop();
                    recognitionRef.current = null;
                }
                clearTimeout(restartTimeoutRef.current);
                setEcoute(false);

                // la voix pour msg de désactivation
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(voice => voice.name === 'Amélie')
                    || voices.find(voice => voice.lang.startsWith('fr'))
                    || voices[0];

                // msg de confirmation de désactivation
                const utterance = new SpeechSynthesisUtterance("Assistant désactivé. Cliquez sur le bouton pour réactiver.");
                utterance.lang = 'fr-FR';
                utterance.voice = selectedVoice;
                utterance.rate = 0.8;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                // arrêter assistant une fois le msg terminé
                utterance.onend = () => {
                    console.log('Message de désactivation terminé, arrêt complet');
                    setActive(false);
                    setIsProcessing(false);
                    setIsReadingStep(false);
                    speechQueueRef.current = false;
                    utteranceRef.current = null;
                };

                utterance.onerror = () => {
                    console.log('Erreur lors de la synthèse de désactivation, arrêt immédiat');
                    stopAssistant();
                };

                // arrêter toute synthèse en cours et lancer le msg de désactivation
                window.speechSynthesis.cancel();
                speechQueueRef.current = true;
                window.speechSynthesis.speak(utterance);
            }
        };

        // recherche commande exacte
        if (commandes[texte]) {
            commandes[texte]();
            return true;
        }

        // limiter à 2 mots
        if (texte.split(" ").length <= 2) {
            for (const [motCle, action] of Object.entries(commandes)) {
                // Recherche de mots-clés significatifs (longueur > 3)
                if (texte.includes(motCle) && motCle.length > 3) {
                    action();
                    return true;
                }
            }
        }
        return false;
    }, [etapes.length, stopAssistant, gererVocal]);

    // config reconnaissance vocale
    const setupRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        Object.assign(recognition, {
            continuous: true,
            interimResults: false,
            lang: 'fr-FR',
            maxAlternatives: 1 
        });     

        // gestion events
        recognition.onstart = () => {
            console.log('Reconnaissance vocale démarrée');
            clearTimeout(restartTimeoutRef.current);
        };

        recognition.onresult = (event) => {
            // éviter auto-écoute
            if (isReadingStep || isProcessing) {
                console.log("Commande ignorée: assistant en train de parler");
                return;
            }

            // traiter nv résultats
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];

                // traiter que résultats finaux
                if (result.isFinal) {
                    const [transcript, confidence] = [result[0].transcript, result[0].confidence];
                    const texte = transcript.toLowerCase().trim();

                    // filtrer txt trop longs
                    if (texte.length > 50) {
                        console.log("Texte ignoré: trop long (auto-écoute détectée)");
                        return;
                    }
                    // filtrer txt trop courts
                    if (texte.length < 2) {
                        console.log("Texte ignoré: trop court");
                        return;
                    }

                    console.log(`Commande détectée: "${transcript}" (confiance: ${confidence}) - Étape: ${etapeActuelleRef.current + 1}`);

                    const commandeReconnue = traiterCommande(transcript, confidence);

                    // logger les commandes non reconnues avec une bonne confiance
                    if (!commandeReconnue && confidence > 0.8 && texte.split(" ").length <= 3) {
                        console.warn("Commande non reconnue avec bonne confiance:", transcript);
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            // ignorer "no-speech"
            if (event.error === 'no-speech') return;
            console.error('Erreur de reconnaissance vocale:', event.error);
        };

        recognition.onend = () => {
            console.log('Reconnaissance vocale arrêtée');
            // redémarrage automatique si assistant tjs actif
            if (active) {
                try {
                    recognition.start();
                    console.log("Redémarrage automatique de la reconnaissance");
                } catch (error) {
                    console.error("Erreur lors du redémarrage:", error);
                    restartTimeoutRef.current = setTimeout(() => {
                        try {
                            recognition.start();
                        } catch (retryError) {
                            console.error("Échec du redémarrage différé:", retryError);
                        }
                    }, 1000);
                }
            }
        };

        return recognition;
    }, [traiterCommande, isReadingStep, isProcessing, active]);

    // micro
    const stopMicro = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // Empêcher le redémarrage automatique
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        clearTimeout(restartTimeoutRef.current);
        setEcoute(false);
        console.log("Microphone désactivé manuellement");
    }, []);

    // gestion écoute
    const toggleEcoute = useCallback(() => {
        if (!ecoute) {
            // Démarrer l'écoute
            try {
                const recognition = setupRecognition();
                recognitionRef.current = recognition;
                recognition.start();
                setEcoute(true);
                console.log("Écoute vocale activée");
            } catch (error) {
                console.error('Erreur lors du démarrage de la reconnaissance:', error);
                setEcoute(false);
            }
        } else {
            stopMicro();
        }
    }, [ecoute, setupRecognition, stopMicro]);

    // test et activation assistant
    const testAssistant = useCallback(() => {
        // vérif support avant d'activer
        if (!supporte) {
            setShowFallback(true);
            return;
        }

        console.log("Activation de l'assistant vocal");
        setIsProcessing(true);

        gererVocal('parler', { texte: 'Bonjour, appuyez sur le bouton et dites "ok chef"' });

        setTimeout(() => {
            setActive(true);
            setIsProcessing(false);
            console.log("Assistant vocal prêt");
        }, 3000);
    }, [supporte, gererVocal]);

    // vérif support des APIs vocales au montage
    useEffect(() => {
        const checkSupport = () => {
            const isSupported = 'speechSynthesis' in window &&
                ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

            setSupporte(isSupported);
            setShowFallback(!isSupported);

            if (isSupported) {
                // chgmt des voix
                window.speechSynthesis.getVoices();
                console.log("Support vocal détecté et voix chargées");
            } else {
                console.warn("APIs vocales non supportées par ce navigateur");
            }
        };

        checkSupport();

        // écouter chgmt des voix
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = checkSupport;
            // nettoyer listener au démontage
            return () => {
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    }, []);

    // synchronisation ref avec l'état
    useEffect(() => {
        etapeActuelleRef.current = etapeActuelle;
        console.log(`État synchronisé: étape ${etapeActuelle + 1}/${etapes.length}`);
    }, [etapeActuelle, etapes.length]);

    useEffect(() => {
        return () => {
            console.log("Nettoyage du composant AssistantVocal");
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (utteranceRef.current) {
                window.speechSynthesis.cancel();
            }
            speechQueueRef.current = false;
            clearTimeout(restartTimeoutRef.current);
        };
    }, []);

    // txt du tooltip selon l'état
    const getTooltipText = () => {
        if (isProcessing) return "Assistant en train de parler...";
        if (!active) return "Activer l'assistant vocal";
        if (!ecoute) return "Cliquez pour activer l'écoute vocale";

        // commandes disponibles
        return `Commandes exactes:\n• étape suivante \n• étape précédente\n• répéter\n• étape 1, 2, 3...\n• désactiver${lastCommand ? `\n\nDernière: ${lastCommand}` : ''}`;
    };

    // CSS du btn selon l'état
    const getButtonClasses = () => {
        const baseClasses = "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center text-2xl font-bold hover:scale-110 hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed";

        const stateClasses = ecoute
            ? "bg-red-500 text-white animate-pulse ring-4 ring-red-300"
            : active
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-orange text-white hover:bg-brun";

        // Animation
        const processingClass = isProcessing ? "animate-spin" : "";

        return `${baseClasses} ${stateClasses} ${processingClass}`;
    };

    // icone btn selon l'état
    const getButtonIcon = () => {
        return isProcessing ? '⏳' : ecoute ? '🔴' : active ? '🎤' : '▶️';
    };

    const getStatusText = () => {
        return isProcessing ? "Parle..." : ecoute ? "Écoute..." : "En attente";
    };

    // Ne pas afficher si pas de support et pas de fallback
    if (!supporte && !showFallback) return null;

    return (
        <>
            {/* btn principal flottant */}
            <div className="fixed bottom-6 right-6 z-50 font-quicksand">
                <div className="relative group">
                    <button
                        onClick={() => {
                            if (ecoute) {
                                stopMicro(); 
                            } else if (active) {
                                toggleEcoute();
                            } else {
                                testAssistant(); 
                            }
                        }}
                        disabled={isProcessing} // désactiver pdt le traitement
                        className={getButtonClasses()}
                        title={getTooltipText()}
                        aria-label={getTooltipText()}
                    >
                        {getButtonIcon()}
                    </button>

                    {/* compteur étapes */}
                    {active && etapes.length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-brun text-jaune text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-300">
                            {etapeActuelle + 1}/{etapes.length}
                        </div>
                    )}

                    {/* tooltip détaillé*/}
                    <div className="absolute bottom-20 right-0 mb-2 px-3 py-2 bg-brun text-jaune text-xs md:text-sm rounded-lg shadow-lg whitespace-pre max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {getTooltipText()}
                    </div>
                </div>

                {/* indicateur de statut */}
                {active && (
                    <div className="absolute -bottom-2 right-12 text-xs text-jaune bg-brun px-2 py-1 rounded shadow-sm border border-jaune">
                        {getStatusText()}
                    </div>
                )}
            </div>

            {/* interface de secours pour navigateurs non compatibles */}
            {showFallback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 m-4 max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Assistant Vocal</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            La reconnaissance vocale n&apos;est pas supportée. Utilisez les contrôles manuels :
                        </p>

                        {/* btn de contrôle manuel */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                {
                                    text: "← Précédent",
                                    action: () => {
                                        const newIndex = Math.max(etapeActuelle - 1, 0);
                                        if (newIndex !== etapeActuelle) {
                                            setEtapeActuelle(newIndex);
                                            gererVocal('changerEtape', { etapeIndex: newIndex });
                                        }
                                    },
                                    disabled: etapeActuelle === 0
                                },
                                {
                                    text: "Répéter",
                                    action: () => gererVocal('changerEtape', { etapeIndex: etapeActuelle }),
                                    disabled: false
                                },
                                {
                                    text: "Suivant →",
                                    action: () => {
                                        const newIndex = Math.min(etapeActuelle + 1, etapes.length - 1);
                                        if (newIndex !== etapeActuelle) {
                                            setEtapeActuelle(newIndex);
                                            gererVocal('changerEtape', { etapeIndex: newIndex });
                                        }
                                    },
                                    disabled: etapeActuelle === etapes.length - 1
                                }
                            ].map(({ text, action, disabled }, index) => (
                                <button
                                    key={index}
                                    className={`px-3 py-1 text-white rounded text-sm transition-colors ${disabled
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : index === 1
                                            ? "bg-blue-500 hover:bg-blue-600"
                                            : "bg-gray-500 hover:bg-gray-600"
                                        }`}
                                    onClick={action}
                                    disabled={disabled}
                                    aria-label={text}
                                >
                                    {text}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowFallback(false)}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            aria-label="Fermer l'interface de secours"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}