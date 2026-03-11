import { createClient } from "@/lib/supabase";
import { StaffSession, HierarchyRole, Worker } from "@/lib/types";

const STAFF_SESSION_KEY = "wexo-staff-session";

// ─────────────────────────────────────────────────────────────
// STAFF PIN LOGIN (for Managers & Team Members)
// ─────────────────────────────────────────────────────────────

export async function staffLogin(email: string, pin: string): Promise<StaffSession | null> {
    const supabase = createClient();

    // Find the staff member across all businesses by login_email + login_pin
    const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("login_email", email.toLowerCase().trim())
        .eq("login_pin", pin)
        .eq("status", "active")
        .single();

    if (error || !data) {
        console.error("Staff login failed:", error);
        return null;
    }

    const session: StaffSession = {
        staffId: data.id,
        staffName: data.name,
        role: data.hierarchy_role || "team_member",
        ownerId: data.user_id,
        loginEmail: data.login_email,
    };

    // Save session to localStorage
    if (typeof window !== "undefined") {
        localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
    }

    return session;
}

export function staffLogout(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(STAFF_SESSION_KEY);
    }
}

export function getStaffSession(): StaffSession | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as StaffSession;
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// ADMIN AUTH CHECK (normal Supabase auth)
// ─────────────────────────────────────────────────────────────

export async function isAdminLoggedIn(): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
}

export async function getAdminUserId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

// ─────────────────────────────────────────────────────────────
// COMBINED: Determine current user type
// ─────────────────────────────────────────────────────────────

export type UserType = 
    | { type: "admin"; userId: string }
    | { type: "staff"; session: StaffSession }
    | { type: "none" };

export async function getCurrentUser(): Promise<UserType> {
    // First check if admin is logged in (Supabase auth)
    const adminId = await getAdminUserId();
    if (adminId) {
        return { type: "admin", userId: adminId };
    }

    // Then check staff session
    const staffSession = getStaffSession();
    if (staffSession) {
        return { type: "staff", session: staffSession };
    }

    return { type: "none" };
}

// ─────────────────────────────────────────────────────────────
// ADMIN: Setup staff login credentials
// ─────────────────────────────────────────────────────────────

export async function setStaffLoginCredentials(
    staffId: string,
    loginEmail: string,
    loginPin: string,
    hierarchyRole: HierarchyRole
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("staff_members")
        .update({
            login_email: loginEmail.toLowerCase().trim(),
            login_pin: loginPin,
            hierarchy_role: hierarchyRole,
        })
        .eq("id", staffId);

    if (error) {
        console.error("Error setting staff credentials:", error);
        return false;
    }
    return true;
}

export async function setStaffManager(
    staffId: string,
    managerId: string | null
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("staff_members")
        .update({ manager_id: managerId })
        .eq("id", staffId);

    if (error) {
        console.error("Error setting staff manager:", error);
        return false;
    }
    return true;
}

// ─────────────────────────────────────────────────────────────
// GET TEAM STRUCTURE
// ─────────────────────────────────────────────────────────────

export async function getManagers(): Promise<Worker[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("hierarchy_role", "manager")
        .eq("status", "active")
        .order("name");

    if (error) {
        console.error("Error fetching managers:", error);
        return [];
    }
    return data || [];
}

export async function getTeamMembersByManager(managerId: string): Promise<Worker[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("manager_id", managerId)
        .eq("hierarchy_role", "team_member")
        .eq("status", "active")
        .order("name");

    if (error) {
        console.error("Error fetching team members:", error);
        return [];
    }
    return data || [];
}
