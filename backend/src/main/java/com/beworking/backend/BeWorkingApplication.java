package com.beworking.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot entry point for the BeWorking backend application.
 */
@SpringBootApplication
public class BeWorkingApplication {

	/**
	 * Bootstraps the Spring application and start the app: find my classes, wire them together, and start listening for requests on port 8081.
	 * @param args command-line arguments (unused)
	 */
	public static void main(String[] args) {
		SpringApplication.run(BeWorkingApplication.class, args);
	}
}
