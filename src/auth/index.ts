import passport from "passport";
import { Strategy as LoginStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { getUserByusername, comparePassword, getUserById } from "./models";
import config from "../config";

export const passportLoginStrategy = () => {
  passport.use(
    "login",
    new LoginStrategy(
      { usernameField: "username" },
      async (username: string, password: string, done) => {
        const message = "Invalid username or Password";
        try {
          const user = await getUserByusername(username);
          if (!user) {
            return done(false, false, { message });
          }
          const isMatch = await comparePassword(password, user.password);
          isMatch ? done(false, user) : done(false, false, { message });
        } catch (error) {
          console.log("error>>>>>>>", error);
          throw error;
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (user: any, done) => {
    done(false, user);
  });
};

export const passportJwtStrategy = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SESSION_SECRET
  };
  passport.use(
    "jwt",
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
        const user = await getUserById(jwtPayload.id);
        return done(false, user);
      } catch (error) {
        done(error, false);
      }
    })
  );
};
