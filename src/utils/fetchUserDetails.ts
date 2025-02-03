import { supabase } from "@/lib/supabaseClient";

export const fetchUserDetails = async () => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User is not authenticated");
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from("users")
      .select("firstname, lastname, email")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error(error.message);
    return null;
  }
};
};

export const fetchUserInitials = async (): Promise<string | null> => {
  try {
    const userDetails = await fetchUserDetails();

    if (userDetails?.firstname && userDetails?.lastname) {
      const firstInitial = userDetails?.firstname.charAt(0).toUpperCase();
      const lastInitial = userDetails?.lastname.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }

    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error("Error fetching intials", error.message);
    return null;
  } else {
    console.error("An unexpected error occurred.");
    return null;
  }
}
};
