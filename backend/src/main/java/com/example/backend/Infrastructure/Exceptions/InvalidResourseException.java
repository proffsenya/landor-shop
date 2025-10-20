package com.example.backend.Infrastructure.Exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidResourseException extends RuntimeException {
    public InvalidResourseException(String message) {
        super(message);
    }
}
