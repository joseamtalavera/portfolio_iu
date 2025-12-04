package com.beworking.backend.dto;

public record AuthLoginResponse(
    Long Id, 
    String name,
    String email
) {}