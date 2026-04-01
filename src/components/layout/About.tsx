import React from 'react';
import { BookOpen, Users, Award, Target, Clock, Shield } from 'lucide-react';

export default function AboutSkill() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">About SkillBridge</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Connecting passionate learners with expert tutors to bridge the gap between aspiration and achievement.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              SkillBridge was created with a simple yet powerful vision: to make quality education accessible to everyone, anywhere. We believe that learning should be personalized, flexible, and inspiring.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              By connecting students with expert tutors across diverse subjects, we arre building a community where knowledge flows freely and every learner can reach their full potential.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Target className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Personalized Learning</h3>
                  <p className="text-gray-600">One-on-one sessions tailored to your unique learning style</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Flexible Scheduling</h3>
                  <p className="text-gray-600">Learn at your own pace, on your own schedule</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verified Experts</h3>
                  <p className="text-gray-600">Learn from qualified tutors with proven track records</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How SkillBridge Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse Tutors</h3>
              <p className="text-gray-600">
                Search our diverse pool of expert tutors by subject, rating, price, and availability. Read reviews from other students to find your perfect match.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Book a Session</h3>
              <p className="text-gray-600">
                Select a convenient time slot and book your session instantly. Get immediate confirmation and prepare for your learning journey.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Learning</h3>
              <p className="text-gray-600">
                Attend your personalized session, master new skills, and leave a review to help other learners find great tutors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Tutors Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">For Expert Tutors</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl">
            Share your knowledge, build your reputation, and earn income on your own schedule. SkillBridge provides the platform, you provide the expertise.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Manage Your Schedule</h4>
                <p className="text-blue-100 text-sm">Set your availability and teach when it works for you</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Build Your Profile</h4>
                <p className="text-blue-100 text-sm">Showcase your expertise and earn student reviews</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Track Your Sessions</h4>
                <p className="text-blue-100 text-sm">View all your bookings and teaching history in one place</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Set Your Rates</h4>
                <p className="text-blue-100 text-sm">You control your pricing and terms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse Subjects</h3>
              <p className="text-gray-600">
                From mathematics to music, coding to cooking - find tutors for any subject you want to master.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Read authentic reviews and ratings from real students to make informed decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Our platform is monitored by admins to ensure a safe, quality learning environment for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students and tutors already using SkillBridge to achieve their educational goals.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Get Started
            </a>
            <a href="/findTutor" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition">
              Browse Tutors
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}