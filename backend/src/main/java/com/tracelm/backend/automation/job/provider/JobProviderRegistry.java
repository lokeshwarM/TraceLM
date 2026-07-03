package com.tracelm.backend.automation.job.provider;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JobProviderRegistry {

    private final Map<String, JobProvider> providerMap;

    public JobProviderRegistry(List<JobProvider> providers) {
        this.providerMap = providers.stream()
                .collect(Collectors.toMap(JobProvider::getProviderName, Function.identity()));
    }

    public Optional<JobProvider> getProvider(String name) {
        return Optional.ofNullable(providerMap.get(name));
    }
    
    public List<JobProvider> getAllProviders() {
        return List.copyOf(providerMap.values());
    }
}
