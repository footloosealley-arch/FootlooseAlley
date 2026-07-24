export default function TodaysClasses() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">

      <h2 className="mb-5 text-2xl font-bold">
        Today's Classes
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between rounded-lg bg-slate-100 p-4">
          <span>Zumba</span>
          <span>11:15 AM</span>
        </div>

        <div className="flex justify-between rounded-lg bg-slate-100 p-4">
          <span>Zumba</span>
          <span>4:15 PM</span>
        </div>

        <div className="flex justify-between rounded-lg bg-slate-100 p-4">
          <span>Dance Fitness</span>
          <span>6:00 PM</span>
        </div>

      </div>
    </div>
  );
}