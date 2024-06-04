package edu.ucsb.cs156.happiercows.interceptors;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class RoleInterceptorTests {
  @MockBean
  UserRepository userRepository;

  @Autowired
  private RequestMappingHandlerMapping mapping;

  @BeforeEach
  public void setupSecurityContext() {
    Map<String, Object> attributes = new HashMap<>();
    attributes.put("id", 1);
    attributes.put("email", "test@ucsb.edu");
    attributes.put("googleSub", "test");
    attributes.put("fullName", "test");
    attributes.put("givenName", "test");
    attributes.put("familyName", "test");
    attributes.put("emailVerified", true);
    attributes.put("locale", "test");
    attributes.put("hostedDomain", "test");

    Set<GrantedAuthority> fakeAuthorities = new HashSet<>();
    fakeAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    fakeAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));

    OAuth2User user = new DefaultOAuth2User(fakeAuthorities, attributes, "email");
    Authentication authentication = new OAuth2AuthenticationToken(user, fakeAuthorities, "userRegisterId");

    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }

  @Test
  public void user_not_present_in_db_and_no_role_update_by_interceptor() throws Exception {
    when(userRepository.findByEmail("test@ucsb.edu")).thenReturn(Optional.empty());

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    assert chain != null;
    Optional<HandlerInterceptor> roleRuleInterceptor = chain.getInterceptorList()
                    .stream()
                    .filter(RoleInterceptor.class::isInstance)
                    .findAny();

    assertTrue(roleRuleInterceptor.isPresent());
    roleRuleInterceptor.get().preHandle(request, response, chain.getHandler());

    Collection<? extends GrantedAuthority> updatedAuthorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
    verify(userRepository, times(1)).findByEmail("test@ucsb.edu");
    boolean hasAdminRole = updatedAuthorities.stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    boolean hasUserRole = updatedAuthorities.stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_USER"));
    assertTrue(hasAdminRole, "ROLE_ADMIN should exist authorities");
    assertTrue(hasUserRole, "ROLE_USER should exist in authorities");
  }

  @Test
  public void interceptor_removes_admin_role_when_admin_field_in_db_is_false() throws Exception {
    User user = User.builder()
      .id(1)
      .email("test@ucsb.edu")
      .googleSub("test")
      .fullName("test")
      .givenName("test")
      .familyName("test")
      .emailVerified(true)
      .locale("test")
      .hostedDomain("test")
      .admin(false)
      .build();
    when(userRepository.findByEmail("test@ucsb.edu")).thenReturn(Optional.of(user));

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    assert chain != null;
    Optional<HandlerInterceptor> roleRuleInterceptor = chain.getInterceptorList()
                    .stream()
                    .filter(RoleInterceptor.class::isInstance)
                    .findAny();

    assertTrue(roleRuleInterceptor.isPresent());
    boolean result = roleRuleInterceptor.get().preHandle(request, response, chain.getHandler());

    Collection<? extends GrantedAuthority> updatedAuthorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
    verify(userRepository, times(1)).findByEmail("test@ucsb.edu");
    boolean hasAdminRole = updatedAuthorities.stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    boolean hasUserRole = updatedAuthorities.stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_USER"));

    assertFalse(hasAdminRole, "ROLE_ADMIN should exist authorities");
    assertTrue(hasUserRole, "ROLE_USER should exist in authorities");
    assertTrue(result);
  }

  @Test
  public void interceptor_adds_admin_role_when_user_is_admin() throws Exception {
    User adminUser = User.builder()
      .id(1)
      .email("test@ucsb.edu")
      .googleSub("test")
      .fullName("test")
      .givenName("test")
      .familyName("test")
      .emailVerified(true)
      .locale("test")
      .hostedDomain("test")
      .admin(true)  // User is an admin
      .suspended(false)
      .build();

    when(userRepository.findByEmail("test@ucsb.edu")).thenReturn(Optional.of(adminUser));
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    assert chain != null;
    Optional<HandlerInterceptor> roleRuleInterceptor = chain.getInterceptorList()
                    .stream()
                    .filter(RoleInterceptor.class::isInstance)
                    .findAny();

    assertTrue(roleRuleInterceptor.isPresent());
    boolean result = roleRuleInterceptor.get().preHandle(request, response, chain.getHandler());

    Collection<? extends GrantedAuthority> updatedAuthorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
    verify(userRepository, times(1)).findByEmail("test@ucsb.edu");
    assertTrue(updatedAuthorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")),
               "ROLE_ADMIN should be added for admin users");
    assertTrue(result);
  }


  @Test
  public void interceptor_logs_out_user_when_suspended_field_in_db_is_true() throws Exception {
    User user = User.builder()
      .id(1)
      .email("test@ucsb.edu")
      .googleSub("test")
      .fullName("test")
      .givenName("test")
      .familyName("test")
      .emailVerified(true)
      .locale("test")
      .hostedDomain("test")
      .admin(true)
      .suspended(true)
      .build();
    when(userRepository.findByEmail("test@ucsb.edu")).thenReturn(Optional.of(user));


    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    assert chain != null;
    Optional<HandlerInterceptor> roleRuleInterceptor = chain.getInterceptorList()
                    .stream()
                    .filter(RoleInterceptor.class::isInstance)
                    .findAny();

    assertTrue(roleRuleInterceptor.isPresent());
    boolean result = roleRuleInterceptor.get().preHandle(request, response, chain.getHandler());

    verify(userRepository, times(1)).findByEmail("test@ucsb.edu");
    assertFalse(result);
    assertEquals(response.getStatus(), HttpServletResponse.SC_FORBIDDEN);
    assertNull(SecurityContextHolder.getContext().getAuthentication());
  }
}
