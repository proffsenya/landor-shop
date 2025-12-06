package com.example.backend.Infrastructure.Exceptions;

import com.example.backend.Domain.DTOs.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequest(
            InvalidRequestException ex,
            HttpServletRequest request) {

        HttpStatus status = determineStatus(ex);

        ErrorResponse error = new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(error, status);
    }

    private HttpStatus determineStatus(InvalidRequestException ex) {
         if (ex.getMessage().contains("bad request")) return HttpStatus.BAD_REQUEST;
         if (ex.getMessage().contains("forbidden")) return HttpStatus.FORBIDDEN;

        return HttpStatus.NOT_FOUND;
    }

    // 404
    @ExceptionHandler(InvalidResourseException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            InvalidResourseException ex,
            HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

//    // 403
//    @ExceptionHandler(InvalidRequestException.class)
//    public ResponseEntity<ErrorResponse> handleForbidden(
//            InvalidResourseException ex,
//            HttpServletRequest request) {
//
//        ErrorResponse error = new ErrorResponse(
//                HttpStatus.FORBIDDEN.value(),
//                "Forbidden",
//                ex.getMessage(),
//                request.getRequestURI()
//        );
//
//        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
//    }

    //500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(
            Exception ex,
            HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Something went wrong: " + ex.getMessage(),
                request.getRequestURI()
        );

        System.err.println("ERROR: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
        ex.printStackTrace();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
