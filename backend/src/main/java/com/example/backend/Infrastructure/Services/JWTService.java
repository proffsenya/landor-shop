package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JWTService {
    @Value("${JWT_SECRET}")
    private String SECRET_KEY;
    private final Long EXPIRATION_TIME = 864_000_000L;

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("isStuff", user.getIsStaff())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token).getBody();
    }

    public Long extractUserIdFromToken(String token) {
        return Long.parseLong(exctractClaim(token, Claims::getSubject));
    }

    public String extractEmail(String token) {
        return exctractClaim(token, claims -> claims.get("email", String.class));
    }

    private <T> T exctractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = parseToken(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails user) {
        final Long userId = extractUserIdFromToken(token);
        if (user instanceof CustomUserDetails){
            CustomUserDetails customUserDetails = (CustomUserDetails) user;
            return (userId.equals(customUserDetails.getId())) && !isTokenExpired(token);
        }
        return false;
    }

    private Date extractExpiration(String token) {
        return exctractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
