"use server";
import { auth } from "@/lib/better-auth/auth";
import { inngest } from "../inngest/client";
import { headers } from "next/headers";
export const signUpWithEmail = async ({
    fullName,
    email,
    password,
    country,
    investmentGoals,
    riskTolerance,
    preferredIndustry,
}: SignUpFormData) => {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: fullName,
      },
    });

    if (response) {
        await inngest.send({
            name: "app/user.created",
            data: {
                email: email,
                name: fullName,
                country,
                investmentGoals,
                riskTolerance,
                preferredIndustry,

            }
        })
    }

    return {
        success: true,
        data: response,
    }
  } catch (error) {
    console.log("Error signing up with email: ", error);
    return {
      success: false,
      error: "Error signing up with email",
    };
  }
};


export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers()
    });
  } catch (error) {
    console.log("Error signing out: ", error);  
  return {
      success: false,
      error: "Error signing out",
    };
  }
}

export const signInWithEmail = async (
  { email, password }: SignInFormData
) => {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email: email,
        password: password,
      }
    })

   
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.log("Error signing in with email: ", error);
    return {
      success: false,
      error: "Error signing in with email",
    };
  }
}