package com.danidevbank.demo.service;

import java.util.Map;

public interface MarketService {
    Map<String, Object> getQuote(String symbol);
    Map<String, Object> getProfile(String symbol);
}
