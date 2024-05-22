package edu.ucsb.cs156.happiercows.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.models.SystemInfo;

// This class relies on property values
// For hints on testing, see: https://www.baeldung.com/spring-boot-testing-configurationproperties

@Slf4j
@Service("systemInfo")
@ConfigurationProperties
public class SystemInfoServiceImpl extends SystemInfoService {
  
  @Value("${spring.h2.console.enabled:false}")
  private boolean springH2ConsoleEnabled;

  @Value("${app.showSwaggerUILink:false}")
  private boolean showSwaggerUILink;

  @Value("${app.startQtrYYYYQ:20243}")
  private String startQtrYYYYQ;

  @Value("${app.endQtrYYYYQ:20244}")
  private String endQtrYYYYQ;

  @Value("${app.sourceRepo}")
  private String sourceRepo = "https://github.com/ucsb-cs156-s24/proj-happycows-s24-4pm-5";

  @Value("${app.oauth.login:/oauth2/authorization/google}")
  private String oauthLogin;

  @Value("${git.commit.message.short:commit message not found}")
  private String commitMessage;

  @Value("${git.commit.id.abbrev:commit id not found}")
  private String commitId;

  public static String githubUrl(String repo, String commit) {
    return commit != null && repo != null ? repo + "/commit/" + commit : null;
  }

  public SystemInfo getSystemInfo() {
    SystemInfo si = SystemInfo.builder()
    .springH2ConsoleEnabled(this.springH2ConsoleEnabled)
    .showSwaggerUILink(this.showSwaggerUILink)
    .startQtrYYYYQ(this.startQtrYYYYQ)
    .endQtrYYYYQ(this.endQtrYYYYQ)
    .sourceRepo(this.sourceRepo)
    .oauthLogin(this.oauthLogin)
    .commitMessage(this.commitMessage)
    .commitId(this.commitId)
    .githubUrl(githubUrl(this.sourceRepo, this.commitId))
    .build();
  log.info("getSystemInfo returns {}",si);
  return si;
  }

}
