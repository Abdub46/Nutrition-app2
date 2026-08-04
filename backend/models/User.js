const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const frequencyEnum = [
  'Once per week',
  'Twice per week',
  'Three times per week',
  'Almost every day',
  'Every day',
];

// Client-specific fields (nutrition profile) are only required for the 'client' role -
// writers and admins are staff accounts and don't need this health data.
const requiredIfClient = function () {
  return this.role === 'client';
};

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, required: requiredIfClient, trim: true },
    dateOfBirth: { type: Date, required: requiredIfClient },
    sex: { type: String, enum: ['Male', 'Female'], required: requiredIfClient },
    occupation: { type: String, required: requiredIfClient, trim: true },
    country: { type: String, default: 'Kenya' },
    county: { type: String, required: requiredIfClient, trim: true },
    residenceTown: { type: String, required: requiredIfClient, trim: true },
    avatar: { type: String, default: '' }, // Cloudinary secure_url, used for article author display
    bio: { type: String, default: '', maxlength: 500 }, // optional author bio, shown on articles

    // Body Measurements (current/latest snapshot; history lives in BmiRecord)
    height: { type: Number, required: requiredIfClient }, // cm
    weight: { type: Number, required: requiredIfClient }, // kg

    // Medical History
    hasCurrentMedicalCondition: { type: Boolean, default: false },
    currentMedicalConditionDetails: { type: String, default: '' },
    hasFamilyMedicalHistory: { type: Boolean, default: false },
    familyMedicalHistoryDetails: { type: String, default: '' },

    // Dietary Habits
    balancedDietFrequency: { type: String, enum: frequencyEnum, required: requiredIfClient },
    fruitVegFrequency: { type: String, enum: frequencyEnum, required: requiredIfClient },
    fastFoodFrequency: { type: String, enum: frequencyEnum, required: requiredIfClient },
    mealsPerDay: { type: String, enum: ['One', 'Two', 'Three', 'Four', 'Five'], required: requiredIfClient },

    // Lifestyle
    physicalActivity: { type: Boolean, default: false },
    drugUse: { type: Boolean, default: false },
    drugUseDetails: { type: String, default: '' },

    // Role-based access control
    role: { type: String, enum: ['client', 'admin', 'writer'], default: 'client' },

    // Professional qualification - required once an account becomes a writer,
    // since only nutritionists/dietitians are allowed to author articles
    qualification: {
      type: String,
      enum: ['Nutritionist', 'Dietitian'],
      required: function () {
        return this.role === 'writer';
      },
    },

    // Writer/staff account lifecycle
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }, // soft delete - preserves article authorship integrity
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // audit: which admin created this account

    passwordChangedAt: { type: Date, default: null },
    lastLogin: { type: Date, default: null },

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Covers the common admin-facing queries: listing clients (role: 'client'),
// listing active writers (role: 'writer', isDeleted: false), and the analytics
// aggregations that $match on role + createdAt. email already has its own
// unique index from `unique: true` above, so it isn't repeated here.
userSchema.index({ role: 1, isDeleted: 1, createdAt: -1 });

// Virtual: current age computed from DOB (only meaningful for client accounts)
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const birthDate = new Date(this.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
});

// Virtual: current BMI computed from stored height/weight (only meaningful for client accounts)
userSchema.virtual('bmi').get(function () {
  if (!this.height || !this.weight) return null;
  const heightM = this.height / 100;
  return Math.round((this.weight / (heightM * heightM)) * 10) / 10;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
