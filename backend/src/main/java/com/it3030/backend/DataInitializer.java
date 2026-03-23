package com.it3030.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final IncidentRepository incidentRepository;

    @Value("${app.security.admin-emails:}")
    private String adminEmailsProperty;

    public DataInitializer(AppUserRepository appUserRepository,
                          ResourceRepository resourceRepository,
                          BookingRepository bookingRepository,
                          IncidentRepository incidentRepository) {
        this.appUserRepository = appUserRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.incidentRepository = incidentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        String kavinduEmail = "kavindu2002nethmina@gmail.com";
        
        // Check if data already initialized
        if (resourceRepository.count() > 0) {
            System.out.println("Sample data already exists, skipping initialization.");
            return;
        }

        // Find or create Kavindu user
        Optional<AppUser> kavinduOpt = appUserRepository.findByEmail(kavinduEmail);
        if (kavinduOpt.isEmpty()) {
            System.out.println("Kavindu not found, skipping data initialization.");
            return;
        }

        AppUser kavindu = kavinduOpt.get();
        System.out.println("Initializing sample data for user: " + kavindu.getEmail());

        // Create Resources
        Resource auditorium = new Resource();
        auditorium.setName("Main Auditorium");
        auditorium.setType("Hall");
        auditorium.setCapacity(500);
        auditorium.setLocation("New Building - Level 01");
        auditorium.setAvailabilityStatus(Resource.AvailabilityStatus.ACTIVE);
        resourceRepository.save(auditorium);

        Resource lab = new Resource();
        lab.setName("Computing Lab 04");
        lab.setType("Lab");
        lab.setCapacity(60);
        lab.setLocation("Computing Faculty - Level 02");
        lab.setAvailabilityStatus(Resource.AvailabilityStatus.ACTIVE);
        resourceRepository.save(lab);

        Resource lounge = new Resource();
        lounge.setName("Student Lounge");
        lounge.setType("Common Area");
        lounge.setCapacity(100);
        lounge.setLocation("Ground Floor");
        lounge.setAvailabilityStatus(Resource.AvailabilityStatus.ACTIVE);
        resourceRepository.save(lounge);

        System.out.println("Resources created successfully.");

        // Create Bookings for Kavindu
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime futureStart = now.plusDays(7);
        LocalDateTime futureEnd = futureStart.plusHours(2);

        Booking booking1 = new Booking();
        booking1.setResourceId(auditorium.getId());
        booking1.setUserId(kavindu.getId());
        booking1.setStartTime(futureStart);
        booking1.setEndTime(futureEnd);
        booking1.setPurpose("Final Project Presentation");
        booking1.setStatus(Booking.BookingStatus.APPROVED);
        bookingRepository.save(booking1);

        LocalDateTime futureStart2 = now.plusDays(5);
        LocalDateTime futureEnd2 = futureStart2.plusHours(3);

        Booking booking2 = new Booking();
        booking2.setResourceId(lab.getId());
        booking2.setUserId(kavindu.getId());
        booking2.setStartTime(futureStart2);
        booking2.setEndTime(futureEnd2);
        booking2.setPurpose("Java Workshop");
        booking2.setStatus(Booking.BookingStatus.PENDING);
        bookingRepository.save(booking2);

        System.out.println("Bookings created successfully.");

        // Create Incidents
        Incident incident1 = new Incident();
        incident1.setResourceId(lab.getId());
        incident1.setLocation("Computing Lab 04");
        incident1.setCategory("Equipment Failure");
        incident1.setDescription("Projector not working");
        incident1.setPriority(Incident.IncidentPriority.HIGH);
        incident1.setStatus(Incident.IncidentStatus.OPEN);
        incident1.setReportedBy(kavindu.getId());
        incidentRepository.save(incident1);

        Incident incident2 = new Incident();
        incident2.setResourceId(auditorium.getId());
        incident2.setLocation("Main Auditorium");
        incident2.setCategory("Facility");
        incident2.setDescription("AC not cooling properly");
        incident2.setPriority(Incident.IncidentPriority.MEDIUM);
        incident2.setStatus(Incident.IncidentStatus.IN_PROGRESS);
        incident2.setReportedBy(kavindu.getId());
        incidentRepository.save(incident2);

        System.out.println("Incidents created successfully.");
        System.out.println("Sample data initialization complete!");
    }
}
