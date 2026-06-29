package com.tensonly.controller;

import com.tensonly.entity.EventVibe;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @GetMapping("/questions")
    public ResponseEntity<List<Map<String, Object>>> questions() {
        List<Map<String, Object>> questions = List.of(
                question("q1", "What's your ideal night out vibe?", List.of(
                        option("a", "Deep, hypnotic techno till sunrise", "TECHNO"),
                        option("b", "Smooth, groovy house on a rooftop", "HOUSE"),
                        option("c", "Hard-hitting hip-hop beats", "HIP_HOP"),
                        option("d", "Bollywood mashups with energy", "BOLLYWOOD")
                )),
                question("q2", "Which venue speaks to you?", List.of(
                        option("a", "A gritty underground warehouse", "UNDERGROUND"),
                        option("b", "An open-air beach setup", "BEACH"),
                        option("c", "A skyline rooftop bar", "ROOFTOP"),
                        option("d", "A retro-themed classic club", "RETRO")
                )),
                question("q3", "Pick your crowd energy:", List.of(
                        option("a", "Intimate, heads-down, serious dancers", "TECHNO"),
                        option("b", "Friendly, chatty, social groovers", "HOUSE"),
                        option("c", "High-energy, hype, hands-up", "HIP_HOP"),
                        option("d", "Experimental, open-minded listeners", "EXPERIMENTAL")
                )),
                question("q4", "How late do you stay?", List.of(
                        option("a", "Till the lights come on (6am+)", "UNDERGROUND"),
                        option("b", "Midnight to 3am, then home", "HOUSE"),
                        option("c", "Whenever the vibe drops", "BOLLYWOOD"),
                        option("d", "Early sets only, sunset sessions", "ROOFTOP")
                ))
        );
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/vibes")
    public ResponseEntity<List<Map<String, String>>> vibes() {
        return ResponseEntity.ok(
                java.util.Arrays.stream(EventVibe.values())
                        .map(v -> Map.of("value", v.name(), "label", prettify(v.name())))
                        .toList()
        );
    }

    /**
     * Scores submitted quiz answers. Each answered option maps to a vibe; the
     * dominant vibe and an alignment percentage are returned.
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(@RequestBody SubmitRequest request) {
        Map<String, Map<String, String>> lookup = optionVibeLookup();
        Map<String, Integer> tally = new HashMap<>();
        int total = 0;
        if (request != null && request.getAnswers() != null) {
            for (Answer a : request.getAnswers()) {
                if (a == null || a.getQuestionId() == null || a.getOptionId() == null) continue;
                Map<String, String> opts = lookup.get(a.getQuestionId());
                if (opts == null) continue;
                String vibe = opts.get(a.getOptionId());
                if (vibe == null) continue;
                tally.merge(vibe, 1, Integer::sum);
                total++;
            }
        }

        String dominant = "TECHNO";
        int max = 0;
        for (Map.Entry<String, Integer> e : tally.entrySet()) {
            if (e.getValue() > max) {
                max = e.getValue();
                dominant = e.getKey();
            }
        }
        int alignment = total == 0 ? 0 : Math.min(98, (int) Math.round((double) max / total * 100) + 20);

        Map<String, Object> result = new HashMap<>();
        result.put("vibeAlignment", alignment);
        result.put("dominantVibe", dominant);
        return ResponseEntity.ok(result);
    }

    /** questionId -> (optionId -> vibe), mirrors the data returned by /questions. */
    private Map<String, Map<String, String>> optionVibeLookup() {
        Map<String, Map<String, String>> lookup = new HashMap<>();
        for (Map<String, Object> q : questions().getBody()) {
            String qid = (String) q.get("id");
            @SuppressWarnings("unchecked")
            List<Map<String, String>> opts = (List<Map<String, String>>) q.get("options");
            Map<String, String> byOption = new HashMap<>();
            for (Map<String, String> o : opts) {
                byOption.put(o.get("id"), o.get("vibe"));
            }
            lookup.put(qid, byOption);
        }
        return lookup;
    }

    public static class SubmitRequest {
        private List<Answer> answers;
        public List<Answer> getAnswers() { return answers; }
        public void setAnswers(List<Answer> answers) { this.answers = answers; }
    }

    public static class Answer {
        private String questionId;
        private String optionId;
        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }
        public String getOptionId() { return optionId; }
        public void setOptionId(String optionId) { this.optionId = optionId; }
    }

    private Map<String, Object> question(String id, String text, List<Map<String, String>> options) {
        return Map.of("id", id, "text", text, "options", options);
    }

    private Map<String, String> option(String id, String text, String vibe) {
        return Map.of("id", id, "text", text, "vibe", vibe);
    }

    private String prettify(String name) {
        String[] parts = name.toLowerCase().split("_");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) {
                sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }
}
