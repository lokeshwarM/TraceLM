package com.tracelm.backend.metrics.controller;

import com.tracelm.backend.metrics.dto.MetricsOverviewResponse;
import com.tracelm.backend.metrics.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@CrossOrigin
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/overview")
    public MetricsOverviewResponse getOverview() {
        return metricsService.getOverview();
    }

    @GetMapping("/providers")
    public com.tracelm.backend.metrics.dto.ProviderAnalyticsResponse getProviders() {
        return metricsService.getProviders();
    }

    @GetMapping("/latency")
    public java.util.List<com.tracelm.backend.metrics.dto.LatencyTrendResponse> getLatency() {
        return metricsService.getLatency();
    }
}
