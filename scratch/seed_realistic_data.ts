import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const firstNames = ["Arjun", "Aditi", "Rahul", "Priya", "Vikram", "Sneha", "Amit", "Anjali", "Varun", "Isha", "Karan", "Meera"];
const lastNames = ["Sharma", "Verma", "Iyer", "Patel", "Singh", "Gupta", "Das", "Reddy", "Nair", "Prabhu"];
const expertiseList = ["Anxiety & Stress", "Loneliness & Isolation", "Academic Pressure", "Relationship Issues", "Identity & Self-Worth"];
const languagesList = ["English", "Hindi", "Tamil", "Bengali", "Hinglish"];
const ngoNames = ["Heart of India", "SafeSpace Foundation", "Student Resilience Hub", "Mental Health Collective"];

function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements(arr: any[], min: number, max: number) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

async function seed() {
  console.log("🚀 Starting Realistic Seeding Process...");

  // 1. Seed NGOs
  console.log("🏢 Seeding NGOs...");
  const ngos = ngoNames.map(name => ({
    id: crypto.randomUUID(),
    name: name,
    category: "Mental Health",
    contact_email: `contact@${name.toLowerCase().replace(/\s/g, '')}.org`,
    is_verified: true,
  }));
  await supabase.from('ngos').upsert(ngos);

  // 2. Seed Volunteers
  console.log("👥 Seeding Volunteers...");
  const volunteers = [];
  for (let i = 0; i < 15; i++) {
    const name = `${getRandom(firstNames)} ${getRandom(lastNames)}`;
    volunteers.push({
      id: crypto.randomUUID(),
      name: name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@gmail.com`,
      expertise: getRandomElements(expertiseList, 1, 3),
      languages: getRandomElements(languagesList, 1, 2),
      verification_status: i < 10 ? "verified" : "pending",
      is_verified: i < 10,
      is_active: i < 10,
    });
  }
  await supabase.from('volunteers').upsert(volunteers);

  // 3. Seed Student Profiles
  console.log("🎓 Seeding Student Profiles...");
  const students = [];
  for (let i = 0; i < 50; i++) {
    students.push({
      alias_id: crypto.randomUUID(),
      anonymous_username: `SoulSync_${Math.floor(Math.random() * 9000) + 1000}`,
    });
  }
  await supabase.from('student_profiles').upsert(students);

  // 4. Seed Time Slots
  console.log("⏰ Seeding Time Slots...");
  const verifiedVolIds = volunteers.filter(v => v.is_verified).map(v => v.id);
  const slots = [];
  for (const volId of verifiedVolIds) {
    for (let j = 0; j < 5; j++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Mix of past and future
      slots.push({
        id: crypto.randomUUID(),
        volunteer_id: volId,
        slot_date: date.toISOString().split('T')[0],
        start_time: "10:00:00",
        end_time: "11:00:00",
        is_booked: true,
      });
    }
  }
  await supabase.from('time_slots').upsert(slots);

  // 5. Seed Donations
  console.log("💰 Seeding Donations...");
  const donations = [];
  for (let i = 0; i < 30; i++) {
    donations.push({
      amount: Math.floor(Math.random() * 1500) + 100,
      status: "completed",
      ngo_id: getRandom(ngos).id,
      donor_alias_id: getRandom(students).alias_id,
    });
  }
  await supabase.from('donations').upsert(donations);

  // 6. Seed Session Bookings
  console.log("📅 Seeding Session Bookings...");
  const bookings = [];
  for (const slot of slots) {
    const mBefore = Math.floor(Math.random() * 4) + 1;
    const mAfter = Math.floor(Math.random() * 4) + 7;
    bookings.push({
      id: crypto.randomUUID(),
      time_slot_id: slot.id,
      volunteer_id: slot.volunteer_id,
      student_alias_id: getRandom(students).alias_id,
      anonymous_name: `User_${Math.floor(Math.random() * 999)}`,
      issue_type: getRandom(expertiseList),
      status: "completed",
      mood_before: mBefore.toString(),
      mood_after: mAfter.toString(),
      volunteer_notes: "Session completed. Significant mood improvement observed.",
    });
  }
  await supabase.from('session_bookings').upsert(bookings);

  console.log("✅ Seeding Completed Successfully!");
}

seed();
