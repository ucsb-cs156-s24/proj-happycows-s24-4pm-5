package edu.ucsb.cs156.happiercows.models;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AccessLevel;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class SystemInfo {
  private String oauthLogin;
  private Boolean springH2ConsoleEnabled;
  private Boolean showSwaggerUILink;
  private String startQtrYYYYQ;
  private String endQtrYYYYQ;
  private String sourceRepo; // user configured URL of the source repository for footer
  private String commitMessage;
  private String commitId;
  private String githubUrl; // URL to the commit in the source repository
}
