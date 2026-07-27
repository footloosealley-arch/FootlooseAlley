import { ReactNode } from "react";


type Props = {

  title:string;

  value:string | number;

  icon:ReactNode;

};




export default function StatCard({

  title,

  value,

  icon,

}:Props){



return (

<div className="
rounded-2xl
bg-white
p-6
shadow-lg
transition
hover:shadow-xl
">


<div className="
mb-4
flex
h-12
w-12
items-center
justify-center
rounded-xl
bg-indigo-100
text-indigo-600
">

{icon}

</div>




<p className="
text-sm
font-medium
text-slate-500
">

{title}

</p>




<h2 className="
mt-2
text-3xl
font-bold
text-slate-800
">

{value}

</h2>



</div>

);


}