package com.tensonly.config;

import com.tensonly.entity.*;
import com.tensonly.repository.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public ApplicationRunner seed(
            UserRepository userRepository,
            EventRepository eventRepository,
            ApplicationRepository applicationRepository,
            HostApplicationRepository hostApplicationRepository,
            HostVenueRepository hostVenueRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            // ---- Users ----
            User member = new User();
            member.setEmailOrPhone("aria.mehta@10sonly.club");
            member.setPasswordHash(passwordEncoder.encode("demo1234"));
            member.setName("Maya Rao");
            member.setRole(Role.MEMBER);
            member.setApproved(true);
            member.setCity("Mumbai");
            member.setAge(26);
            member.setGender(Gender.FEMALE);
            member.setOccupation("Graphic Designer");
            member.setBio("House music lover. Mumbai nights.");
            member.setLoyaltyPoints(120);
            member.setAttendedCount(4);
            member = userRepository.save(member);

            User host = new User();
            host.setEmailOrPhone("bookings@voidcollective.in");
            host.setPasswordHash(passwordEncoder.encode("demo1234"));
            host.setName("Arjun Mehta");
            host.setRole(Role.HOST);
            host.setApproved(true);
            host.setCity("Mumbai");
            host.setAge(31);
            host.setGender(Gender.MALE);
            host.setOccupation("Event Curator");
            host.setBio("Curating underground techno since 2019.");
            host.setLoyaltyPoints(540);
            host.setAttendedCount(18);
            host.setHostSince(LocalDate.of(2019, 8, 15));
            host = userRepository.save(host);

            User admin = new User();
            admin.setEmailOrPhone("ops@10sonly.club");
            admin.setPasswordHash(passwordEncoder.encode("demo1234"));
            admin.setName("Priya Shah");
            admin.setRole(Role.ADMIN);
            admin.setApproved(true);
            admin.setCity("Bengaluru");
            admin.setAge(34);
            admin.setGender(Gender.FEMALE);
            admin.setOccupation("Platform Lead");
            admin.setBio("Keeping 10s Only exclusive.");
            admin.setLoyaltyPoints(999);
            admin.setAttendedCount(50);
            admin = userRepository.save(admin);

            // ---- Venues (6) ----
            hostVenueRepository.saveAll(List.of(
                    venue("AntiSocial", "Mumbai", "Hindmata, Parel", 400, 32, new BigDecimal("4.5")),
                    venue("Kitty Su", "Mumbai", "Andheri West", 1200, 88, new BigDecimal("4.7")),
                    venue("Bonobo", "Mumbai", "Bandra West", 350, 56, new BigDecimal("4.4")),
                    venue("Sensorium", "Bengaluru", "Indiranagar", 500, 24, new BigDecimal("4.6")),
                    venue("Loft 38", "Bengaluru", "Indiranagar", 280, 41, new BigDecimal("4.3")),
                    venue("Tito's Lane", "Goa", "Baga", 900, 110, new BigDecimal("4.2"))
            ));

            // ---- Events (2) ----
            Event event1 = new Event();
            event1.setTitle("Midnight Frequency Vol. 4");
            event1.setVibe(EventVibe.TECHNO);
            event1.setCity("Mumbai");
            event1.setVenueName("AntiSocial");
            event1.setVenueAddress("Hindmata, Parel, Mumbai");
            event1.setVenueCapacity(400);
            event1.setStartAt(Instant.now().plus(7, ChronoUnit.DAYS));
            event1.setEndAt(Instant.now().plus(7, ChronoUnit.DAYS).plus(5, ChronoUnit.HOURS));
            event1.setTicketPrice(new BigDecimal("1500.00"));
            event1.setTotalTickets(300);
            event1.setTicketsSold(64);
            event1.setRevenue(new BigDecimal("96000.00"));
            event1.setDescription("An underground techno night featuring the city's finest selectors.");
            event1.setLineup(List.of("Arjun Mehta", "Nikhil Rao", "Mia K"));
            event1.setCoverImage("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200");
            event1.setVisibility(EventVisibility.MEMBERS_ONLY);
            event1.setStatus(EventStatus.APPROVED);
            event1.setHostId(host.getId());
            event1.setHostName(host.getName());
            eventRepository.save(event1);

            Event event2 = new Event();
            event2.setTitle("Sunset Sessions — Rooftop House");
            event2.setVibe(EventVibe.HOUSE);
            event2.setCity("Bengaluru");
            event2.setVenueName("Sensorium");
            event2.setVenueAddress("Indiranagar, Bengaluru");
            event2.setVenueCapacity(500);
            event2.setStartAt(Instant.now().plus(14, ChronoUnit.DAYS));
            event2.setEndAt(Instant.now().plus(14, ChronoUnit.DAYS).plus(4, ChronoUnit.HOURS));
            event2.setTicketPrice(new BigDecimal("1200.00"));
            event2.setTotalTickets(400);
            event2.setTicketsSold(28);
            event2.setRevenue(new BigDecimal("33600.00"));
            event2.setDescription("Golden-hour deep house on a breezy rooftop.");
            event2.setLineup(List.of("DJ Ana", "Lost Echoes"));
            event2.setCoverImage("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200");
            event2.setVisibility(EventVisibility.PUBLIC);
            event2.setStatus(EventStatus.APPROVED);
            event2.setHostId(host.getId());
            event2.setHostName(host.getName());
            eventRepository.save(event2);

            // ---- Applications (2) ----
            Application app1 = new Application();
            app1.setFullName("Karan Sethi");
            app1.setEmailOrPhone("karan.sethi@example.com");
            app1.setAge(24);
            app1.setGender(Gender.MALE);
            app1.setCity("Delhi");
            app1.setInstagram("@karan.sethi");
            app1.setOccupation("Photographer");
            app1.setWhyJoin("I shoot nightlife and want to be part of curated events.");
            app1.setFavoriteVibe(EventVibe.HIP_HOP);
            app1.setReferralCode("MAYA10");
            app1.setQuizAnswersJson("[{\"q\":\"vibe\",\"a\":\"HIP_HOP\"},{\"q\":\"referral\",\"a\":\"MAYA10\"}]");
            app1.setQuizScore(7);
            app1.setStatus(ApplicationStatus.PENDING);
            app1.setSubmittedAt(Instant.now().minus(2, ChronoUnit.DAYS));
            applicationRepository.save(app1);

            Application app2 = new Application();
            app2.setFullName("Rhea Kapoor");
            app2.setEmailOrPhone("rhea.kapoor@example.com");
            app2.setAge(29);
            app2.setGender(Gender.FEMALE);
            app2.setCity("Mumbai");
            app2.setInstagram("@rheakapoor");
            app2.setOccupation("Brand Strategist");
            app2.setWhyJoin("Looking for a genuine community around good music.");
            app2.setFavoriteVibe(EventVibe.HOUSE);
            app2.setQuizAnswersJson("[{\"q\":\"vibe\",\"a\":\"HOUSE\"}]");
            app2.setQuizScore(9);
            app2.setStatus(ApplicationStatus.APPROVED);
            app2.setSubmittedAt(Instant.now().minus(10, ChronoUnit.DAYS));
            app2.setReviewedAt(Instant.now().minus(8, ChronoUnit.DAYS));
            app2.setReviewerId(admin.getId());
            app2.setReviewerNotes("Strong fit. Approved.");
            applicationRepository.save(app2);

            // ---- Host Application (1, from member) ----
            HostApplication hostApp = new HostApplication();
            hostApp.setUserId(member.getId());
            hostApp.setUserName(member.getName());
            hostApp.setUserEmail(member.getEmailOrPhone());
            hostApp.setCrewName("Frequency Collective");
            hostApp.setCity("Mumbai");
            hostApp.setBio("Two years of curating private listening sessions.");
            hostApp.setPastEvents("12 private events across Mumbai and Pune.");
            hostApp.setInstagram("@frequency.collective");
            hostApp.setSoundcloud("https://soundcloud.com/frequency-collective");
            hostApp.setWhyHost("I want to bring curated, intimate techno nights to 10s Only members.");
            hostApp.setSampleLineup(List.of("Maya Rao", "Nikhil Rao"));
            hostApp.setStatus(HostApplicationStatus.PENDING);
            hostApp.setSubmittedAt(Instant.now().minus(5, ChronoUnit.DAYS));
            hostApplicationRepository.save(hostApp);
        };
    }

    private HostVenue venue(String name, String city, String address, int capacity, int pastEvents, BigDecimal rating) {
        HostVenue v = new HostVenue();
        v.setName(name);
        v.setCity(city);
        v.setAddress(address);
        v.setCapacity(capacity);
        v.setPastEventsCount(pastEvents);
        v.setRating(rating);
        return v;
    }
}
