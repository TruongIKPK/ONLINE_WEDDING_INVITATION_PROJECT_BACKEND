import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import UserRepository from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async function (accessToken, refreshToken, profile, done) {
  try {
    // Lấy thông tin từ Google profile
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const full_name = profile.displayName;
    const avatar_url = profile.photos?.[0]?.value;

    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }

    // Tìm user theo email
    let user = await userRepository.findByEmail(email);

    if (user) {
      // User đã tồn tại, cập nhật avatar nếu cần
      if (!user.avatar_url && avatar_url) {
        await userRepository.updateProfile(user.id_user, { avatar_url });
        user.avatar_url = avatar_url;
      }
      return done(null, user);
    }

    // Tạo user mới
    const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 8);
    
    const userData = {
      id_user: uuidv4(),
      email,
      username,
      full_name: full_name || '',
      avatar_url: avatar_url || '',
      phone: '',
      password: null, // OAuth users don't have password
      created_at: new Date()
    };

    const newUser = await userRepository.create(userData);
    return done(null, newUser);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session (không cần thiết cho JWT, nhưng passport yêu cầu)
passport.serializeUser((user, done) => {
  done(null, user.id_user);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepository.getById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
