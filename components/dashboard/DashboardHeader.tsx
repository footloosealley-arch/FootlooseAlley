export default function DashboardHeader() {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  return (
    <div className="mb-8">
      <p className="text-gray-500 text-lg">
        {greeting},
      </p>

      <h1 className="text-4xl font-bold text-gray-900 mt-2">
        Footloose Alley Studio Manager
      </h1>

      <p className="mt-3 text-gray-500">
        Welcome back! Here's what's happening at your studio today.
      </p>
    </div>
  );
}