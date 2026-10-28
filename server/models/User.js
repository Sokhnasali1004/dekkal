const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasse: { type: String, required: true, minlength: 6 },
    ville: { type: String, default: '' },
    telephone: { type: String, default: '' },
    role: { type: String, enum: ['acheteur', 'vendeur', 'admin'], default: 'acheteur' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

userSchema.methods.verifierMotDePasse = function (motDePasseTape) {
  return bcrypt.compare(motDePasseTape, this.motDePasse);
};

userSchema.methods.toSafeObject = function () {
  const { _id, nom, email, ville, telephone, role, avatar, createdAt } = this;
  return { id: _id, nom, email, ville, telephone, role, avatar, createdAt };
};

module.exports = mongoose.model('User', userSchema);
