package com.tensonly.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.tensonly.config.AppProperties;
import com.tensonly.dto.PaymentDto;
import com.tensonly.entity.*;
import com.tensonly.repository.*;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;

@Service
public class RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

    private final AppProperties appProperties;
    private final EventService eventService;
    private final TicketRepository ticketRepository;
    private final PaymentRepository paymentRepository;
    private final LedgerRepository ledgerRepository;
    private final UserRepository userRepository;

    private RazorpayClient cachedClient;

    public RazorpayService(AppProperties appProperties,
                           EventService eventService,
                           TicketRepository ticketRepository,
                           PaymentRepository paymentRepository,
                           LedgerRepository ledgerRepository,
                           UserRepository userRepository) {
        this.appProperties = appProperties;
        this.eventService = eventService;
        this.ticketRepository = ticketRepository;
        this.paymentRepository = paymentRepository;
        this.ledgerRepository = ledgerRepository;
        this.userRepository = userRepository;
    }

    private RazorpayClient getClient() {
        if (cachedClient == null) {
            String keyId = appProperties.razorpay().keyId();
            String keySecret = appProperties.razorpay().keySecret();
            if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Razorpay credentials missing. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in backend/.env or environment variables.");
            }
            try {
                log.info("Initializing Razorpay client with keyId={}", keyId);
                cachedClient = new RazorpayClient(keyId, keySecret);
            } catch (RazorpayException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to init Razorpay client: " + e.getMessage());
            }
        }
        return cachedClient;
    }

    public PaymentDto.OrderResponse createOrder(PaymentDto.CreateOrderRequest req, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Event event = eventService.getEntity(req.getEventId());
        if (req.getAmount() == null || req.getAmount() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be at least 1 INR");
        }
        long amountPaise = req.getAmount().longValue() * 100;
        log.info("[payments] order_create_start userId={} eventId={} amountInr={} amountPaise={}",
                userId, event.getId(), req.getAmount(), amountPaise);

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", req.getCurrency() != null ? req.getCurrency() : "INR");
            orderRequest.put("receipt", req.getReceipt() != null ? req.getReceipt() : "tkt_" + event.getId());
            orderRequest.put("payment_capture", 1);

            Order order = getClient().orders.create(orderRequest);
                log.info("[payments] order_create_success orderId={} eventId={} userId={} status={} amountPaise={}",
                    order.get("id"), event.getId(), userId, order.get("status"), order.get("amount"));

            PaymentDto.OrderResponse response = new PaymentDto.OrderResponse();
            response.setId(order.get("id").toString());
            response.setEntity(order.get("entity").toString());
            response.setAmount(((Number) order.get("amount")).longValue());
            response.setAmount_paid(((Number) order.get("amount_paid")).longValue());
            response.setAmount_due(((Number) order.get("amount_due")).longValue());
            response.setCurrency(order.get("currency").toString());
            response.setReceipt(order.get("receipt") != null ? order.get("receipt").toString() : null);
            response.setStatus(order.get("status").toString());
            response.setKeyId(appProperties.razorpay().keyId());
            return response;
        } catch (RazorpayException e) {
            log.error("Razorpay createOrder failed: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Failed to create Razorpay order: " + e.getMessage());
        }
    }

    public PaymentDto.PaymentRecord verifyAndCapture(PaymentDto.VerifyRequest req, String userId, String userEmail) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String orderId = req.getRazorpayOrderId();
        String paymentId = req.getRazorpayPaymentId();
        String signature = req.getRazorpaySignature();
        log.info("[payments] verify_start orderId={} paymentId={} eventId={} userId={} amountInr={}",
                orderId, paymentId, req.getEventId(), userId, req.getAmount());

        // Idempotency
        if (paymentRepository.existsByPaymentId(paymentId)) {
            log.warn("[payments] verify_duplicate paymentId={}", paymentId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment already verified");
        }

        // Verify signature
        String expectedSignature = generateSignature(orderId + "|" + paymentId,
            appProperties.razorpay().keySecret());
        if (!constantTimeEquals(expectedSignature, signature)) {
            log.warn("[payments] verify_signature_mismatch orderId={} paymentId={}", orderId, paymentId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment signature");
        }
        log.info("[payments] verify_signature_ok orderId={} paymentId={}", orderId, paymentId);

        Event event = eventService.getEntity(req.getEventId());

        // Resilient user lookup: find by ID → fallback to email → auto-create.
        // Payment signature is already verified so we must not lose the ticket.
        User user = userRepository.findById(userId).orElseGet(() -> {
            log.warn("[payments] user_not_found_by_id userId={} email={} — attempting email fallback",
                    userId, userEmail);
            if (userEmail != null && !userEmail.isBlank()) {
                var byEmail = userRepository.findByEmailOrPhone(userEmail);
                if (byEmail.isPresent()) {
                    log.info("[payments] user_found_by_email email={}", userEmail);
                    return byEmail.get();
                }
                // Auto-create so the paid ticket is never lost
                log.warn("[payments] user_autocreate email={} — payment confirmed, creating placeholder user",
                        userEmail);
                User newUser = new com.tensonly.entity.User();
                newUser.setEmailOrPhone(userEmail);
                newUser.setName(userEmail.split("@")[0]);
                newUser.setRole(com.tensonly.entity.Role.MEMBER);
                newUser.setApproved(true);
                newUser.setPasswordHash("auto-" + System.currentTimeMillis());
                newUser.setLoyaltyPoints(0);
                newUser.setAttendedCount(0);
                return userRepository.save(newUser);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "User not found and no email available for fallback");
        });

        // Create ticket
        Ticket ticket = new Ticket();
        ticket.setTicketCode(generateTicketCode());
        ticket.setEventId(event.getId());
        ticket.setUserId(userId);
        ticket.setOrderId(orderId);
        ticket.setPaymentId(paymentId);
        ticket.setStatus(TicketStatus.CONFIRMED);
        ticket.setHolderName(user.getName());
        ticket.setAmountPaid(java.math.BigDecimal.valueOf(req.getAmount()));
        ticket.setCurrency(req.getCurrency());
        ticket.setQrCode("10sonly|" + ticket.getTicketCode() + "|" + event.getId());
        log.info("[payments] booking_create_start ticketCode={} eventId={} userId={}",
            ticket.getTicketCode(), event.getId(), userId);
        ticket = ticketRepository.save(ticket);
        log.info("[payments] booking_create_saved ticketId={} ticketCode={} qr={}",
            ticket.getId(), ticket.getTicketCode(), ticket.getQrCode());

        // Save payment
        Payment payment = new Payment();
        payment.setPaymentId(paymentId);
        payment.setOrderId(orderId);
        payment.setSignature(signature);
        payment.setAmount(java.math.BigDecimal.valueOf(req.getAmount() * 100));  // paise
        payment.setCurrency(req.getCurrency());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setEventId(event.getId());
        payment.setUserId(userId);
        payment.setTicketId(ticket.getId());
        log.info("[payments] payment_record_save_start orderId={} paymentId={} ticketId={}",
            orderId, paymentId, ticket.getId());
        payment = paymentRepository.save(payment);
        log.info("[payments] payment_record_saved paymentRecordId={} paymentId={} status={}",
            payment.getId(), payment.getPaymentId(), payment.getStatus());

        // Update event stats
        eventService.incrementTicketsSold(event.getId(), 1, java.math.BigDecimal.valueOf(req.getAmount()));
        log.info("[payments] event_stats_updated eventId={} incrementTickets=1 grossInr={}",
            event.getId(), req.getAmount());

        // Award loyalty points
        user.setLoyaltyPoints(user.getLoyaltyPoints() + 100);
        userRepository.save(user);
        log.info("[payments] user_loyalty_updated userId={} newPoints={}", user.getId(), user.getLoyaltyPoints());

        // Ledger entries
        LedgerEntry sale = new LedgerEntry();
        sale.setEventId(event.getId());
        sale.setEventTitle(event.getTitle());
        sale.setType(LedgerType.TICKET_SALE);
        sale.setAmount(java.math.BigDecimal.valueOf(req.getAmount()));
        sale.setCurrency(req.getCurrency());
        sale.setDescription("Ticket " + ticket.getTicketCode() + " sold");
        ledgerRepository.save(sale);
        log.info("[payments] ledger_sale_saved eventId={} ticketCode={} amountInr={}",
            event.getId(), ticket.getTicketCode(), req.getAmount());

        double commissionPercent = appProperties.razorpay().platformFeePercent();
        double gstPercent = appProperties.razorpay().gstPercent();
        long commissionAmount = Math.round(req.getAmount() * commissionPercent / 100.0);
        long gstAmount = Math.round(req.getAmount() * gstPercent / 100.0);
        long totalPlatformDeduction = commissionAmount + gstAmount;
        LedgerEntry fee = new LedgerEntry();
        fee.setEventId(event.getId());
        fee.setEventTitle(event.getTitle());
        fee.setType(LedgerType.PLATFORM_FEE);
        fee.setAmount(java.math.BigDecimal.valueOf(-totalPlatformDeduction));
        fee.setCurrency(req.getCurrency());
        fee.setDescription("Platform fee (commission " + commissionPercent + "% + GST " + gstPercent + "%)");
        ledgerRepository.save(fee);
        log.info("[payments] ledger_fee_saved eventId={} commissionPercent={} gstPercent={} feeInr={}",
            event.getId(), commissionPercent, gstPercent, totalPlatformDeduction);

        // Build response
        PaymentDto.PaymentRecord record = new PaymentDto.PaymentRecord();
        record.setId(payment.getId());
        record.setPaymentId(payment.getPaymentId());
        record.setOrderId(payment.getOrderId());
        record.setSignature(payment.getSignature());
        record.setAmount(req.getAmount());
        record.setCurrency(payment.getCurrency());
        record.setStatus("captured");
        record.setEventId(event.getId());
        record.setUserId(userId);
        record.setTicketId(ticket.getTicketCode());
        record.setVerifiedAt(Instant.now().toString());
        log.info("[payments] verify_complete orderId={} paymentId={} ticketCode={} status=captured",
            orderId, paymentId, ticket.getTicketCode());
        return record;
    }

    private static String generateTicketCode() {
        SecureRandom rng = new SecureRandom();
        return "T-" + (1000 + rng.nextInt(9000));
    }

    private static String generateSignature(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC computation failed", e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
