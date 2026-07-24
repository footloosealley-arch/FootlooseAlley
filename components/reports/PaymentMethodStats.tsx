"use client";

import type { PaymentMethodStat } from "@/lib/reports";



type Props = {

  data: PaymentMethodStat[];

};





export default function PaymentMethodStats({

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

💰 Collection Methods

</h2>







{

data.length===0

?

<p className="
text-slate-500
">

No payment data available.

</p>


:

<div className="
space-y-4
">


{

data

.sort(

(a,b)=>

b.amount-a.amount

)

.map(item=>(


<div

key={item.method}

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

{item.method}

</span>





<span className="
rounded-full
bg-blue-100
px-4
py-1
font-bold
text-blue-700
">

₹{item.amount.toLocaleString()}

</span>



</div>


))


}



</div>


}





</div>

);


}