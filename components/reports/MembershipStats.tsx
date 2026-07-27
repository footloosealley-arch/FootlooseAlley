"use client";

import type { MembershipStat } from "@/lib/reports";



type Props = {

  data: MembershipStat[];

};





export default function MembershipStats({

data,

}:Props){



return (

<div className="
rounded-2xl
bg-white
p-6
shadow
">



<h2 className="
mb-5
text-xl
font-bold
text-slate-800
">

💳 Membership Plans

</h2>






{

data.length===0

?

<p className="
text-slate-500
">

No membership data available.

</p>


:

<div className="
space-y-4
">


{

data

.sort(

(a,b)=>

b.count-a.count

)

.map(item=>(



<div

key={item.plan}

className="
flex
items-center
justify-between
rounded-xl
bg-slate-50
p-4
"

>


<span className="
font-semibold
text-slate-700
">

{item.plan}

</span>




<span className="
rounded-full
bg-green-100
px-4
py-1
font-bold
text-green-700
">

{item.count}

</span>



</div>



))


}



</div>


}





</div>

);


}