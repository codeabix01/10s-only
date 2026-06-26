package com.tensonly.service;

import com.tensonly.dto.ConfessionDto;
import com.tensonly.entity.Confession;
import com.tensonly.repository.ConfessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConfessionService {

    private final ConfessionRepository confessionRepository;

    public ConfessionService(ConfessionRepository confessionRepository) {
        this.confessionRepository = confessionRepository;
    }

    public List<ConfessionDto> listByEvent(String eventId, String currentUserId) {
        return confessionRepository.findByEventIdOrderByCreatedAtDesc(eventId).stream()
                .map(c -> {
                    ConfessionDto dto = ConfessionDto.from(c);
                    dto.setLikedByMe(currentUserId != null && c.getLikedBy() != null && c.getLikedBy().contains(currentUserId));
                    return dto;
                })
                .toList();
    }

    public ConfessionDto create(ConfessionDto.CreateRequest request) {
        Confession confession = new Confession();
        confession.setEventId(request.getEventId());
        confession.setAnonymousName(request.getAnonymousName() != null ? request.getAnonymousName() : "Anonymous");
        confession.setMessage(request.getMessage());
        confession.setLikes(0);
        confession.setLikedBy(new ArrayList<>());
        confession.setCreatedAt(Instant.now());
        confession = confessionRepository.save(confession);
        return ConfessionDto.from(confession);
    }

    public ConfessionDto toggleLike(String confessionId, String userId) {
        Confession confession = confessionRepository.findById(confessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Confession not found"));
        List<String> likedBy = confession.getLikedBy() != null ? confession.getLikedBy() : new ArrayList<>();
        if (userId != null && likedBy.contains(userId)) {
            likedBy.remove(userId);
            confession.setLikes(Math.max(0, confession.getLikes() - 1));
        } else if (userId != null) {
            likedBy.add(userId);
            confession.setLikes(confession.getLikes() + 1);
        }
        confession.setLikedBy(likedBy);
        confession = confessionRepository.save(confession);

        ConfessionDto dto = ConfessionDto.from(confession);
        dto.setLikedByMe(userId != null && likedBy.contains(userId));
        return dto;
    }
}
