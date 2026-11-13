package com.danidevbank.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.danidevbank.demo.service.MarketService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/market")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping("/quote")
    public ResponseEntity<Map<String, Object>> getQuote(@RequestParam String symbol) {
        return ResponseEntity.ok(marketService.getQuote(symbol));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String symbol) {
        return ResponseEntity.ok(marketService.getProfile(symbol));
    }
}
