package com.tensonly.config;

import com.tensonly.entity.Event;
import com.tensonly.service.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

@Configuration
public class EventLocationMigration {

    private static final Logger log = LoggerFactory.getLogger(EventLocationMigration.class);

    @Bean
    CommandLineRunner backfillEventLocations(MongoTemplate mongoTemplate) {
        return args -> {
            Query missing = Query.query(Criteria.where("location").exists(false));
            long total = mongoTemplate.count(missing, Event.class);
            if (total == 0) {
                log.info("Event location backfill: all events already have coordinates, skipping.");
                return;
            }

            log.info("Event location backfill: updating {} event(s) with no coordinates…", total);
            int updated = 0;

            for (Event event : mongoTemplate.find(missing, Event.class)) {
                var point = EventService.resolveLocation(null, null, event.getCity());
                if (point != null) {
                    mongoTemplate.updateFirst(
                        Query.query(Criteria.where("_id").is(event.getId())),
                        Update.update("location", point),
                        Event.class
                    );
                    updated++;
                } else {
                    log.warn("Event location backfill: no coordinates for city '{}' (id={})", event.getCity(), event.getId());
                }
            }

            log.info("Event location backfill: done. {}/{} event(s) updated.", updated, total);
        };
    }
}
