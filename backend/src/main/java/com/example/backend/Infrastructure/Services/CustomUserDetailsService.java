package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found:" + email);
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(email)
                .password(user.getPasswordHash())
                .roles(getRoles(user))
                .build();

    }

    private String[] getRoles(User user){
        List<String> roles = new ArrayList<>();
        if (user.getIsSuperuser()) roles.add("ROLE_SUPERUSER");
        if (user.getIsStaff()) roles.add("ROLE_STAFF");
        roles.add("USER");
        return roles.toArray(new String[0]);
    };
}
