package com.tensonly.dto;

import com.tensonly.entity.Ticket;
import com.tensonly.entity.TicketStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class TicketDto {

    private String id;
    private String ticketCode;
    private String eventId;
    private String eventTitle;
    private String userId;
    private String orderId;
    private String paymentId;
    private TicketStatus status;
    private BigDecimal amountPaid;
    private String currency;
    private String qrCode;
    private String holderName;
    private EventDto event;
    private Instant purchasedAt;
    private Instant checkedInAt;

    public TicketDto() {
    }

    public static TicketDto from(Ticket t) {
        TicketDto dto = new TicketDto();
        dto.id = t.getId();
        dto.ticketCode = t.getTicketCode();
        dto.eventId = t.getEventId();
        dto.userId = t.getUserId();
        dto.orderId = t.getOrderId();
        dto.paymentId = t.getPaymentId();
        dto.status = t.getStatus();
        dto.amountPaid = t.getAmountPaid();
        dto.currency = t.getCurrency();
        dto.qrCode = t.getQrCode();
        dto.holderName = t.getHolderName();
        dto.purchasedAt = t.getPurchasedAt();
        dto.checkedInAt = t.getCheckedInAt();
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getHolderName() { return holderName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }

    public EventDto getEvent() { return event; }
    public void setEvent(EventDto event) { this.event = event; }

    public Instant getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(Instant purchasedAt) { this.purchasedAt = purchasedAt; }

    public Instant getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(Instant checkedInAt) { this.checkedInAt = checkedInAt; }
}
