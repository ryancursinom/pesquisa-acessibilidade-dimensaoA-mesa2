package com.example.midas_api.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(Environment environment) {
        String url = environment.getProperty("CLOUDINARY_URL", "").trim();
        if (!url.isEmpty()) {
            return new Cloudinary(url);
        }

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", environment.getProperty("CLOUDINARY_CLOUD_NAME", ""));
        config.put("api_key", environment.getProperty("CLOUDINARY_API_KEY", ""));
        config.put("api_secret", environment.getProperty("CLOUDINARY_API_SECRET", ""));
        return new Cloudinary(config);
    }
}
