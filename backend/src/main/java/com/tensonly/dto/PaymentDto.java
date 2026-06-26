package com.tensonly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tensonly.entity.Payment;
import com.tensonly.entity.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentDto {

    // ===== Create Order Request =====
    public static class CreateOrderRequest {
        @NotBlank
        private String eventId;

        @NotNull
        private Integer amount;  // in rupees

        private String currency = "INR";
        private Integer quantity;
        private String receipt;

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getReceipt() { return receipt; }
        public void setReceipt(String receipt) { this.receipt = receipt; }
    }

    // ===== Order Response (matches frontend RazorpayOrder type) =====
    public static class OrderResponse {
        private String id;
        private String entity = "order";
        private Long amount;        // paise
        private Long amount_paid = 0L;
        private Long amount_due;
        private String currency;
        private String receipt;
        private String status;
        private String keyId;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        @JsonProperty("order_id")
        public String getOrderId() { return id; }
        public String getEntity() { return entity; }
        public void setEntity(String entity) { this.entity = entity; }
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        public Long getAmount_paid() { return amount_paid; }
        public void setAmount_paid(Long amount_paid) { this.amount_paid = amount_paid; }
        public Long getAmount_due() { return amount_due; }
        public void setAmount_due(Long amount_due) { this.amount_due = amount_due; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getReceipt() { return receipt; }
        public void setReceipt(String receipt) { this.receipt = receipt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getKeyId() { return keyId; }
        public void setKeyId(String keyId) { this.keyId = keyId; }
    }

    // ===== Verify Request (frontend sends snake_case) =====
    public static class VerifyRequest {
        @NotBlank
        @JsonProperty("razorpay_payment_id")
        private String razorpayPaymentId;

        @NotBlank
        @JsonProperty("razorpay_order_id")
        private String razorpayOrderId;

        @NotBlank
        @JsonProperty("razorpay_signature")
        private String razorpaySignature;

        @NotBlank
        private String eventId;

        @NotNull
        private Integer amount;  // rupees

        private String currency = "INR";

        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String v) { this.razorpayPaymentId = v; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String v) { this.razorpayOrderId = v; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String v) { this.razorpaySignature = v; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }

    // ===== Payment Record (verify response — matches frontend RazorpayPaymentRecord) =====
    public static class PaymentRecord {
        private String id;
        private String paymentId;
        private String orderId;
        private String signature;
        private Integer amount;
        private String currency;
        private String status;
        private String eventId;
        private String userId;
        private String ticketId;
        private String verifiedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getTicketId() { return ticketId; }
        public void setTicketId(String ticketId) { this.ticketId = ticketId; }
        public String getVerifiedAt() { return verifiedAt; }
        public void setVerifiedAt(String verifiedAt) { this.verifiedAt = verifiedAt; }
    }
}
