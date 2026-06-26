package com.tensonly.controller;

import com.tensonly.entity.EventVibe;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
