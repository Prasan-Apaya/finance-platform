package com.finance.platform.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class ForecastClientConfig {

    @Bean
    RestClient forecastRestClient(ForecastProperties props) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000); // ms; if flagged deprecated, use the Duration overload
        factory.setReadTimeout(5000);
        return RestClient.builder()
                .baseUrl(props.baseUrl())
                .defaultHeader("X-Internal-Key", props.internalKey())
                .requestFactory(factory)
                .build();
    }

    @Bean
    Clock clock() {
        return Clock.system(ZoneId.of("Asia/Kolkata")); // defines what "current month" means
    }
}