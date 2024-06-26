package edu.ucsb.cs156.happiercows.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "announcement")
public class Announcement {
    
    // Unique Announcement Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private long commonsId;

    @Column(name="start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name="end_date", nullable = true)
    private LocalDateTime endDate;

    @Column(name="announcement_text", nullable = false)
    private String announcementText;
}
