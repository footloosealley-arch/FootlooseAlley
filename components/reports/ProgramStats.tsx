"use client";

import type { ProgramStat } from "@/lib/reports";



type Props = {

  data: ProgramStat[];

};





export default function ProgramStats({

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

🔥 Popular Programs

</h2>






{

data.length === 0

?

<p className="
text-slate-500
">

No program data available.

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

key={item.program}

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

{item.program}

</span>



<span className="
rounded-full
bg-purple-100
px-4
py-1
font-bold
text-purple-700
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