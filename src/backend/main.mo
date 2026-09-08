import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import ArrayEntity "mo:caffeineai-oql/ArrayEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import TextValue "mo:caffeineai-oql/TextValue";
import NatValue "mo:caffeineai-oql/NatValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import Principal "mo:core/Principal";
import Types "types/program";
import ProgramApi "mixins/program-api";
import ProgramLib "lib/program";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let programState : Types.ProgramState;

  include MixinAuthorization(accessControlState, null);
  include ProgramApi(programState);
  include ApiDocMixin();

  include Expose({
    entities = [
      OQL.Entity.manual<Types.Day>("day", func () = programState.program.days.values(), "Day", "dayNumber")
        .sample({ dayNumber = 0; dayType = #workout; week = 0; exercises = [] })
        .payload("dayNumber", func d = d.dayNumber)
        .payload("week", func d = d.week)
        .payload("dayType", func d = switch (d.dayType) { case (#workout) "workout"; case (#recovery) "recovery"; case (#rest) "rest" })
        .payload("exerciseCount", func d = d.exercises.size())
        .public_()
        .build(),
      ProgramLib.dietPlan.foodOptions.toEntity<Types.FoodItem>("foodOption", "FoodItem", "name")
        .sample({ name = ""; calories = 0 })
        .public_()
        .build(),
      OQL.Entity.manual<(Types.UserId, Types.UserProfile)>("profile", func () = programState.profiles.entries(), "UserProfile", "id")
        .sample((Principal.fromText("aaaaa-aa"), { id = Principal.fromText("aaaaa-aa"); name = ""; fitnessGoal = #generalHealth; startingLevel = #beginner; var onboardingComplete = false }))
        .payload("id", func (_, p) = p.id)
        .payload("name", func (_, p) = p.name)
        .payload("fitnessGoal", func (_, p) = switch (p.fitnessGoal) { case (#loseWeight) "loseWeight"; case (#buildMuscle) "buildMuscle"; case (#improveFitness) "improveFitness"; case (#generalHealth) "generalHealth" })
        .payload("startingLevel", func (_, p) = switch (p.startingLevel) { case (#beginner) "beginner"; case (#intermediate) "intermediate"; case (#advanced) "advanced" })
        .payload("onboardingComplete", func (_, p) = p.onboardingComplete)
        .ownedBy("id")
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Types.UserId, Types.UserProgress)>("progress", func () = programState.progress.entries(), "UserProgress", "user")
        .sample((Principal.fromText("aaaaa-aa"), { var completedDays = [] : [Nat]; var mealLogs = [] : [Types.MealLog]; var dailyCalorieTarget = 0; var subscription = { var active = false; var startTime = 0 : Int; var endTime = 0 : Int } }))
        .payload("user", func (userId, _) = userId)
        .payload("completedDayCount", func (_, p) = p.completedDays.size())
        .payload("dailyCalorieTarget", func (_, p) = p.dailyCalorieTarget)
        .payload("mealLogCount", func (_, p) = p.mealLogs.size())
        .payload("subscriptionActive", func (_, p) = p.subscription.active)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
    ];
  });
};
