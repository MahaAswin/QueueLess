package com.queueless.backend.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintEvidenceRepository extends JpaRepository<ComplaintEvidence, UUID> {

    List<ComplaintEvidence> findByComplaint(Complaint complaint);

    List<ComplaintEvidence> findByComplaintOrderByCreatedAtAsc(Complaint complaint);
}
