"use client";

export default function WelcomeCard() {
  const hour = new Date().getHours();

  let greeting = "Welcome";

  if (hour < 12) {
    greeting = "Good Morning ☀️";
  } else if (hour < 17) {
    greeting = "Good Afternoon 🌤️";
  } else {
    greeting = "Good Evening 🌙";
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-lg">
      <h1 className="text-3xl font-bold">{greeting}</h1>

      <p className="mt-2 text-lg opacity-90">
        Welcome back to <strong>Footloose Alley Studio Manager</strong>
      </p>

      <p className="mt-4 text-sm opacity-80">{today}</p>
    </div>
  );
}