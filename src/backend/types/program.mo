import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type UserId = Principal;
  public type Timestamp = Int; // nanoseconds since epoch (Time.now())

  // ---- Onboarding / profile ----
  public type FitnessGoal = {
    #loseWeight;
    #buildMuscle;
    #improveFitness;
    #generalHealth;
  };

  public type StartingLevel = {
    #beginner;
    #intermediate;
    #advanced;
  };

  public type UserProfile = {
    id : UserId;
    name : Text;
    fitnessGoal : FitnessGoal;
    startingLevel : StartingLevel;
    var onboardingComplete : Bool;
  };

  // Shared (serializable) view of a user profile for the API boundary.
  public type UserProfileView = {
    id : UserId;
    name : Text;
    fitnessGoal : FitnessGoal;
    startingLevel : StartingLevel;
    onboardingComplete : Bool;
  };

  // ---- 45-day program data model ----
  public type DayType = {
    #workout;
    #recovery;
    #rest;
  };

  public type Exercise = {
    name : Text;
    animationUrl : Text;
    durationSec : Nat;
    reps : Nat;
    restSec : Nat;
  };

  public type Day = {
    dayNumber : Nat;
    dayType : DayType;
    week : Nat;
    exercises : [Exercise];
  };

  public type Program = {
    days : [Day];
  };

  // ---- Diet plan (Indian food) ----
  public type FoodItem = {
    name : Text;
    calories : Nat;
  };

  public type DietPlan = {
    dailyCalorieTarget : Nat;
    foodOptions : [FoodItem];
  };

  public type MealLog = {
    date : Text; // YYYY-MM-DD
    items : [FoodItem];
    totalCalories : Nat;
  };

  // ---- Subscription (90-day access) ----
  public type SubscriptionState = {
    var active : Bool;
    var startTime : Timestamp;
    var endTime : Timestamp;
  };

  public type SubscriptionStatus = {
    active : Bool;
    startTime : Timestamp;
    endTime : Timestamp;
    daysRemaining : Nat;
  };

  // ---- Per-user progress ----
  public type UserProgress = {
    var completedDays : [Nat];
    var mealLogs : [MealLog];
    var dailyCalorieTarget : Nat;
    var subscription : SubscriptionState;
  };

  public type UserProgressView = {
    completedDays : [Nat];
    mealLogs : [MealLog];
    dailyCalorieTarget : Nat;
    completionPercentage : Nat;
    streak : Nat;
  };

  // ---- Shared state injected into the program mixin ----
  public type ProgramState = {
    program : Program;
    profiles : Map.Map<UserId, UserProfile>;
    progress : Map.Map<UserId, UserProgress>;
  };
};
