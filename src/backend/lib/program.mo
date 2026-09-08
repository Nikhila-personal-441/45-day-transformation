import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/program";

module {
  // Static diet plan data (Indian food options with calories).
  public let dietPlan : Types.DietPlan = {
    dailyCalorieTarget = 2000;
    foodOptions = [
      { name = "Dal"; calories = 200 },
      { name = "Roti"; calories = 120 },
      { name = "Rice"; calories = 200 },
      { name = "Sabzi"; calories = 150 },
      { name = "Paneer"; calories = 250 },
      { name = "Curd"; calories = 100 },
      { name = "Chicken Curry"; calories = 300 },
      { name = "Idli"; calories = 150 },
      { name = "Dosa"; calories = 250 },
      { name = "Salad"; calories = 80 },
    ];
  };

  // Nanoseconds in one day.
  let NS_PER_DAY : Int = 86400000000000;

  // ---- Onboarding / profile ----
  public func getProfile(state : Types.ProgramState, userId : Types.UserId) : ?Types.UserProfileView {
    switch (state.profiles.get(userId)) {
      case null { null };
      case (?p) {
        ?{
          id = p.id;
          name = p.name;
          fitnessGoal = p.fitnessGoal;
          startingLevel = p.startingLevel;
          onboardingComplete = p.onboardingComplete;
        };
      };
    };
  };

  public func completeOnboarding(
    state : Types.ProgramState,
    userId : Types.UserId,
    name : Text,
    fitnessGoal : Types.FitnessGoal,
    startingLevel : Types.StartingLevel,
  ) : Types.UserProfileView {
    let profile : Types.UserProfile = {
      id = userId;
      name;
      fitnessGoal;
      startingLevel;
      var onboardingComplete = true;
    };
    state.profiles.add(userId, profile);
    ignore ensureProgress(state, userId);
    {
      id = profile.id;
      name = profile.name;
      fitnessGoal = profile.fitnessGoal;
      startingLevel = profile.startingLevel;
      onboardingComplete = profile.onboardingComplete;
    };
  };

  // ---- Program data ----
  public func getProgram(state : Types.ProgramState) : Types.Program {
    state.program;
  };

  public func getDay(state : Types.ProgramState, dayNumber : Nat) : ?Types.Day {
    state.program.days.find(func d = d.dayNumber == dayNumber);
  };

  public func getDaysByWeek(state : Types.ProgramState, week : Nat) : [Types.Day] {
    state.program.days.filter(func d = d.week == week);
  };

  // ---- Completion / unlock ----
  public func isDayUnlocked(state : Types.ProgramState, userId : Types.UserId, dayNumber : Nat) : Bool {
    if (dayNumber == 1) { return true };
    switch (state.progress.get(userId)) {
      case null { false };
      case (?p) {
        // Day N unlocks after day N-1 completes.
        p.completedDays.any(func d = d + 1 == dayNumber);
      };
    };
  };

  public func markDayComplete(state : Types.ProgramState, userId : Types.UserId, dayNumber : Nat) : Bool {
    if (not isDayUnlocked(state, userId, dayNumber)) { return false };
    let progress = ensureProgress(state, userId);
    if (progress.completedDays.contains(dayNumber)) { return true };
    progress.completedDays := progress.completedDays.concat([dayNumber]);
    true;
  };

  // ---- Diet plan / meal logging ----
  public func getDietPlan(state : Types.ProgramState) : Types.DietPlan {
    ignore state;
    dietPlan;
  };

  public func logMeal(state : Types.ProgramState, userId : Types.UserId, date : Text, items : [Types.FoodItem]) : Types.MealLog {
    let progress = ensureProgress(state, userId);
    let total = items.foldLeft(0, func (acc : Nat, item : Types.FoodItem) : Nat { acc + item.calories });
    let mealLog : Types.MealLog = { date; items; totalCalories = total };
    switch (progress.mealLogs.find(func m = m.date == date)) {
      case null { progress.mealLogs := progress.mealLogs.concat([mealLog]) };
      case (?_) {
        progress.mealLogs := progress.mealLogs.map(func m = if (m.date == date) { mealLog } else { m });
      };
    };
    mealLog;
  };

  public func getCalorieLog(state : Types.ProgramState, userId : Types.UserId, date : Text) : ?Types.MealLog {
    switch (state.progress.get(userId)) {
      case null { null };
      case (?p) { p.mealLogs.find(func m = m.date == date) };
    };
  };

  // ---- Progress / streak ----
  public func getProgress(state : Types.ProgramState, userId : Types.UserId) : Types.UserProgressView {
    let progress = ensureProgress(state, userId);
    let totalDays = state.program.days.size();
    let completedCount = progress.completedDays.size();
    let completionPercentage = if (totalDays == 0) { 0 } else { (completedCount * 100) / totalDays };
    {
      completedDays = progress.completedDays;
      mealLogs = progress.mealLogs;
      dailyCalorieTarget = progress.dailyCalorieTarget;
      completionPercentage;
      streak = computeStreak(state, progress);
    };
  };

  // ---- Subscription (90-day access) ----
  public func getSubscriptionStatus(state : Types.ProgramState, userId : Types.UserId) : Types.SubscriptionStatus {
    let progress = ensureProgress(state, userId);
    let sub = progress.subscription;
    let now = Time.now();
    let active = sub.active and now < sub.endTime;
    let daysRemaining = if (active) {
      let remainingNs = sub.endTime - now;
      (remainingNs / NS_PER_DAY).toNat();
    } else { 0 };
    { active; startTime = sub.startTime; endTime = sub.endTime; daysRemaining };
  };

  public func activateSubscription(state : Types.ProgramState, userId : Types.UserId) : Types.SubscriptionStatus {
    let progress = ensureProgress(state, userId);
    let now = Time.now();
    progress.subscription.active := true;
    progress.subscription.startTime := now;
    progress.subscription.endTime := now + 90 * NS_PER_DAY;
    getSubscriptionStatus(state, userId);
  };

  // ---- Internal helpers ----
  func ensureProgress(state : Types.ProgramState, userId : Types.UserId) : Types.UserProgress {
    switch (state.progress.get(userId)) {
      case (?p) p;
      case null {
        let p : Types.UserProgress = {
          var completedDays = [];
          var mealLogs = [];
          var dailyCalorieTarget = dietPlan.dailyCalorieTarget;
          var subscription = { var active = false; var startTime = 0; var endTime = 0 };
        };
        state.progress.add(userId, p);
        p;
      };
    };
  };

  func computeStreak(state : Types.ProgramState, progress : Types.UserProgress) : Nat {
    var streak = 0;
    var d = 1;
    let total = state.program.days.size();
    while (d <= total and progress.completedDays.contains(d)) {
      streak += 1;
      d += 1;
    };
    streak;
  };
};
