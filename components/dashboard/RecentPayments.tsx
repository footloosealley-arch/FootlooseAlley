type Props={
payments:any[];
};


export default function RecentPayments({
payments,
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
">

Recent Payments

</h2>




<div className="space-y-4">


{
payments.map(payment=>(

<div
key={payment.id}
className="
flex
justify-between
border-b
pb-3
"
>


<div>

<p className="font-semibold">

₹{payment.amount}

</p>

<p className="text-sm text-slate-500">

{payment.payment_method}

</p>

</div>



<p className="text-sm text-slate-500">

{payment.payment_date}

</p>



</div>


))

}


</div>


</div>

);

}