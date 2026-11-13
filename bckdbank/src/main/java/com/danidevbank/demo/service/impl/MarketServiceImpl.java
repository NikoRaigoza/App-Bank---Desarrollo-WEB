package com.danidevbank.demo.service.impl;

import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.danidevbank.demo.exception.BadRequestException;
import com.danidevbank.demo.exception.ResourceNotFoundException;
import com.danidevbank.demo.exception.ServiceUnavailableException;
import com.danidevbank.demo.service.MarketService;

/**
 * Consulta datos bursátiles en Finnhub (https://finnhub.io) desde el backend.
 * Así la API key nunca llega al navegador: el frontend solo habla con nuestra API.
 */
@Service
public class MarketServiceImpl implements MarketService {

    private static final Pattern SYMBOL_PATTERN = Pattern.compile("^[A-Z0-9.\\-]{1,20}$");
    private static final ParameterizedTypeReference<Map<String, Object>> JSON_MAP = new ParameterizedTypeReference<>() {};

    private final RestClient restClient;
    private final String apiKey;

    public MarketServiceImpl(
            @Value("${app.finnhub.base-url:https://finnhub.io/api/v1}") String baseUrl,
            @Value("${app.finnhub.api-key:}") String apiKey) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    @Override
    public Map<String, Object> getQuote(String symbol) {
        String normalized = normalize(symbol);
        Map<String, Object> quote = call("/quote", normalized);
        // Finnhub responde 200 con todo en 0 cuando el símbolo no existe.
        Object current = quote.get("c");
        if (!(current instanceof Number number) || number.doubleValue() == 0) {
            throw new ResourceNotFoundException("No se encontraron datos para el símbolo " + normalized);
        }
        return quote;
    }

    @Override
    public Map<String, Object> getProfile(String symbol) {
        return call("/stock/profile2", normalize(symbol));
    }

    private Map<String, Object> call(String path, String symbol) {
        if (!StringUtils.hasText(apiKey)) {
            throw new ServiceUnavailableException(
                    "Datos de mercado no configurados: define la variable de entorno FINNHUB_API_KEY en el backend.");
        }
        try {
            Map<String, Object> body = restClient.get()
                    .uri(uri -> uri.path(path).queryParam("symbol", symbol).queryParam("token", apiKey).build())
                    .retrieve()
                    .body(JSON_MAP);
            return body == null ? Map.of() : body;
        } catch (RestClientException e) {
            throw new ServiceUnavailableException("No fue posible consultar Finnhub en este momento.");
        }
    }

    private String normalize(String symbol) {
        String normalized = symbol == null ? "" : symbol.trim().toUpperCase();
        if (!SYMBOL_PATTERN.matcher(normalized).matches()) {
            throw new BadRequestException("Símbolo bursátil inválido");
        }
        return normalized;
    }
}
