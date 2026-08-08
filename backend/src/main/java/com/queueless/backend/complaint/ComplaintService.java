package com.queueless.backend.complaint;

import com.queueless.backend.common.ComplaintNotFoundException;
import com.queueless.backend.common.OrderNotFoundException;
import com.queueless.backend.complaint.dto.AddEvidenceRequest;
import com.queueless.backend.complaint.dto.ComplaintResponse;
import com.queueless.backend.complaint.dto.CreateComplaintRequest;
import com.queueless.backend.complaint.dto.EvidenceResponse;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintEvidenceRepository complaintEvidenceRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ComplaintResponse createCustomerComplaint(UUID orderId, CreateComplaintRequest request, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to file a complaint for this order");
        }

        Complaint complaint = Complaint.builder()
                .order(order)
                .complainant(customer)
                .reportedUser(order.getShop().getOwner())
                .reportedShop(order.getShop())
                .type(request.getType())
                .description(request.getDescription())
                .status(ComplaintStatus.SUBMITTED)
                .evidenceCount(0)
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(savedComplaint);
    }

    @Transactional
    public ComplaintResponse createShopOwnerComplaint(UUID orderId, CreateComplaintRequest request, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to file a complaint for this shop order");
        }

        Complaint complaint = Complaint.builder()
                .order(order)
                .complainant(owner)
                .reportedUser(order.getCustomer())
                .reportedShop(null)
                .type(request.getType())
                .description(request.getDescription())
                .status(ComplaintStatus.SUBMITTED)
                .evidenceCount(0)
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(savedComplaint);
    }

    @Transactional
    public EvidenceResponse addEvidence(UUID complaintId, AddEvidenceRequest request, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found with ID: " + complaintId));

        if (!complaint.getComplainant().getId().equals(user.getId())) {
            throw new AccessDeniedException("Only the complaint creator can add evidence");
        }

        if (complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new IllegalStateException("Cannot add evidence once complaint review has started");
        }

        ComplaintEvidence evidence = ComplaintEvidence.builder()
                .complaint(complaint)
                .type(request.getType())
                .fileUrl(request.getFileUrl())
                .description(request.getDescription())
                .build();

        ComplaintEvidence savedEvidence = complaintEvidenceRepository.save(evidence);

        complaint.setEvidenceCount(complaint.getEvidenceCount() + 1);
        complaintRepository.save(complaint);

        return EvidenceResponse.fromEntity(savedEvidence);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints(String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);
        return complaintRepository.findByComplainantOrderByCreatedAtDesc(user).stream()
                .map(c -> {
                    List<EvidenceResponse> evidences = complaintEvidenceRepository.findByComplaintOrderByCreatedAtAsc(c).stream()
                            .map(EvidenceResponse::fromEntity)
                            .collect(Collectors.toList());
                    return ComplaintResponse.fromEntity(c, evidences);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getShopComplaints(String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        return complaintRepository.findAll().stream()
                .filter(c -> c.getComplainant().getId().equals(owner.getId())
                        || (c.getReportedShop() != null && c.getReportedShop().getOwner().getId().equals(owner.getId())))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(c -> {
                    List<EvidenceResponse> evidences = complaintEvidenceRepository.findByComplaintOrderByCreatedAtAsc(c).stream()
                            .map(EvidenceResponse::fromEntity)
                            .collect(Collectors.toList());
                    return ComplaintResponse.fromEntity(c, evidences);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(UUID complaintId, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found with ID: " + complaintId));

        boolean isComplainant = complaint.getComplainant().getId().equals(user.getId());
        boolean isReportedUser = complaint.getReportedUser().getId().equals(user.getId());
        boolean isReportedShopOwner = complaint.getReportedShop() != null && complaint.getReportedShop().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isComplainant && !isReportedUser && !isReportedShopOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to view this complaint");
        }

        List<EvidenceResponse> evidences = complaintEvidenceRepository.findByComplaintOrderByCreatedAtAsc(complaint).stream()
                .map(EvidenceResponse::fromEntity)
                .collect(Collectors.toList());

        return ComplaintResponse.fromEntity(complaint, evidences);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private User getCustomerUser(String email) {
        User user = getUserByEmail(email);
        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only CUSTOMER users can perform customer complaint operations");
        }
        return user;
    }

    private User getShopOwnerUser(String email) {
        User user = getUserByEmail(email);
        if (user.getRole() != Role.SHOP_OWNER) {
            throw new AccessDeniedException("Only SHOP_OWNER users can perform shop complaint operations");
        }
        return user;
    }
}
