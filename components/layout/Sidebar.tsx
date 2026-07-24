"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  Users,
  IndianRupee,
  WalletCards,
  CalendarCheck,
  PhoneCall,
  CalendarDays,
  BarChart3,
  Settings,
  PartyPopper,
} from "lucide-react";



const menu = [

  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },


  {
    name: "Students",
    href: "/students",
    icon: Users,
  },


  {
    name: "Payments",
    href: "/payments",
    icon: IndianRupee,
  },


  {
    name: "Fees",
    href: "/fees",
    icon: WalletCards,
  },


  {
    name: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
  },


  {
    name: "Enquiries",
    href: "/enquiries",
    icon: PhoneCall,
  },


  {
    name: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
  },


  {
    name: "Events",
    href: "/events",
    icon: PartyPopper,
  },


  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },


  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },

];







export default function Sidebar() {


return (

<aside

className="
fixed
left-0
top-0
h-screen
w-72
bg-slate-900
p-6
text-white
shadow-xl
"

>



<div className="mb-10">


<h1 className="text-2xl font-bold">

Footloose Alley

</h1>



<p className="text-sm text-slate-400">

Studio Manager

</p>


</div>









<nav className="space-y-2">


{

menu.map((item)=>{


const Icon =
item.icon;



return (

<Link

key={item.name}

href={item.href}

className="
flex
items-center
gap-3
rounded-xl
px-4
py-3
text-slate-200
transition
hover:bg-purple-600
hover:text-white
"

>


<Icon size={20}/>


<span>

{item.name}

</span>


</Link>


);


})


}



</nav>





</aside>


);


}