import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Specify data migration function in with-clause
(with migration = Migration.run)
actor {
  // Core Types
  type TestHistory = {
    className : Text;
    board : Text;
    chapter : Text;
    score : Nat;
    date : Int;
  };

  type UserProfile = {
    username : Text;
    rank : Text;
    streaks : Nat;
    totalTestsTaken : Nat;
  };

  type Achievement = {
    badgeName : Text;
    earnedDate : Int;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let testHistories = Map.empty<Principal, Map.Map<Text, TestHistory>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let achievements = Map.empty<Principal, Map.Map<Text, Achievement>>();

  // Test History CRUD
  public shared ({ caller }) func addTestHistory(test : TestHistory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add test history");
    };

    let userTests = switch (testHistories.get(caller)) {
      case (null) { Map.empty<Text, TestHistory>() };
      case (?tests) { tests };
    };
    userTests.add(test.chapter, test);
    testHistories.add(caller, userTests);

    // Update user profile stats
    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          username = test.className;
          rank = "Beginner";
          streaks = 1;
          totalTestsTaken = 1;
        };
        userProfiles.add(caller, newProfile);
      };
      case (?profile) {
        let updatedProfile : UserProfile = {
          profile with
          totalTestsTaken = profile.totalTestsTaken + 1;
          streaks = profile.streaks + 1;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getTestHistory() : async [TestHistory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view test history");
    };

    switch (testHistories.get(caller)) {
      case (null) { [] };
      case (?tests) { tests.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteTestHistory(chapter : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete test history");
    };

    switch (testHistories.get(caller)) {
      case (null) {};
      case (?tests) {
        tests.remove(chapter);
      };
    };
  };

  // Profile Management
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    userProfiles.get(user);
  };

  // Achievements
  public shared ({ caller }) func addAchievement(badgeName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add achievements");
    };

    let achievement : Achievement = {
      badgeName;
      earnedDate = Time.now();
    };

    let userAchievements = switch (achievements.get(caller)) {
      case (null) { Map.empty<Text, Achievement>() };
      case (?ach) { ach };
    };
    userAchievements.add(badgeName, achievement);
    achievements.add(caller, userAchievements);
  };

  public query ({ caller }) func getAchievements() : async [Achievement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view achievements");
    };

    switch (achievements.get(caller)) {
      case (null) { [] };
      case (?userAchievements) { userAchievements.values().toArray() };
    };
  };
};

