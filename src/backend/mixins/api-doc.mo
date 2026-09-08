mixin () {
  public query func getApiDoc() : async Text {
    "# 45-Day Fitness & Diet Program — Backend API\n" #
    "\n" #
    "## Purpose\n" #
    "This canister powers a data-driven 45-day fitness program for Indian users. It stores a\n" #
    "user's onboarding profile, the 45-day program schedule (workout / recovery / rest days),\n" #
    "an Indian-food diet plan with per-item calories, per-user meal logs and completion\n" #
    "progress, and a 90-day subscription gate. All per-user data is keyed by the caller's\n" #
    "Internet Identity principal.\n" #
    "\n" #
    "## Identity & Authentication\n" #
    "Users sign in with Internet Identity (II). The caller's principal is derived from their\n" #
    "II identity and is the stable key for all per-user state (`profiles`, `progress`).\n" #
    "\n" #
    "The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "`/.well-known/ii-derivation-origin` when available. An agent already holding the user's\n" #
    "II authorization derives the correct per-app principal against that origin, for example\n" #
    "`icp identity link web <name> --app <host>`. Such a delegation acts with the user's full\n" #
    "authority in this app until it expires.\n" #
    "\n" #
    "### Registration prerequisite\n" #
    "Role registration happens only when a caller signs in through the app's own frontend,\n" #
    "which calls `_initialize_access_control` (or `_internet_identity_sign_in_finish`) once as\n" #
    "a signed-in caller. The first caller to register becomes `#admin`; every later caller\n" #
    "becomes `#user`. A principal that never signed in through the frontend is unregistered\n" #
    "even when it belongs to the app's owner, and a signed-in caller derived against a\n" #
    "different origin is a different principal than the one the frontend registered.\n" #
    "\n" #
    "### Roles\n" #
    "- `#admin` — the first registered caller; can assign roles to others.\n" #
    "- `#user` — every subsequent registered caller.\n" #
    "- `#guest` — anonymous callers (never stored).\n" #
    "\n" #
    "## Public Methods\n" #
    "\n" #
    "### Authentication & authorization (from `MixinAuthorization`)\n" #
    "- `_internet_identity_sign_in_start() : async Blob` — shared; issues a sign-in challenge\n" #
    "  blob. No caller restriction.\n" #
    "- `_internet_identity_sign_in_finish() : async Result<(), Verify.Error>` — shared;\n" #
    "  completes sign-in and registers the caller (first caller becomes admin).\n" #
    "- `_initialize_access_control() : async ()` — shared; registers the signed-in caller\n" #
    "  (first becomes admin). Anonymous callers are ignored.\n" #
    "- `getCallerUserRole() : async UserRole` — query; returns `#guest` for anonymous,\n" #
    "  the caller's stored role otherwise. An unregistered signed-in caller traps with\n" #
    "  `\"User is not registered\"`.\n" #
    "- `assignCallerUserRole(user : Principal, role : UserRole) : async ()` — shared;\n" #
    "  admin-only. Non-admins trap with `\"Unauthorized: Only admins can assign user roles\"`.\n" #
    "- `isCallerAdmin() : async Bool` — query; true for admins. An unregistered signed-in\n" #
    "  caller traps with `\"User is not registered\"`.\n" #
    "\n" #
    "### Onboarding & profile\n" #
    "- `getProfile() : async ?UserProfileView` — query; returns the caller's profile or\n" #
    "  `null` if not onboarded. No role guard; keyed by caller.\n" #
    "- `completeOnboarding(name : Text, fitnessGoal : FitnessGoal, startingLevel : StartingLevel)\n" #
    "  : async UserProfileView` — shared; creates/overwrites the caller's profile and marks\n" #
    "  onboarding complete. Idempotent per caller (re-calling overwrites the same profile).\n" #
    "\n" #
    "### Program data\n" #
    "- `getProgram() : async Program` — query; returns all 45 days.\n" #
    "- `getDay(dayNumber : Nat) : async ?Day` — query; returns one day or `null`.\n" #
    "- `getDaysByWeek(week : Nat) : async [Day]` — query; returns the days in a 1-based week.\n" #
    "- `getDietPlan() : async DietPlan` — query; returns the daily calorie target and the\n" #
    "  Indian food options with per-item calories.\n" #
    "\n" #
    "### Completion & unlock\n" #
    "- `isDayUnlocked(dayNumber : Nat) : async Bool` — query; day 1 is always unlocked; day N\n" #
    "  unlocks only after day N-1 is in the caller's completed set.\n" #
    "- `markDayComplete(dayNumber : Nat) : async Bool` — shared; marks the day complete if it\n" #
    "  is unlocked, then returns true. Returns false if the day is not unlocked. Idempotent:\n" #
    "  marking an already-completed day returns true without duplicating it.\n" #
    "\n" #
    "### Diet / meal logging\n" #
    "- `logMeal(date : Text, items : [FoodItem]) : async MealLog` — shared; records a meal for\n" #
    "  the caller on `date`, summing `items` calories. Re-logging the same `date` replaces the\n" #
    "  previous log for that date (idempotent per date).\n" #
    "- `getCalorieLog(date : Text) : async ?MealLog` — query; returns the caller's meal log for\n" #
    "  `date` or `null`.\n" #
    "### Progress\n" #
    "- `getProgress() : async UserProgressView` — query; returns the caller's completed days,\n" #
    "  meal logs, daily calorie target, completion percentage, and streak.\n" #
    "\n" #
    "### Subscription (90-day access)\n" #
    "- `getSubscriptionStatus() : async SubscriptionStatus` — query; returns whether the\n" #
    "  caller's subscription is active and its start/end times and days remaining.\n" #
    "- `activateSubscription() : async SubscriptionStatus` — shared; activates a 90-day\n" #
    "  subscription for the caller starting now. Re-activating resets the 90-day window from\n" #
    "  the current time.\n" #
    "\n" #
    "### OQL (Data Intelligence)\n" #
    "- `schema() : async Text` — query; returns the OQL schema of the exposed entities.\n" #
    "- `execute(query : Text) : async Text` — query; runs a JSON OQL query over the exposed\n" #
    "  entities.\n" #
    "\n" #
    "### Documentation\n" #
    "- `getApiDoc() : async Text` — query; returns this document.\n" #
    "\n" #
    "## OQL Entities & Authorization\n" #
    "The following entities are exposed through `schema()` / `execute()`, each with its own\n" #
    "authorization level:\n" #
    "- `day` — public; the 45-day program schedule (dayNumber, week, dayType, exerciseCount).\n" #
    "- `foodOption` — public; Indian food options (name, calories).\n" #
    "- `profile` — controller-or-scoped; a user's onboarding profile. A signed-in caller reads\n" #
    "  only their own row (owned by `id`); the platform controller reads all.\n" #
    "- `progress` — controller-or-scoped; a user's progress. A signed-in caller reads only\n" #
    "  their own row (owned by `user`); the platform controller reads all.\n" #
    "\n" #
    "## Units & Encodings\n" #
    "- Timestamps are `Int` nanoseconds since the Unix epoch (`Time.now()`).\n" #
    "- `UserId` is a `Principal` (the caller's II-derived principal).\n" #
    "- `date` is a `Text` in `YYYY-MM-DD` form.\n" #
    "- `FitnessGoal` is a variant: `#loseWeight`, `#buildMuscle`, `#improveFitness`,\n" #
    "  `#generalHealth`.\n" #
    "- `StartingLevel` is a variant: `#beginner`, `#intermediate`, `#advanced`.\n" #
    "- `DayType` is a variant: `#workout`, `#recovery`, `#rest`.\n" #
    "- `UserRole` is a variant: `#admin`, `#user`, `#guest`.\n" #
    "- `Exercise.durationSec`, `reps`, `restSec` are `Nat` seconds/reps.\n" #
    "- `FoodItem.calories` is `Nat` kilocalories.\n" #
    "- `SubscriptionStatus.daysRemaining` is a `Nat`; it is 0 when the subscription is inactive\n" #
    "  or expired.\n" #
    "\n" #
    "## Lifecycle & Polling\n" #
    "- Onboarding: a returning user who already completed onboarding sees the dashboard\n" #
    "  directly; `getProfile()` returns non-null once `completeOnboarding` has been called.\n" #
    "- Unlock: day 1 is unlocked at start. Day N unlocks only after day N-1 is completed.\n" #
    "  Completing a day persists and unlocks the next; completed days can be revisited and\n" #
    "  replayed.\n" #
    "- Subscription: `activateSubscription` grants 90 days from the call time. Access is valid\n" #
    "  while `active` is true and `now < endTime`. There is no polling loop; clients call\n" #
    "  `getSubscriptionStatus()` to read the current state.\n" #
    "\n" #
    "## Mutation Retry Safety & Idempotency\n" #
    "- `completeOnboarding` is idempotent per caller (overwrites the same profile).\n" #
    "- `markDayComplete` is idempotent: re-marking a completed day returns true and does not\n" #
    "  duplicate the day in `completedDays`.\n" #
    "- `logMeal` is idempotent per `date`: re-logging the same date replaces that date's log.\n" #
    "- `activateSubscription` is not idempotent in effect: each call resets the 90-day window\n" #
    "  from the current time. Callers should guard against accidental double-activation.\n" #
    "- `assignCallerUserRole` overwrites the target's role; re-assigning is safe.\n" #
    "\n" #
    "## Errors, Traps & Gotchas\n" #
    "- `getCallerUserRole` and `isCallerAdmin` trap with `\"User is not registered\"` for a\n" #
    "  signed-in caller that has not registered through the frontend. Register first via\n" #
    "  `_initialize_access_control`.\n" #
    "- `assignCallerUserRole` traps with `\"Unauthorized: Only admins can assign user roles\"`\n" #
    "  for non-admin callers.\n" #
    "- Anonymous callers are `#guest`; they can read public program data but have no stored\n" #
    "  profile or progress.\n" #
    "- Program data is static and data-driven; Days 8-45 are generated from the same\n" #
    "  templates, so adding days later is a data change, not a code change.\n" #
    "- The diet plan is a fixed static list; `getDietPlan` ignores caller state.\n" #
    "- `markDayComplete` returns `false` (does not trap) when the day is not unlocked.\n" #
    "- OQL `profile` and `progress` rows are scoped to the caller; a scoped query can never\n" #
    "  read another user's rows.\n"
  };
};
