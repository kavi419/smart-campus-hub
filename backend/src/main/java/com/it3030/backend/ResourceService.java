package com.it3030.backend;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Transactional(readOnly = true)
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Transactional
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Transactional(readOnly = true)
    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    @Transactional
    public boolean deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            return false;
        }
        resourceRepository.deleteById(id);
        return true;
    }
}