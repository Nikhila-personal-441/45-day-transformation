import Types "../types/program";
import ProgramLib "../lib/program";

mixin (state : Types.ProgramState) {
  // ---- Onboarding / profile ----
  public query ({ caller }) func getProfile() : async ?Types.UserProfileView {
    ProgramLib.getProfile(state, caller);
  };

  public shared ({ caller }) func completeOnboarding(
    name : Text,
    fitnessGoal : Types.FitnessGoal,
    startingLevel : Types.StartingLevel,
  ) : async Types.UserProfileView {
    ProgramLib.completeOnboarding(state, caller, name, fitnessGoal, startingLevel);
  };

  // ---- Program data ----
  public query func getProgram() : async Types.Program {
    ProgramLib.getProgram(state);
  };

  public query func getDay(dayNumber : Nat) : async ?Types.Day {
    ProgramLib.getDay(state, dayNumber);
  };

  public query func getDaysByWeek(week : Nat) : async [Types.Day] {
    ProgramLib.getDaysByWeek(state, week);
  };

  // ---- Completion / unlock ----
  public query ({ caller }) func isDayUnlocked(dayNumber : Nat) : async Bool {
    ProgramLib.isDayUnlocked(state, caller, dayNumber);
  };

  public shared ({ caller }) func markDayComplete(dayNumber : Nat) : async Bool {
    ProgramLib.markDayComplete(state, caller, dayNumber);
  };

  // ---- Diet plan / meal logging ----
  public query func getDietPlan() : async Types.DietPlan {
    ProgramLib.getDietPlan(state);
  };

  public shared ({ caller }) func logMeal(date : Text, items : [Types.FoodItem]) : async Types.MealLog {
    ProgramLib.logMeal(state, caller, date, items);
  };

  public query ({ caller }) func getCalorieLog(date : Text) : async ?Types.MealLog {
    ProgramLib.getCalorieLog(state, caller, date);
  };

  // ---- Progress / streak ----
  public query ({ caller }) func getProgress() : async Types.UserProgressView {
    ProgramLib.getProgress(state, caller);
  };

  // ---- Subscription (90-day access) ----
  public query ({ caller }) func getSubscriptionStatus() : async Types.SubscriptionStatus {
    ProgramLib.getSubscriptionStatus(state, caller);
  };

  public shared ({ caller }) func activateSubscription() : async Types.SubscriptionStatus {
    ProgramLib.activateSubscription(state, caller);
  };
};
