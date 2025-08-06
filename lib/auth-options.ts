import { NextAuthOptions, Session } from "next-auth";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { emailSchema, passwordSchema } from "@/schema/credentials-schema";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import prisma from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      // async authorize(credentials) {
      //   if (!credentials || !credentials.email || !credentials.password) {
      //     return null;
      //   }

      //   const emailValidation = emailSchema.safeParse(credentials.email);

      //   if (!emailValidation.success) {
      //     throw new Error("Invalid email");
      //   }

      //   const passwordValidation = passwordSchema.safeParse(
      //     credentials.password
      //   );

      //   if (!passwordValidation.success) {
      //     throw new Error(passwordValidation.error.issues[0].message);
      //   }

      //   try {
      //     const user = await prisma.user.findUnique({
      //       where: {
      //         email: emailValidation.data,
      //       },
      //     });

      //     if (!user) {
      //       const hashedPassword = await bcrypt.hash(
      //         passwordValidation.data,
      //         10
      //       );

      //       const newUser = await prisma.user.create({
      //         data: {
      //           email: emailValidation.data,
      //           password: hashedPassword,
      //           provider: "Credentials",
      //         },
      //       });

      //       return newUser;
      //     }

      //     if (!user.password) {
      //       const hashedPassword = await bcrypt.hash(
      //         passwordValidation.data,
      //         10
      //       );

      //       const authUser = await prisma.user.update({
      //         where: {
      //           email: emailValidation.data,
      //         },
      //         data: {
      //           password: hashedPassword,
      //         },
      //       });
      //       return authUser;
      //     }

      //     const passwordVerification = await bcrypt.compare(
      //       passwordValidation.data,
      //       user.password
      //     );

      //     if (!passwordVerification) {
      //       throw new Error("Invalid password");
      //     }

      //     return user;
      //   } catch (error) {
      //     if (error instanceof PrismaClientInitializationError) {
      //       throw new Error("Internal server error");
      //     }
      //     console.log(error);
      //     throw error;
      //   }
      // },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          console.log("Missing credentials");
          return null;
        }

        const emailValidation = emailSchema.safeParse(credentials.email);
        if (!emailValidation.success) {
          console.log("Invalid email:", credentials.email);
          throw new Error("Invalid email");
        }

        const passwordValidation = passwordSchema.safeParse(
          credentials.password
        );
        if (!passwordValidation.success) {
          console.log("Invalid password format");
          throw new Error(passwordValidation.error.issues[0].message);
        }

        try {
          console.log("Searching for user:", emailValidation.data);
          const user = await prisma.user.findUnique({
            where: {
              email: emailValidation.data,
            },
          });

          if (!user) {
            console.log("No user found, creating new one");
            const hashedPassword = await bcrypt.hash(
              passwordValidation.data,
              10
            );
            const newUser = await prisma.user.create({
              data: {
                email: emailValidation.data,
                password: hashedPassword,
                provider: "Credentials",
              },
            });

            return newUser;
          }

          if (!user.password) {
            console.log("User exists but has no password, updating...");
            const hashedPassword = await bcrypt.hash(
              passwordValidation.data,
              10
            );
            const authUser = await prisma.user.update({
              where: {
                email: emailValidation.data,
              },
              data: {
                password: hashedPassword,
              },
            });
            return authUser;
          }

          console.log("Verifying password...");
          const passwordVerification = await bcrypt.compare(
            passwordValidation.data,
            user.password
          );

          if (!passwordVerification) {
            console.log("Password verification failed");
            throw new Error("Invalid password");
          }

          console.log("Credentials login successful");
          return user;
        } catch (error) {
          console.log("Error in authorize:", error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email as string;
        token.id = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: token.email ?? "",
          },
        });

        if (user) {
          session.user.id = user.id;
        }
      } catch (error) {
        if (error instanceof PrismaClientInitializationError) {
          throw new Error("Internal server error");
        }
        console.log(error);
        throw error;
      }
      return session;
    },
    // async signIn({ account, profile }) {
    //   try {
    //     if (account?.provider === "google") {
    //       if (!profile?.email) {
    //         console.error("No email found in Google profile");
    //         return false;
    //       }

    //       const user = await prisma.user.findUnique({
    //         where: {
    //           email: profile.email,
    //         },
    //       });

    //       if (!user) {
    //         await prisma.user.create({
    //           data: {
    //             email: profile.email,
    //             provider: "Google",
    //           },
    //         });
    //       }
    //     }

    //     return true;
    //   } catch (error) {
    //     console.log(error);
    //     return false;
    //   }
    // },
    // signIn callback (for Google login)
    async signIn({ account, profile }) {
      try {
        console.log("signIn callback hit");

        if (account?.provider === "google") {
          console.log("Google login with email:", profile?.email);

          if (!profile?.email) {
            console.error("Google profile has no email");
            return false;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: profile.email,
            },
          });

          if (!user) {
            console.log("Google user not found, creating...");
            await prisma.user.create({
              data: {
                email: profile.email,
                provider: "Google",
              },
            });
          } else {
            console.log("Google user already exists");
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
} satisfies NextAuthOptions;
