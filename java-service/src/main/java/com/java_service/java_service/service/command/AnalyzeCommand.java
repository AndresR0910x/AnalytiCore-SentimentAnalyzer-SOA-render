package com.java_service.java_service.service.command;

import com.java_service.java_service.model.*;
import com.java_service.java_service.repository.*;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class AnalyzeCommand {
    private final String jobId;
    private final JobRepository jobRepository;
    
    // Diccionarios de sentimientos mejorados (español e inglés)
    private static final Set<String> POSITIVE_WORDS = Set.of(
        // Español
        "bueno", "excelente", "genial", "fantástico", "increíble", "maravilloso", 
        "perfecto", "estupendo", "magnífico", "extraordinario", "brillante", 
        "fabuloso", "espectacular", "fenomenal", "grandioso", "hermoso",
        "alegre", "feliz", "contento", "satisfecho", "emocionado", "radiante",
        "exitoso", "triunfante", "victorioso", "ganador", "próspero",
        "amor", "cariño", "afecto", "pasión", "admiración", "respeto",
        "positivo", "optimista", "esperanzado", "confiado", "seguro",
        // Inglés
        "good", "great", "excellent", "amazing", "wonderful", "fantastic", 
        "perfect", "brilliant", "outstanding", "superb", "magnificent",
        "awesome", "incredible", "marvelous", "spectacular", "fabulous",
        "happy", "joyful", "cheerful", "delighted", "excited", "thrilled",
        "successful", "triumphant", "victorious", "winning", "prosperous",
        "love", "adore", "cherish", "treasure", "appreciate", "admire",
        "positive", "optimistic", "hopeful", "confident", "assured"
    );
    
    private static final Set<String> NEGATIVE_WORDS = Set.of(
        // Español
        "malo", "terrible", "horrible", "pésimo", "deplorable", "desastroso",
        "espantoso", "nefasto", "lamentable", "patético", "repugnante",
        "triste", "deprimido", "melancólico", "abatido", "desanimado",
        "furioso", "enojado", "molesto", "irritado", "indignado", "airado",
        "fracaso", "derrota", "pérdida", "ruina", "catástrofe", "desgracia",
        "odio", "desprecio", "asco", "repulsión", "aversión", "rechazo",
        "negativo", "pesimista", "desesperanzado", "desconfiado", "inseguro",
        // Inglés
        "bad", "awful", "dreadful", "atrocious", "disgusting", "appalling", 
        "abysmal", "pathetic", "sad", "depressed", "miserable", "dejected", 
        "downhearted", "gloomy", "angry", "furious", "mad", "irritated", 
        "annoyed", "outraged", "failure", "disaster", "catastrophe", "defeat", 
        "loss", "ruin", "hate", "despise", "loathe", "detest", "abhor", 
        "disgust", "negative", "pessimistic", "hopeless", "doubtful", "uncertain"
    );
    
    // Palabras vacías (stop words) en español e inglés
    private static final Set<String> STOP_WORDS = Set.of(
        // Español
        "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", 
        "da", "su", "por", "son", "con", "para", "al", "una", "ser", "son", "como", "más",
        "este", "esta", "del", "han", "ha", "las", "los", "pero", "sus", "me", "hasta",
        "donde", "quien", "desde", "todos", "durante", "todo", "ella", "muy", "sin", "sobre",
        // Inglés
        "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from",
        "up", "about", "into", "through", "during", "before", "after", "above", "below", "between",
        "among", "within", "without", "against", "upon", "beneath", "beside", "beyond", "across",
        "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
        "did", "will", "would", "could", "should", "may", "might", "must", "can", "cannot",
        "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
        "my", "your", "his", "her", "its", "our", "their", "this", "that", "these", "those"
    );

    public AnalyzeCommand(String jobId, JobRepository jobRepository) {
        this.jobId = jobId;
        this.jobRepository = jobRepository;
    }

    public void execute() {
        try {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Trabajo no encontrado: " + jobId));
            
            job.setStatus(Job.JobStatus.PROCESANDO);
            jobRepository.save(job);

            String text = job.getText();
            
            // Análisis mejorado de sentimientos
            SentimentResult sentimentResult = analyzeSentimentAdvanced(text);
            String keywords = extractKeywordsAdvanced(text);

            job.setSentiment(sentimentResult.getSentiment());
            job.setKeywords(keywords);
            job.setStatus(Job.JobStatus.COMPLETADO);
            jobRepository.save(job);
            
        } catch (Exception e) {
            // Manejar errores y actualizar el estado del trabajo
            Job job = jobRepository.findById(jobId).orElse(null);
            if (job != null) {
                job.setStatus(Job.JobStatus.PENDIENTE);
                jobRepository.save(job);
            }
            throw new RuntimeException("Error en el análisis de texto: " + e.getMessage(), e);
        }
    }

    /**
     * Análisis de sentimientos mejorado con puntajes y contexto
     */
    private SentimentResult analyzeSentimentAdvanced(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new SentimentResult("NEUTRAL", 0.0, 0, 0);
        }

        String normalizedText = normalizeText(text);
        String[] words = tokenizeText(normalizedText);
        
        int positiveCount = 0;
        int negativeCount = 0;
        double sentimentScore = 0.0;
        
        // Análisis por palabras con contexto
        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            double wordWeight = 1.0;
            
            // Detectar intensificadores (muy, extremely, etc.)
            if (i > 0) {
                String previousWord = words[i - 1];
                if (isIntensifier(previousWord)) {
                    wordWeight = 1.5; // Aumentar peso si hay intensificador
                }
            }
            
            // Detectar negaciones (no, not, nunca, etc.)
            boolean isNegated = false;
            if (i > 0 && i < words.length - 1) {
                String previousWord = words[i - 1];
                if (isNegation(previousWord)) {
                    isNegated = true;
                }
            }
            
            if (POSITIVE_WORDS.contains(word)) {
                if (isNegated) {
                    negativeCount++;
                    sentimentScore -= wordWeight;
                } else {
                    positiveCount++;
                    sentimentScore += wordWeight;
                }
            } else if (NEGATIVE_WORDS.contains(word)) {
                if (isNegated) {
                    positiveCount++;
                    sentimentScore += wordWeight;
                } else {
                    negativeCount++;
                    sentimentScore -= wordWeight;
                }
            }
        }
        
        // Normalizar el puntaje
        int totalWords = words.length;
        double normalizedScore = totalWords > 0 ? sentimentScore / totalWords : 0.0;
        
        // Determinar el sentimiento final
        String sentiment;
        if (normalizedScore > 0.1) {
            sentiment = "POSITIVE";
        } else if (normalizedScore < -0.1) {
            sentiment = "NEGATIVE";
        } else {
            sentiment = "NEUTRAL";
        }
        
        return new SentimentResult(sentiment, normalizedScore, positiveCount, negativeCount);
    }

    /**
     * Extracción de palabras clave mejorada con filtrado y relevancia
     */
    private String extractKeywordsAdvanced(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        String normalizedText = normalizeText(text);
        
        return Arrays.stream(tokenizeText(normalizedText))
                .filter(word -> word.length() > 2) // Palabras de al menos 3 caracteres
                .filter(word -> !STOP_WORDS.contains(word)) // Filtrar palabras vacías
                .filter(word -> !word.matches("\\d+")) // Excluir números puros
                .filter(this::isRelevantWord) // Filtro adicional de relevancia
                .collect(Collectors.groupingBy(word -> word, Collectors.counting()))
                .entrySet().stream()
                .filter(entry -> entry.getValue() > 1) // Solo palabras que aparecen más de una vez
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10) // Aumentar a 10 palabras clave
                .map(entry -> entry.getKey() + "(" + entry.getValue() + ")") // Incluir frecuencia
                .collect(Collectors.joining(", "));
    }

    /**
     * Normaliza el texto eliminando acentos, convirtiendo a minúsculas y limpiando caracteres especiales
     */
    private String normalizeText(String text) {
        if (text == null) return "";
        
        // Eliminar acentos
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        normalized = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        
        // Convertir a minúsculas y limpiar caracteres especiales
        return normalized.toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Tokeniza el texto en palabras individuales
     */
    private String[] tokenizeText(String text) {
        return text.split("\\s+");
    }

    /**
     * Detecta si una palabra es un intensificador
     */
    private boolean isIntensifier(String word) {
        Set<String> intensifiers = Set.of("muy", "extremely", "really", "quite", "totally", 
                                         "absolutely", "completely", "entirely", "utterly", 
                                         "bastante", "sumamente", "tremendamente");
        return intensifiers.contains(word);
    }

    /**
     * Detecta si una palabra es una negación
     */
    private boolean isNegation(String word) {
        Set<String> negations = Set.of("no", "not", "never", "nothing", "nobody", "nowhere",
                                      "nunca", "nada", "nadie", "ninguno", "ninguna", "jamas");
        return negations.contains(word);
    }

    /**
     * Determina si una palabra es relevante para ser palabra clave
     */
    private boolean isRelevantWord(String word) {
        // Filtrar palabras muy comunes o poco significativas
        Set<String> irrelevantWords = Set.of("cosa", "cosas", "algo", "alguien", "someone", 
                                            "something", "anything", "everything", "nothing");
        return !irrelevantWords.contains(word) && word.length() >= 3;
    }

    /**
     * Clase interna para encapsular resultados de análisis de sentimientos
     */
    private static class SentimentResult {
        private final String sentiment;
        private final double score;
        private final int positiveCount;
        private final int negativeCount;

        public SentimentResult(String sentiment, double score, int positiveCount, int negativeCount) {
            this.sentiment = sentiment;
            this.score = score;
            this.positiveCount = positiveCount;
            this.negativeCount = negativeCount;
        }

        public String getSentiment() { return sentiment; }
        public double getScore() { return score; }
        public int getPositiveCount() { return positiveCount; }
        public int getNegativeCount() { return negativeCount; }
    }
}