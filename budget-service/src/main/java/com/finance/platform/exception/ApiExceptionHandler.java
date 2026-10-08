package com.finance.platform.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MultipartException;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("error", exception.getMessage()));
	}

	@ExceptionHandler({ IllegalArgumentException.class, MethodArgumentNotValidException.class,
			MultipartException.class })
	public ResponseEntity<Map<String, String>> handleBadRequest(Exception exception) {
		return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
	}
}
