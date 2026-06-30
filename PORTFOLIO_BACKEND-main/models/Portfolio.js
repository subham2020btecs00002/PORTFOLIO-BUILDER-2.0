const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  projects: [
    {
      title: String,
      description: String,
      link: String,
    },
  ],
  education: [
    {
      collegeName: String,
      degree: String,
      branch: String,
      cgpaOrPercentage: Number,
      yearOfJoining : Date,
      yearOfPassing: Date,
    },
  ],
  professionalHistory: [
    {
      companyName: String,
      position: String,
      responsibility : String ,
      yearOfJoining : Date,
      yearOfLeaving : Date,
      isCurrentEmployee: Boolean,
    },
  ],
  portfolioLinks: {
    github:  String ,
    leetcode:  String ,
    gfg: String ,
  },
  pdf: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
