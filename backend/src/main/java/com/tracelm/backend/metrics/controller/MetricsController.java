package com.tracelm.backend.metrics.controller;

import com.tracelm.backend.metrics.dto.MetricsOverviewResponse;
import com.tracelm.backend.metrics.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/overview")
    public MetricsOverviewResponse getOverview(Principal principal) {
        return metricsService.getOverview(principal.getName());
    }

    @GetMapping("/providers")
    public com.tracelm.backend.metrics.dto.ProviderAnalyticsResponse getProviders(Principal principal) {
        return metricsService.getProviders(principal.getName());
    }

    @GetMapping("/latency")
    public java.util.List<com.tracelm.backend.metrics.dto.LatencyTrendResponse> getLatency(Principal principal) {
        return metricsService.getLatency(principal.getName());
    }
}
