"use client";

import {
  IndianRupee,
  Wallet,
  Clock3,
  AlertTriangle,
} from "lucide-react";



type Props = {

  totalCollected:number;

  totalPending:number;

  dueSoonCount:number;

  overdueCount:number;

};





export default function FeeSummaryCards({

totalCollected,

totalPending,

dueSoonCount,

overdueCount,

}:Props){



return (

<div className="
grid
gap-6
md:grid-cols-4
">






<div className="
rounded-3xl
bg-white
p-6
shadow-lg
">


<div className="
flex
items-center
gap-3
">


<div className="
rounded-2xl
bg-green-100
p-3
text-green-600
">

<IndianRupee/>

</div>


<div>

<p className="
text-sm
text-slate-500
">

Collected

</p>


<h2 className="
text-2xl
font-bold
">

₹{totalCollected.toLocaleString()}

</h2>


</div>


</div>


</div>









<div className="
rounded-3xl
bg-white
p-6
shadow-lg
">


<div className="
flex
items-center
gap-3
">


<div className="
rounded-2xl
bg-red-100
p-3
text-red-600
">

<Wallet/>

</div>


<div>

<p className="
text-sm
text-slate-500
">

Pending Fees

</p>


<h2 className="
text-2xl
font-bold
">

₹{totalPending.toLocaleString()}

</h2>


</div>


</div>


</div>









<div className="
rounded-3xl
bg-white
p-6
shadow-lg
">


<div className="
flex
items-center
gap-3
">


<div className="
rounded-2xl
bg-yellow-100
p-3
text-yellow-600
">

<Clock3/>

</div>


<div>

<p className="
text-sm
text-slate-500
">

Due Soon

</p>


<h2 className="
text-2xl
font-bold
">

{dueSoonCount}

</h2>


</div>


</div>


</div>









<div className="
rounded-3xl
bg-white
p-6
shadow-lg
">


<div className="
flex
items-center
gap-3
">


<div className="
rounded-2xl
bg-red-100
p-3
text-red-600
">

<AlertTriangle/>

</div>


<div>

<p className="
text-sm
text-slate-500
">

Overdue

</p>


<h2 className="
text-2xl
font-bold
">

{overdueCount}

</h2>


</div>


</div>


</div>





</div>

);


}