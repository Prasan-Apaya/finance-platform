package com.finance.platform.config;

import java.time.Clock;
import java.time.Duration;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    @Bean
    WebClient forecastWebClient(ForecastProperties props) {
        // Configure Reactor Netty client with timeouts
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 2000) // Connect timeout (2 seconds)
                .responseTimeout(Duration.ofMillis(5000)); // Read/Response timeout (5 seconds)

        return WebClient.builder()
                .baseUrl(props.baseUrl())
                .defaultHeader("X-Internal-Key", props.internalKey())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();

    }

    @Bean
    Clock clock() {
        return Clock.system(ZoneId.of("Asia/Kolkata")); // defines what "current month" means
    }
}