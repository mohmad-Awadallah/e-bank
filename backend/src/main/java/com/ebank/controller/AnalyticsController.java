package com.ebank.controller;

import com.ebank.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor

public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get spending breakdown by transaction type")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved breakdown of spending grouped by transaction type")
    @GetMapping("/spending")
    public Map<String, Object> getSpendingBreakdown(@RequestParam String accountNumber) {
        return analyticsService.getSpendingBreakdown(accountNumber);
    }

    @Operation(summary = "Get monthly spending trends")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved total spending per month")
    @GetMapping("/monthly")
    public Map<String, Object> getMonthlyTrends(@RequestParam String accountNumber) {
        return analyticsService.getMonthlyTrends(accountNumber);
    }

}
