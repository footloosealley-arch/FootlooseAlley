"use client";


type FeeStudent = {
  id: number;
  Name: string;
  Fees_due: number;
  Phone?: string;
};



type Props = {
  students: FeeStudent[];
};




function formatCurrency(amount:number) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(amount);

}





export default function FeeDueCard({
  students,
}: Props) {



  function sendReminder(student: FeeStudent) {


    if (!student.Phone) {

      alert(
        "Phone number not available"
      );

      return;

    }



    const message =
`Hi ${student.Name},

This is a reminder from Footloose Alley Dance & Fitness Studio.

Your pending membership fee is ${formatCurrency(student.Fees_due)}.

Kindly complete your payment.

Thank you.`;



    const whatsappURL =
      `https://wa.me/${student.Phone}?text=${encodeURIComponent(message)}`;



    window.open(
      whatsappURL,
      "_blank"
    );


  }




  return (

    <div className="rounded-2xl bg-white p-6 shadow">


      <div className="mb-5 flex items-center justify-between">


        <h2 className="text-xl font-bold">
          💰 Fee Due Students
        </h2>


        <span className="
        rounded-full
        bg-red-100
        px-3
        py-1
        text-sm
        font-semibold
        text-red-700
        ">
          {students.length} Pending
        </span>


      </div>




      {students.length === 0 ? (


        <p className="text-slate-500">
          No pending fees.
        </p>



      ) : (


        <div className="space-y-3">


          {students.map((student)=>(


            <div

              key={student.id}

              className="
              rounded-xl
              bg-slate-50
              p-4
              "

            >


              <div className="flex items-center justify-between">


                <span className="font-semibold">
                  {student.Name}
                </span>



                <span className="font-bold text-red-600">
                  {formatCurrency(
                    student.Fees_due
                  )}
                </span>


              </div>




              <button

                onClick={() =>
                  sendReminder(student)
                }

                className="
                mt-3
                rounded-lg
                bg-green-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                hover:bg-green-700
                "

              >

                💬 WhatsApp Reminder

              </button>



            </div>


          ))}


        </div>


      )}


    </div>

  );

}