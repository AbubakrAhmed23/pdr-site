"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  loginAction,
  registerAction,
  type AuthActionState,
} from "@/app/[locale]/(auth)/actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    action.bind(null, locale),
    null,
  );

  const errorMessage = state?.error
    ? t(
        `error${state.error.charAt(0).toUpperCase()}${state.error.slice(1)}` as
          | "errorInvalid"
          | "errorExists"
          | "errorValidation"
          | "errorUnknown",
      )
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "login" ? t("loginTitle") : t("registerTitle")}</CardTitle>
        <CardDescription>
          {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {mode === "register" && (
              <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
            )}
          </div>

          {errorMessage && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {mode === "login" ? t("loginButton") : t("registerButton")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
          <Link
            href={mode === "login" ? "/register" : "/login"}
            className="font-medium text-primary hover:underline"
          >
            {mode === "login" ? t("goRegister") : t("goLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
