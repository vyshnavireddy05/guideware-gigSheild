package com.gigshield.repository;

import com.gigshield.model.User;
import com.gigshield.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String phone);

    List<User> findByZoneAndCityAndStatus(String zone, String city, UserStatus status);
}
