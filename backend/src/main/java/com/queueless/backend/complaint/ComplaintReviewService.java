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

@Service
@RequiredArgsConstructor
public class ComplaintReviewService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintEvidenceRepository complaintEvidenceRepository;
    private final UserRepository userRepository;
    private final TrustService trustService;

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
