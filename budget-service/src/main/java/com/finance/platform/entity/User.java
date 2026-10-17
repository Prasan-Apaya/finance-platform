package com.finance.platform.entity;

import com.finance.platform.entity.enums.AuthProvider;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(name = "display_name", length = 50)
	private String displayName;

	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	@Enumerated(EnumType.STRING)
	@Column(name = "auth_provider", nullable = false)
	private AuthProvider authProvider = AuthProvider.LOCAL;

	@Column(name = "google_sub", unique = true)
	private String googleSub;

	public User(String email, String displayName, String passwordHash) {
		this.email = email;
		this.displayName = displayName;
		this.passwordHash = passwordHash;
	}

	// factory methods
	public static User local(String email, String passwordHash, String displayName) {
		return new User(email, displayName, passwordHash);
	}

	public static User google(String email, String googleSub, String displayName) {
		User u = new User(email, displayName, null);
		u.authProvider = AuthProvider.GOOGLE;
		u.googleSub = googleSub;
		return u;
	}

	public void linkGoogle(String googleSub) {
		this.googleSub = googleSub;
	}

	public void changeDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public void changePasswordHash(String passwordHash) { // for a later feature
		this.passwordHash = passwordHash;
	}
}
