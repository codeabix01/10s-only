package com.tensonly.controller;

import com.tensonly.dto.PaymentDto;
import com.tensonly.security.SecurityUtil;
import com.tensonly.service.RazorpayService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/razorpay")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final SecurityUtil securityUtil;

    public PaymentController(RazorpayService razorpayService, SecurityUtil securityUtil) {
        this.razorpayService = razorpayService;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/order")
    public ResponseEntity<PaymentDto.OrderResponse> createOrder(@Valid @RequestBody PaymentDto.CreateOrderRequest request) {
        return ResponseEntity.ok(razorpayService.createOrder(request, securityUtil.currentUserId()));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentDto.PaymentRecord> verify(@Valid @RequestBody PaymentDto.VerifyRequest request) {
        return ResponseEntity.ok(razorpayService.verifyAndCapture(
                request, securityUtil.currentUserId(), securityUtil.currentUserEmail()));
    }
}
