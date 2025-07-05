passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, function (accessToken, refreshToken, profile, done) {
  // xử lý dữ liệu profile tại đây
}));
