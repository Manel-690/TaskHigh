import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState("🙂");
  const [loading, setLoading] = useState(true);

  // 🔥 INIT (NUNCA TRAVA)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        const session = data.session;

        setSession(session);
        setUser(session?.user ?? null);

        // 🔥 NÃO BLOQUEIA
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Erro init:", err);
      } finally {
        if (mounted) setLoading(false); // 🔥 SEMPRE FINALIZA
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false); // 🔥 GARANTE
      },
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // 🔥 PROFILE SEGURO (NUNCA QUEBRA)
  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      // 🔥 fallback se não existir
      if (!data) {
        setProfile({ role: "user", avatar: "🙂" });
        setAvatar("🙂");
        return;
      }

      setProfile(data);
      setAvatar(data.avatar || "🙂");
    } catch (err) {
      console.error("Erro profile:", err);

      // 🔥 fallback total
      setProfile({ role: "user" });
      setAvatar("🙂");
    }
  };

  // 🔐 LOGIN
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  // 🌐 GOOGLE
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // 🎨 AVATAR
  const changeAvatar = async (emoji) => {
    try {
      setAvatar(emoji);

      if (!user) return;

      await supabase
        .from("profiles")
        .update({ avatar: emoji })
        .eq("id", user.id);
    } catch (err) {
      console.error("Erro avatar:", err);
    }
  };

  // 🔥 PEDIR ADMIN
  const requestAdmin = async () => {
    try {
      if (!user) return false;

      const { error } = await supabase.from("admin_requests").insert([
        {
          user_id: user.id,
          status: "pending",
        },
      ]);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error("Erro request:", err);
      return false;
    }
  };

  // 🔄 REFRESH PROFILE
  const refreshProfile = async () => {
    if (!user) return;
    loadProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        avatar,
        loading,
        login,
        loginWithGoogle,
        logout,
        changeAvatar,
        requestAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🔥 HOOK
export function useAuth() {
  return useContext(AuthContext);
}
