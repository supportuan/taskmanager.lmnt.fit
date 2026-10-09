package com.taskflow.security;

import com.taskflow.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        String secret = jwtProperties.secret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable must be set.");
        }
        this.secretKey = Keys.hmacShaKeyFor(deriveKeyBytes(secret));
    }

    private static byte[] deriveKeyBytes(String secret) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length >= 32) {
            return raw;
        }
        try {
            return MessageDigest.getInstance("SHA-256").digest(raw);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to initialize JWT key derivation.", e);
        }
    }

    public String generateToken(String email, Long userId) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(jwtProperties.expirationMs());
        return Jwts.builder()
                .subject(email)
                .claim("uid", userId)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public Instant getExpiration(String token) {
        return extractAllClaims(token).getExpiration().toInstant();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object uid = extractAllClaims(token).get("uid");
        if (uid instanceof Integer i) {
            return i.longValue();
        }
        if (uid instanceof Long l) {
            return l;
        }
        if (uid instanceof String s) {
            return Long.parseLong(s);
        }
        return null;
    }

    public boolean isTokenValid(String token, String email) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject().equalsIgnoreCase(email) && claims.getExpiration().after(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
