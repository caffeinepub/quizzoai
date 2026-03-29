import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {};
  type NewActor = {
    testHistories : Map.Map<Principal, Map.Map<Text, TestHistory>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    achievements : Map.Map<Principal, Map.Map<Text, Achievement>>;
  };

  // Core Types for Migration
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

  public func run(_old : OldActor) : NewActor {
    {
      testHistories = Map.empty<Principal, Map.Map<Text, TestHistory>>();
      userProfiles = Map.empty<Principal, UserProfile>();
      achievements = Map.empty<Principal, Map.Map<Text, Achievement>>();
    };
  };
};

