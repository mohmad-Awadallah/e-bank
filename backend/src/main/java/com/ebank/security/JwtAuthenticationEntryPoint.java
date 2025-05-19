package com.ebank.security;

import com.ebank.model.securityLog.LogStatus;
import com.ebank.service.SecurityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final SecurityLogService securityLogService;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        // محاولة الحصول على userId من الـ Authentication في حالة كان موجودًا
        Long userId = null;

        // إذا كان هناك طلب مصادقة من قبل المستخدم
        if (request.getUserPrincipal() != null) {
            try {
                // محاولة تحويل اسم المستخدم إلى Long، إذا كان ذلك ممكنًا
                userId = Long.parseLong(request.getUserPrincipal().getName());
            } catch (NumberFormatException e) {
                log.warn("Invalid userId format: {}", request.getUserPrincipal().getName());
            }
        }

        // سجل محاولة الوصول المرفوض
        log.warn("Unauthorized access attempt to {} from {} by userId: {}",
                request.getRequestURI(), request.getRemoteAddr(), userId);

        securityLogService.logSecurityEvent(
                userId,                            // إرسال userId كـ Long
                "UNAUTHORIZED_ACCESS_ATTEMPT",     // رمز الحدث
                request,
                LogStatus.FAILED
        );

        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
    }
}
