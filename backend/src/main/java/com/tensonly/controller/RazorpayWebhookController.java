package com.tensonly.controller;

import com.tensonly.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/razorpay")
public class RazorpayWebhookController {

    private static final Logger log = LoggerFactory.getLogger(RazorpayWebhookController.class);

    private final AppProperties appProperties;

    public RazorpayWebhookController(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> webhook(
            @RequestBody String rawBody,
            HttpServletRequest request
    ) {
        String signature = request.getHeader("X-Razorpay-Signature");
        String secret = appProperties.razorpay().keySecret();

        boolean valid = verifySignature(rawBody, signature, secret);
        if (!valid) {
            log.warn("[WEBHOOK] Invalid signature received");
            return ResponseEntity.status(401).body(Map.of("status", "invalid_signature"));
        }

        log.info("[WEBHOOK] Received valid Razorpay webhook: {}", abbreviate(rawBody));
        // Payment capture is already handled synchronously in RazorpayService.verifyAndCapture().
        // This webhook exists for reconciliation / async payment.captured events from Razorpay.
        return ResponseEntity.ok(Map.of("status", "received"));
    }

    private boolean verifySignature(String payload, String signature, String secret) {
        if (signature == null || secret == null) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] actual = hexToBytes(signature);
            return MessageDigest.isEqual(expected, actual);
        } catch (Exception e) {
            log.error("[WEBHOOK] Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    private String abbreviate(String s) {
        return s.length() > 500 ? s.substring(0, 500) + "..." : s;
    }
}
