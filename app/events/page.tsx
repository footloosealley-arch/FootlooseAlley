"use client";

import { useState } from "react";
import { CalendarDays, MapPin, IndianRupee } from "lucide-react";


type Event = {
  id: number;
  name: string;
  date: string;
  location: string;
  fee: number;
  status: string;
};


export default function EventsPage() {


  const [events] = useState<Event[]>([
    {
      id: 1,
      name: "Zumba Jam",
      date: "28 March 2026",
      location: "Swimmers Academy",
      fee: 799,
      status: "Upcoming",
    },

    {
      id: 2,
      name: "Retro Party",
      date: "25 April 2026",
      location: "Footloose Alley Studio",
      fee: 0,
      status: "Upcoming",
    },
  ]);



  return (

    <main className="space-y-8">


      <div
        className="
        rounded-3xl
        bg-gradient-to-r
        from-purple-600
        to-pink-500
        p-8
        text-white
        shadow-xl
        "
      >

        <h1 className="text-4xl font-bold">
          Events Management
        </h1>


        <p className="mt-2 text-white/90">
          Manage workshops, parties and special studio events.
        </p>


      </div>



      <button
        className="
        rounded-xl
        bg-purple-600
        px-6
        py-3
        font-semibold
        text-white
        shadow
        hover:bg-purple-700
        "
      >
        + Add New Event
      </button>



      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">


        {events.map((event) => (

          <div
            key={event.id}
            className="
            rounded-2xl
            bg-white
            p-6
            shadow
            "
          >

            <h2 className="text-xl font-bold">
              {event.name}
            </h2>


            <div className="mt-4 space-y-3 text-slate-600">


              <p className="flex gap-2">
                <CalendarDays size={18}/>
                {event.date}
              </p>


              <p className="flex gap-2">
                <MapPin size={18}/>
                {event.location}
              </p>


              <p className="flex gap-2">
                <IndianRupee size={18}/>
                {event.fee}
              </p>


            </div>


            <span
              className="
              mt-5
              inline-block
              rounded-full
              bg-green-100
              px-4
              py-1
              text-sm
              font-semibold
              text-green-700
              "
            >
              {event.status}
            </span>


          </div>

        ))}


      </div>


    </main>

  );
}