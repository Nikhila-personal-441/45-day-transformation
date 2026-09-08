import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    name: string;
    reps: bigint;
    restSec: bigint;
    animationUrl: string;
    durationSec: bigint;
}
export type Timestamp = bigint;
export interface MealLog {
    date: string;
    totalCalories: bigint;
    items: Array<FoodItem>;
}
export interface UserProgressView {
    completedDays: Array<bigint>;
    streak: bigint;
    completionPercentage: bigint;
    dailyCalorieTarget: bigint;
    mealLogs: Array<MealLog>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Day {
    exercises: Array<Exercise>;
    week: bigint;
    dayNumber: bigint;
    dayType: DayType;
}
export type UserId = Principal;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface DietPlan {
    foodOptions: Array<FoodItem>;
    dailyCalorieTarget: bigint;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface Program {
    days: Array<Day>;
}
export interface UserProfileView {
    id: UserId;
    fitnessGoal: FitnessGoal;
    name: string;
    onboardingComplete: boolean;
    startingLevel: StartingLevel;
}
export interface FoodItem {
    calories: bigint;
    name: string;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface SubscriptionStatus {
    startTime: Timestamp;
    active: boolean;
    endTime: Timestamp;
    daysRemaining: bigint;
}
export enum DayType {
    rest = "rest",
    workout = "workout",
    recovery = "recovery"
}
export enum FitnessGoal {
    improveFitness = "improveFitness",
    buildMuscle = "buildMuscle",
    generalHealth = "generalHealth",
    loseWeight = "loseWeight"
}
export enum StartingLevel {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateSubscription(): Promise<SubscriptionStatus>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeOnboarding(name: string, fitnessGoal: FitnessGoal, startingLevel: StartingLevel): Promise<UserProfileView>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getCalorieLog(date: string): Promise<MealLog | null>;
    getDay(dayNumber: bigint): Promise<Day | null>;
    getDaysByWeek(week: bigint): Promise<Array<Day>>;
    getDietPlan(): Promise<DietPlan>;
    getProfile(): Promise<UserProfileView | null>;
    getProgram(): Promise<Program>;
    getProgress(): Promise<UserProgressView>;
    getSubscriptionStatus(): Promise<SubscriptionStatus>;
    isCallerAdmin(): Promise<boolean>;
    isDayUnlocked(dayNumber: bigint): Promise<boolean>;
    logMeal(date: string, items: Array<FoodItem>): Promise<MealLog>;
    markDayComplete(dayNumber: bigint): Promise<boolean>;
    schema(): Promise<string>;
}
