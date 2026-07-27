import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

// Check that environment variables loaded
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error("❌ Could not load .env.local");
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const students = [
  {
    Name: "John D'Souza",
    Phone: "9876543210",
    Email: "john@example.com",
    Program: "Zumba",
    Fees: 2500,
    Fees_due: 0,
    Status: "Active",
    Address: "Bengaluru",
    Emergency_contact: "9876500001",
    photo_url: "",
    membership_plan: "Monthly",
    join_date: "2026-07-01",
    date_of_birth: "1996-04-12",
    gender: "Male",
  },
  {
    Name: "Sarah Joseph",
    Phone: "9876543211",
    Email: "sarah@example.com",
    Program: "Dance Fitness",
    Fees: 2500,
    Fees_due: 2500,
    Status: "Active",
    Address: "Hebbal",
    Emergency_contact: "9876500002",
    photo_url: "",
    membership_plan: "Monthly",
    join_date: "2026-07-10",
    date_of_birth: "1995-08-21",
    gender: "Female",
  },
  {
    Name: "Rahul Sharma",
    Phone: "9876543212",
    Email: "rahul@example.com",
    Program: "HIIT",
    Fees: 3000,
    Fees_due: 3000,
    Status: "Active",
    Address: "Yelahanka",
    Emergency_contact: "9876500003",
    photo_url: "",
    membership_plan: "Quarterly",
    join_date: "2026-06-20",
    date_of_birth: "1992-01-18",
    gender: "Male",
  },
  {
    Name: "Priya Nair",
    Phone: "9876543213",
    Email: "priya@example.com",
    Program: "Yoga",
    Fees: 2200,
    Fees_due: 0,
    Status: "Active",
    Address: "RT Nagar",
    Emergency_contact: "9876500004",
    photo_url: "",
    membership_plan: "Monthly",
    join_date: "2026-07-12",
    date_of_birth: "1998-10-11",
    gender: "Female",
  },
  {
    Name: "Kevin D'Costa",
    Phone: "9876543214",
    Email: "kevin@example.com",
    Program: "Strength",
    Fees: 3500,
    Fees_due: 1500,
    Status: "Active",
    Address: "Malleshwaram",
    Emergency_contact: "9876500005",
    photo_url: "",
    membership_plan: "Half-Yearly",
    join_date: "2026-05-01",
    date_of_birth: "1991-12-02",
    gender: "Male",
  },
  {
    Name: "Ananya Rao",
    Phone: "9876543215",
    Email: "ananya@example.com",
    Program: "Kids Dance",
    Fees: 1800,
    Fees_due: 1800,
    Status: "Active",
    Address: "Jayanagar",
    Emergency_contact: "9876500006",
    photo_url: "",
    membership_plan: "Monthly",
    join_date: "2026-07-18",
    date_of_birth: "2016-05-14",
    gender: "Female",
  },
  {
    Name: "Rohan Patel",
    Phone: "9876543216",
    Email: "rohan@example.com",
    Program: "Dance Fitness",
    Fees: 2500,
    Fees_due: 0,
    Status: "Active",
    Address: "Indiranagar",
    Emergency_contact: "9876500007",
    photo_url: "",
    membership_plan: "Yearly",
    join_date: "2026-01-10",
    date_of_birth: "1990-07-19",
    gender: "Male",
  },
  {
    Name: "Meera Iyer",
    Phone: "9876543217",
    Email: "meera@example.com",
    Program: "Yoga",
    Fees: 2200,
    Fees_due: 2200,
    Status: "Active",
    Address: "Whitefield",
    Emergency_contact: "9876500008",
    photo_url: "",
    membership_plan: "Monthly",
    join_date: "2026-07-15",
    date_of_birth: "1997-03-08",
    gender: "Female",
  },
  {
    Name: "Arjun Singh",
    Phone: "9876543218",
    Email: "arjun@example.com",
    Program: "Zumba",
    Fees: 2500,
    Fees_due: 2500,
    Status: "Active",
    Address: "Rajajinagar",
    Emergency_contact: "9876500009",
    photo_url: "",
    membership_plan: "Monthly",
    join_date: "2026-07-20",
    date_of_birth: "1994-09-25",
    gender: "Male",
  },
  {
    Name: "Sneha Kapoor",
    Phone: "9876543219",
    Email: "sneha@example.com",
    Program: "Strength",
    Fees: 3500,
    Fees_due: 3500,
    Status: "Active",
    Address: "HSR Layout",
    Emergency_contact: "9876500010",
    photo_url: "",
    membership_plan: "Quarterly",
    join_date: "2026-06-05",
    date_of_birth: "1993-11-06",
    gender: "Female",
  },
];

async function seedStudents() {
  console.log("🌱 Seeding students...");

  const { data, error } = await supabase
    .from("Students")
    .insert(students)
    .select();

  if (error) {
    console.error("❌", error);
    return;
  }

  console.log(`✅ Inserted ${data.length} students.`);
}

seedStudents();