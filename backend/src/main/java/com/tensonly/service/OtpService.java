package com.tensonly.service;

import com.tensonly.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final long OTP_TTL_SECONDS = 300; // 5 minutes
    private static final String DEMO_BYPASS_CODE = "000000";

    private final AppProperties appProperties;
    private final SecureRandom random = new SecureRandom();

    // key = emailOrPhone, value = [code, expiryEpochSeconds]
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    public OtpService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String requestOtp(String emailOrPhone) {
        String code = generateCode();
        store.put(emailOrPhone, new OtpEntry(code, Instant.now().plusSeconds(OTP_TTL_SECONDS)));

        if ("console".equalsIgnoreCase(appProperties.otp().provider())) {
            log.info("[OTP] {}: {} (demo bypass code: {})", emailOrPhone, code, DEMO_BYPASS_CODE);
        }
        return code;
    }

    public boolean verifyOtp(String emailOrPhone, String code) {
        // Demo bypass when provider=console
        if ("console".equalsIgnoreCase(appProperties.otp().provider())
                && DEMO_BYPASS_CODE.equals(code)) {
            store.remove(emailOrPhone);
            return true;
        }

        OtpEntry entry = store.get(emailOrPhone);
        if (entry == null) {
            return false;
        }
        if (Instant.now().isAfter(entry.expiry())) {
            store.remove(emailOrPhone);
            return false;
        }
        boolean valid = entry.code().equals(code);
        if (valid) {
            store.remove(emailOrPhone);
        }
        return valid;
    }

    private String generateCode() {
        int n = random.nextInt(1_000_000);
        return String.format("%06d", n);
    }

    private record OtpEntry(String code, Instant expiry) {
    }
}
