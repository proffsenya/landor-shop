package com.example.backend.Infrastructure.Exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourseNotFoundException extends Exception {
    public ResourseNotFoundException(String message) {
        super(message);
    }
}
