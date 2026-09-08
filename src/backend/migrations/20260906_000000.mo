import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // ---- Inlined stable types (self-contained; no project imports) ----
  type UserRole = { #admin; #user; #guest };
  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type UserId = Principal;
  type Timestamp = Int;

  type FitnessGoal = { #loseWeight; #buildMuscle; #improveFitness; #generalHealth };
  type StartingLevel = { #beginner; #intermediate; #advanced };
  type UserProfile = {
    id : UserId;
    name : Text;
    fitnessGoal : FitnessGoal;
    startingLevel : StartingLevel;
    var onboardingComplete : Bool;
  };

  type DayType = { #workout; #recovery; #rest };
  type Exercise = {
    name : Text;
    animationUrl : Text;
    durationSec : Nat;
    reps : Nat;
    restSec : Nat;
  };
  type Day = {
    dayNumber : Nat;
    dayType : DayType;
    week : Nat;
    exercises : [Exercise];
  };
  type Program = { days : [Day] };

  type FoodItem = { name : Text; calories : Nat };
  type MealLog = { date : Text; items : [FoodItem]; totalCalories : Nat };

  type SubscriptionState = {
    var active : Bool;
    var startTime : Timestamp;
    var endTime : Timestamp;
  };

  type UserProgress = {
    var completedDays : [Nat];
    var mealLogs : [MealLog];
    var dailyCalorieTarget : Nat;
    var subscription : SubscriptionState;
  };

  type ProgramState = {
    program : Program;
    profiles : Map.Map<UserId, UserProfile>;
    progress : Map.Map<UserId, UserProgress>;
  };

  type OldActor = {};
  type NewActor = {
    accessControlState : AccessControlState;
    programState : ProgramState;
  };

  // ---- Program data generation (data-driven; Days 8-45 added later as data) ----
  func ex(name : Text, durationSec : Nat, reps : Nat, restSec : Nat) : Exercise {
    {
      name;
      animationUrl = "https://example.com/animations/" # name # ".mp4";
      durationSec;
      reps;
      restSec;
    };
  };

  func fullBody() : [Exercise] {
    [
      ex("Squats", 45, 15, 30),
      ex("Push-ups", 45, 12, 30),
      ex("Lunges", 45, 12, 30),
      ex("Plank", 60, 1, 30),
      ex("Jumping Jacks", 45, 20, 30),
    ];
  };

  func cardio() : [Exercise] {
    [
      ex("Jumping Jacks", 60, 30, 20),
      ex("High Knees", 45, 30, 20),
      ex("Burpees", 45, 10, 30),
      ex("Mountain Climbers", 45, 20, 20),
      ex("Jog in Place", 60, 1, 20),
    ];
  };

  func upperBody() : [Exercise] {
    [
      ex("Push-ups", 45, 12, 30),
      ex("Tricep Dips", 45, 10, 30),
      ex("Shoulder Press", 45, 12, 30),
      ex("Bicep Curls", 45, 12, 30),
      ex("Plank", 60, 1, 30),
    ];
  };

  func hiit() : [Exercise] {
    [
      ex("Burpees", 40, 10, 20),
      ex("Squat Jumps", 40, 12, 20),
      ex("Mountain Climbers", 40, 20, 20),
      ex("High Knees", 40, 30, 20),
      ex("Plank Jacks", 40, 15, 20),
    ];
  };

  func recovery() : [Exercise] {
    [
      ex("Full Body Stretch", 60, 1, 15),
      ex("Yoga Flow", 90, 1, 15),
      ex("Deep Breathing", 60, 1, 15),
      ex("Foam Rolling", 60, 1, 15),
    ];
  };

  func rest() : [Exercise] {
    [];
  };

  func buildProgram() : Program {
    let days = List.empty<Day>();
    var i = 0;
    while (i < 45) {
      let dayNum = i + 1;
      let week = i / 7 + 1;
      let dow = i % 7 + 1;
      let (dayType, exercises) = switch (dow) {
        case 1 { (#workout, fullBody()) };
        case 2 { (#workout, cardio()) };
        case 3 { (#recovery, recovery()) };
        case 4 { (#workout, upperBody()) };
        case 5 { (#workout, hiit()) };
        case 6 { (#rest, rest()) };
        case _ { (#recovery, recovery()) };
      };
      days.add({ dayNumber = dayNum; dayType; week; exercises });
      i += 1;
    };
    { days = days.toArray() };
  };

  public func migration(old : OldActor) : NewActor {
    ignore old;
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty();
      };
      programState = {
        program = buildProgram();
        profiles = Map.empty();
        progress = Map.empty();
      };
    };
  };
};
