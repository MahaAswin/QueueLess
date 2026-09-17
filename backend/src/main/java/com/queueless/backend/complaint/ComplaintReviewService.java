package com.queueless.backend.complaint;

import com.queueless.backend.common.ComplaintNotFoundException;
import com.queueless.backend.complaint.dto.ComplaintResponse;
import com.queueless.backend.complaint.dto.EvidenceResponse;
import com.queueless.backend.complaint.dto.ReviewComplaintRequest;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.queueless.backend.notification.NotificationService;
import com.queueless.backend.notification.NotificationType;

@Service
@RequiredArgsConstructor
public class ComplaintReviewService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintEvidenceRepository complaintEvidenceRepository;
    private final UserRepository userRepository;
    private final TrustService trustService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public com.queueless.backend.admin.dto.AdminComplaintPageResponse getAdminComplaints(
            ComplaintStatus status,
            ComplaintType type,
            String search,
            int page,
            int size,
            String adminEmail
    ) {
        verifyAdminUser(adminEmail);
        int limitSize = Math.min(Math.max(size, 1), 100);
        org.springframework.data.domain.PageRequest pageRequest =
                org.springframework.data.domain.PageRequest.of(page, limitSize, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        org.springframework.data.domain.Page<Complaint> complaintPage = complaintRepository.findAll(
                ComplaintSpecifications.withAdminFilters(status, type, cleanSearch),
                pageRequest
        );

        List<ComplaintResponse> content = complaintPage.getContent().stream()
                .map(c -> {
                    List<EvidenceResponse> evidences = complaintEvidenceRepository.findByComplaintOrderByCreatedAtAsc(c).stream()
                            .map(EvidenceResponse::fromEntity)
                            .collect(Collectors.toList());
                    return ComplaintResponse.fromEntity(c, evidences);
                })
                .collect(Collectors.toList());

        return com.queueless.backend.admin.dto.AdminComplaintPageResponse.builder()
                .content(content)
                .page(complaintPage.getNumber())
                .size(complaintPage.getSize())
                .totalElements(complaintPage.getTotalElements())
                .totalPages(complaintPage.getTotalPages())
                .hasNext(complaintPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public com.queueless.backend.admin.dto.AdminComplaintSummaryResponse getComplaintSummary(String adminEmail) {
        verifyAdminUser(adminEmail);
        long totalComplaints = complaintRepository.count();
        long submittedComplaints = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long underReviewComplaints = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);
        long validComplaints = complaintRepository.countByStatus(ComplaintStatus.VALID);
        long invalidComplaints = complaintRepository.countByStatus(ComplaintStatus.INVALID);
        long dismissedComplaints = complaintRepository.countByStatus(ComplaintStatus.DISMISSED);

        return com.queueless.backend.admin.dto.AdminComplaintSummaryResponse.builder()
                .totalComplaints(totalComplaints)
                .submittedComplaints(submittedComplaints)
                .underReviewComplaints(underReviewComplaints)
                .validComplaints(validComplaints)
                .invalidComplaints(invalidComplaints)
                .dismissedComplaints(dismissedComplaints)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints(String adminEmail) {
        verifyAdminUser(adminEmail);
        return complaintRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(c -> {
                    List<EvidenceResponse> evidences = complaintEvidenceRepository.findByComplaintOrderByCreatedAtAsc(c).stream()
                            .map(EvidenceResponse::fromEntity)
                            .collect(Collectors.toList());
                    return ComplaintResponse.fromEntity(c, evidences);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse reviewComplaint(UUID complaintId, ReviewComplaintRequest request, String adminEmail) {
        User admin = verifyAdminUser(adminEmail);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found with ID: " + complaintId));

        ComplaintStatus currentStatus = complaint.getStatus();
        if (currentStatus == ComplaintStatus.VALID || currentStatus == ComplaintStatus.INVALID || currentStatus == ComplaintStatus.DISMISSED) {
            throw new IllegalStateException("Complaint has already been reviewed and finalized");
        }

        ComplaintStatus targetStatus = request.getStatus();
        if (targetStatus == currentStatus) {
            throw new IllegalStateException("Complaint status is already " + targetStatus);
        }

        if (targetStatus != ComplaintStatus.UNDER_REVIEW
                && targetStatus != ComplaintStatus.VALID
                && targetStatus != ComplaintStatus.INVALID
                && targetStatus != ComplaintStatus.DISMISSED) {
            throw new IllegalArgumentException("Invalid review target status: " + targetStatus);
        }

        complaint.setStatus(targetStatus);
        complaint.setReviewNote(request.getReviewNote());
        complaint.setReviewedBy(admin);
        complaint.setReviewedAt(LocalDateTime.now());

        Complaint savedComplaint = complaintRepository.save(complaint);

        if (targetStatus == ComplaintStatus.VALID) {
            trustService.processValidComplaint(savedComplaint);
        }

        UUID shopId = savedComplaint.getReportedShop() != null ? savedComplaint.getReportedShop().getId() : null;
        notificationService.createNotification(
                savedComplaint.getComplainant(),
                NotificationType.COMPLAINT_REVIEWED,
                "Complaint Reviewed",
                "Your complaint has been reviewed.",
                savedComplaint.getOrder().getId(),
                shopId
        );

        List<EvidenceResponse> evidences = complaintEvidenceRepository.findByComplaintOrderByCreatedAtAsc(savedComplaint).stream()
                .map(EvidenceResponse::fromEntity)
                .collect(Collectors.toList());

        return ComplaintResponse.fromEntity(savedComplaint, evidences);
    }


    private User verifyAdminUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only ADMIN users can perform complaint review operations");
        }
        return user;
    }
}
