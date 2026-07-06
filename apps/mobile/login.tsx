import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useMobileAuth } from "@/components/mobile/mobile-auth-provider";
import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import { authApi } from "@/lib/api/auth";
import { ApiError, getUserFacingError } from "@/lib/api/errors";
import { loginSchema } from "@/lib/auth/schemas";

export default function LoginScreen() {
  const insets = usePhoneSafeAreaInsets();
  const { isAuthenticated, isHydrating, signIn } = useMobileAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  if (isHydrating || isAuthenticated) {
    return null;
  }

  async function handleLogin() {
    if (submitting) {
      return;
    }

    const credentials = {
      email: email.trim().toLowerCase(),
      password,
    };
    const parsedCredentials = loginSchema.safeParse(credentials);

    if (!parsedCredentials.success) {
      setError(parsedCredentials.error.issues[0]?.message ?? "Identifiants invalides.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await authApi.login(parsedCredentials.data);
      const displayName = response.user.displayName?.trim() || credentials.email.split("@")[0] || "Membre Aether";
      const [firstName, ...lastNameParts] = displayName.split(" ");

      signIn({
        email: response.user.email,
        firstName,
        lastName: lastNameParts.join(" "),
      });
      router.replace("/activity" as never);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.code === "INVALID_CREDENTIALS") {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      setError(getUserFacingError(caughtError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenTransition>
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>Aether Meet</Text>
            <Text style={styles.brandTagline}>Collaboration, conversations et appels securises.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Email professionnel</Text>
              <View style={styles.inputWrap}>
                <MaterialIcons color="#64748B" name="mail-outline" size={18} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="liam.dispa@skygenesisenterprise.com"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  textContentType="emailAddress"
                  value={email}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrap}>
                <MaterialIcons color="#64748B" name="lock-outline" size={18} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  style={styles.input}
                  textContentType="password"
                  value={password}
                />
              </View>
            </View>

            <Pressable onPress={handleLogin} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{submitting ? "Connexion..." : "Se connecter"}</Text>
            </Pressable>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons color="#B91C1C" name="error-outline" size={18} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable style={styles.ssoButton}>
              <MaterialIcons color="#111827" name="fingerprint" size={20} />
              <Text style={styles.ssoButtonText}>Continuer avec Aether Identity</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/register")} style={styles.switchLink}>
            <Text style={styles.switchText}>Créer un espace mobile</Text>
          </Pressable>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F6F6FB", flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20 },
  brandBlock: { alignItems: "center", gap: 8, marginBottom: 30 },
  brandName: { color: "#111827", fontSize: 34, fontWeight: "900", letterSpacing: 0 },
  brandTagline: { color: "#64748B", fontSize: 15, fontWeight: "600", lineHeight: 22, textAlign: "center" },
  formCard: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 20, borderWidth: 1, gap: 14, padding: 20 },
  fieldBlock: { gap: 7 },
  label: { color: "#111827", fontSize: 13, fontWeight: "800" },
  inputWrap: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 10, height: 48, paddingHorizontal: 13 },
  input: { color: "#111827", flex: 1, fontSize: 15, fontWeight: "600", paddingVertical: 0 },
  primaryButton: { alignItems: "center", backgroundColor: "#5B5FC7", borderRadius: 999, height: 50, justifyContent: "center", marginTop: 4 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  errorBox: { alignItems: "center", backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, padding: 12 },
  errorText: { color: "#991B1B", flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  ssoButton: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 10, height: 50, justifyContent: "center" },
  ssoButtonText: { color: "#111827", fontSize: 14, fontWeight: "800" },
  switchLink: { alignItems: "center", marginTop: 22 },
  switchText: { color: "#5B5FC7", fontSize: 14, fontWeight: "800" },
});
