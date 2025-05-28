import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import AuthContext from "./AuthContext";
import { ADMIN_EMAILS } from "../config/constants";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inPasswordResetMode, setInPasswordResetMode] = useState(false);

  useEffect(() => {
    // Check for active session on initial load
    function getSession() {
      try {
        supabase.auth
          .getSession()
          .then(({ data: { session } }) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            setIsAdmin(ADMIN_EMAILS.includes(currentUser?.email));
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error getting session:", error);
            setLoading(false);
          });
      } catch (error) {
        console.error("Exception in getSession:", error);
        setLoading(false);
      }
    }

    getSession();

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        setIsAdmin(ADMIN_EMAILS.includes(currentUser?.email));
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error("Error in auth state change:", error);
    }
  }, []);

  // Check if email exists and sign in the user if it does, or sign up if it doesn't
  async function signUp(email, password, name) {
    try {
      // Instead of trying to check if the email exists first, just attempt to sign up directly
      // Supabase will return an error if the email is already registered

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        // If the error indicates the user is already registered
        if (error.message && (
            error.message.includes("already registered") || 
            error.message.includes("already in use") ||
            error.message.includes("already exists")
          )) {
          // User exists, attempt to sign in with the provided password
          return signIn(email, password).then(({ data: signInData, error: signInError }) => {
            if (signInError) {
              if (signInError.message.includes("Invalid login credentials")) {
                // Password is incorrect, but user exists
                return {
                  data: null,
                  error: {
                    message: "An account with this email already exists. Please sign in.",
                  },
                };
              }
              return { data: signInData, error: signInError };
            }

            // Successfully signed in
            return {
              data: signInData,
              error: null,
              existingUser: true, // Flag to indicate this was an existing user
            };
          });
        }
        
        // For other errors, just return them
        return { data: null, error };
      }

      // If email confirmation is required, let the user know
      if (data?.user && !data?.user?.identities?.length) {
        return {
          data,
          error: {
            message:
              "A confirmation email has been sent. Please check your email to verify your account.",
          },
        };
      }

      // If successful signup and we have a user, create a profile entry
      if (data?.user) {
        // Insert into profiles table
        supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            name: name,
            email: email,
            updated_at: new Date().toISOString(),
          })
          .then(({ error: profileError }) => {
            if (profileError) {
              console.error("Error creating profile:", profileError);
            }
          });
      }

      return { data, error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return Promise.resolve({ data: null, error });
    }
  }

  // Sign-up function with email verification
  const signUpWithEmailVerification = async (
    email,
    password,
    metadata = {}
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign in function
  async function signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Sign in with Google function
  async function signInWithGoogle() {
    try {
      // Using redirectTo to specify where to go after the OAuth flow
      return supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      return { data: null, error };
    }
  }

  // Reset password function
  async function resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) {
        console.error("Password reset error:", error);
        return { data: null, error };
      }
      
      return { 
        data, 
        error: null,
        message: "Password reset instructions have been sent to your email."
      };
    } catch (error) {
      console.error("Password reset exception:", error);
      return { 
        data: null, 
        error: {
          message: "Failed to send password reset email. Please try again later."
        }
      };
    }
  }

  // Sign out function
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
      // Clear user state regardless of error to ensure UI updates
      setUser(null);
      setIsAdmin(false);
      return { error };
    } catch (error) {
      console.error("Exception in signOut:", error);
      // Still clear user state to force UI update
      setUser(null);
      setIsAdmin(false);
      return { error };
    }
  }

  // Update user profile function
  async function updateProfile(profileData) {
    try {
      // Use the user from context instead of getUser()
      if (!user) throw new Error("User not found");

      // Update auth user data if available
      let authData = { user: null };
      let authError = null;

      if (profileData.email || profileData.password) {
        const { data, error } = await supabase.auth.updateUser({
          email: profileData.email,
          password: profileData.password,
        });
        authData = data;
        authError = error;
      }

      // Update profile data in the profiles table
      let profileError = null;
      if (
        profileData.name ||
        profileData.avatar_url ||
        profileData.phone ||
        profileData.address
      ) {
        const updates = {
          id: user.id,
          updated_at: new Date().toISOString(),
        };

        if (profileData.name) updates.name = profileData.name;
        if (profileData.avatar_url) updates.avatar_url = profileData.avatar_url;
        if (profileData.phone) updates.phone = profileData.phone;
        if (profileData.address) updates.address = profileData.address;

        const { error } = await supabase.from("profiles").upsert(updates);
        profileError = error;
      }

      // Update user metadata
      if (
        profileData.name ||
        profileData.avatar_url ||
        profileData.phone ||
        profileData.address
      ) {
        const metadataUpdates = {};
        if (profileData.name) metadataUpdates.name = profileData.name;
        if (profileData.avatar_url)
          metadataUpdates.avatar_url = profileData.avatar_url;
        if (profileData.phone) metadataUpdates.phone = profileData.phone;
        if (profileData.address) metadataUpdates.address = profileData.address;

        await supabase.auth.updateUser({
          data: metadataUpdates,
        });
      }

      // If we have updated auth data, update the user state
      if (authData?.user) {
        setUser(authData.user);
      }

      // Return any errors
      return {
        error: authError || profileError,
        data: authData?.user || user,
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { data: null, error };
    }
  }

  // Check if the current user is an admin
  const value = {
    user,
    isAdmin,
    loading,
    inPasswordResetMode,
    setInPasswordResetMode,
    signUp,
    signUpWithEmailVerification,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
