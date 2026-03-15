import { createClient } from "@/lib/supabase";
import { StaffSession, HierarchyRole, Worker } from "@/lib/types";

const STAFF_SESSION_KEY = "wexo-staff-session";

// ─────────────────────────────────────────────────────────────
// STAFF PIN LOGIN (for Managers & Team Members)
// ─────────────────────────────────────────────────────────────

export async function staffLogin(email: string, pin: string): Promise<StaffSession | null> {
    const supabase = createClient();

    // Use a secure RPC to verify credentials without exposing the table to public RLS
    const { data, error } = await supabase
        .rpc("staff_login_verify", { 
            p_email: email.toLowerCase().trim(), 
            p_pin: pin 
        });

    if (error) {
        console.error("Staff login query error:", error);
        return null;
    }

    // data is returned as an array from RPC SETOF
    const staff = data && (data as any[]).length > 0 ? (data as any[])[0] : null;

    if (!staff) {
        console.warn("Staff login failed: Invalid credentials or inactive account.");
        return null;
    }

    const session: StaffSession = {
        staffId: staff.id,
        staffName: staff.name,
        role: staff.hierarchy_role || "team_member",
        ownerId: staff.user_id,
        loginEmail: staff.login_email,
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

export async function updateStaffMember(staffId: string, data: { name?: string }): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("staff_members")
        .update(data)
        .eq("id", staffId);

    if (error) {
        console.error("Error updating staff member:", error);
        return false;
    }
    return true;
}

