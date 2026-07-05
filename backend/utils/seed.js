const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');

// Load env vars
dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear DB
    await User.deleteMany();
    await Category.deleteMany();
    await Complaint.deleteMany();
    await Comment.deleteMany();
    await Notification.deleteMany();
    await Feedback.deleteMany();
    console.log('Database cleared.');

    // Seed Categories
    const categoriesList = [
      { name: 'Water Supply', description: 'Grievances related to leakage, shortage, or dirty water.' },
      { name: 'Sanitation & Waste', description: 'Issues about garbage accumulation, sewage blocks, or clean streets.' },
      { name: 'Infrastructure & Roads', description: 'Reports regarding potholes, broken pavements, or road works.' },
      { name: 'Electricity & Power', description: 'Power failures, high voltage fluctuations, or faulty lines.' },
      { name: 'Safety & Security', description: 'Grievances about anti-social elements, missing street lights, or patrolling.' },
      { name: 'Public Health', description: 'Vector control, disease outbreaks, or hygiene standards in local markets.' },
    ];
    const categories = await Category.insertMany(categoriesList);
    console.log('Categories seeded.');

    // Seed Users (Admin & Citizen)
    // Passwords will be encrypted via Pre-save hook
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@complaints.com',
      password: 'adminpassword',
      role: 'admin',
      phone: '+919876543210',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    });
    await adminUser.save();

    const citizenUser = new User({
      name: 'John Citizen',
      email: 'citizen@complaints.com',
      password: 'citizenpassword',
      role: 'citizen',
      phone: '+919988776655',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    });
    await citizenUser.save();
    console.log('Users seeded (admin@complaints.com & citizen@complaints.com).');

    // Seed Complaints
    const complaint1 = new Complaint({
      title: 'Major water pipeline leak in Sector 4',
      description: 'There is a massive water pipeline burst near the public park entrance in Sector 4. Thousands of gallons of clean drinking water is being wasted since morning, and it has started to flood the street.',
      category: categories[0]._id, // Water Supply
      priority: 'High',
      status: 'Under Review',
      location: 'Sector 4, Main Park Entrance, New Delhi',
      citizen: citizenUser._id,
      assignedTo: adminUser._id,
      timeline: [
        {
          status: 'Submitted',
          message: 'Grievance submitted by citizen John Citizen.',
          updatedBy: citizenUser._id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          status: 'Under Review',
          message: 'Complaint assigned to System Administrator and currently under review.',
          updatedBy: adminUser._id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      ],
    });
    await complaint1.save();

    const complaint2 = new Complaint({
      title: 'Potholes and broken roads on Broadway Road',
      description: 'The entire stretch of Broadway Road (near Metro pillar 114) is riddled with deep potholes. It is causing extreme traffic jams during peak hours and is highly risky for two-wheeler riders.',
      category: categories[2]._id, // Infrastructure & Roads
      priority: 'Critical',
      status: 'In Progress',
      location: 'Broadway Road near Metro Pillar 114',
      citizen: citizenUser._id,
      assignedTo: adminUser._id,
      timeline: [
        {
          status: 'Submitted',
          message: 'Complaint registered by citizen John Citizen.',
          updatedBy: citizenUser._id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
          status: 'Under Review',
          message: 'Complaint marked under review by admin.',
          updatedBy: adminUser._id,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'In Progress',
          message: 'Road construction crew has been dispatched to patch the potholes.',
          updatedBy: adminUser._id,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    await complaint2.save();

    const complaint3 = new Complaint({
      title: 'Faulty streetlights on 5th Avenue',
      description: 'Three streetlights in a row are completely dark on 5th Avenue. It makes walking at night unsafe for women and children.',
      category: categories[4]._id, // Safety & Security
      priority: 'Medium',
      status: 'Resolved',
      location: '5th Avenue Street No. 3',
      citizen: citizenUser._id,
      assignedTo: adminUser._id,
      resolutionNotes: 'Local electrical maintenance contractor visited the site and replaced all defective LED bulbs. All lights are now functional.',
      timeline: [
        {
          status: 'Submitted',
          message: 'Complaint registered by John Citizen.',
          updatedBy: citizenUser._id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'In Progress',
          message: 'Electrician dispatched to check street lighting panel.',
          updatedBy: adminUser._id,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'Resolved',
          message: 'Street lights fixed successfully.',
          updatedBy: adminUser._id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    await complaint3.save();

    // Seed Comments
    await Comment.insertMany([
      {
        complaint: complaint1._id,
        user: citizenUser._id,
        text: 'Please look into this soon, clean drinking water is pouring down the drain.',
      },
      {
        complaint: complaint1._id,
        user: adminUser._id,
        text: 'We have registered this with the Jal Board. Engineers are on their way.',
      },
    ]);

    // Seed Feedback for resolved complaint
    const feedback = new Feedback({
      complaint: complaint3._id,
      user: citizenUser._id,
      rating: 5,
      comments: 'Excellent service! The lighting was restored within 2 days of my complaint registration. Thank you.',
    });
    await feedback.save();

    // Seed Notifications
    await Notification.insertMany([
      {
        recipient: citizenUser._id,
        sender: adminUser._id,
        title: 'Status Updated: Pipeline Leak',
        message: 'Your complaint regarding the water pipeline leak has been updated to "Under Review".',
        complaint: complaint1._id,
        isRead: false,
      },
      {
        recipient: citizenUser._id,
        sender: adminUser._id,
        title: 'Status Updated: Faulty Streetlights',
        message: 'Your complaint regarding faulty streetlights has been marked as "Resolved". Feel free to submit your rating feedback.',
        complaint: complaint3._id,
        isRead: true,
      },
    ]);

    console.log('Mock complaints, comments, feedback and notifications seeded.');
    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error: ', error);
    process.exit(1);
  }
};

seedData();
