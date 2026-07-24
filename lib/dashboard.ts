import { supabase } from "@/lib/supabase";


export async function getDashboardStats() {


  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const currentDate =
    new Date();


  const currentMonth =
    currentDate.getMonth();


  const currentYear =
    currentDate.getFullYear();




  // =====================
  // STUDENTS
  // =====================


  const {
    data: students,
    error: studentError,
  } =
    await supabase
      .from("Students")
      .select(
        `
        id,
        Name,
        Status,
        Fees,
        Fees_due,
        created_at,
        date_of_birth
        `
      );


  if(studentError)
    throw studentError;



  const totalStudents =
    students?.length ?? 0;



  const activeStudents =
    students?.filter(
      student =>
        student.Status === "Active"
    )
    .length ?? 0;



  const pendingFees =
    students?.reduce(
      (total,student)=>

        total +
        Number(
          student.Fees_due ?? 0
        ),

      0
    )
    ?? 0;



  const recentStudents =
    students
      ?.sort(
        (a,b)=>

          new Date(
            b.created_at ?? ""
          ).getTime()

          -

          new Date(
            a.created_at ?? ""
          ).getTime()

      )
      .slice(0,5)
    ?? [];







  // =====================
  // PAYMENTS
  // =====================


  const {
    data: payments,
    error: paymentError,
  } =
    await supabase
      .from("Payments")
      .select("*")
      .order(
        "id",
        {
          ascending:false
        }
      );


  if(paymentError)
    throw paymentError;




  const todayCollection =
    payments
      ?.filter(
        payment =>
          payment.payment_date === today
      )
      .reduce(
        (total,payment)=>

          total +
          Number(
            payment.amount ?? 0
          ),

        0
      )
    ?? 0;




  const monthlyRevenue =
    payments
      ?.filter(payment=>{


        const date =
          new Date(
            payment.payment_date
          );


        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );


      })
      .reduce(
        (total,payment)=>

          total +
          Number(
            payment.amount ?? 0
          ),

        0
      )
    ?? 0;




  const recentPayments =
    payments?.slice(0,5)
    ?? [];








  // =====================
  // MEMBERSHIPS
  // =====================


  const {
    data: memberships,
    error: membershipError,
  } =
    await supabase
      .from("Memberships")
      .select("*");



  if(membershipError)
    throw membershipError;




  const expiringMemberships =
    memberships
      ?.filter(member=>{


        const expiry =
          new Date(
            member.expiry_date
          );


        const todayDate =
          new Date();



        const daysLeft =
          Math.ceil(

            (
              expiry.getTime()
              -
              todayDate.getTime()

            )
            /
            (1000*60*60*24)

          );



        return (
          daysLeft >= 0 &&
          daysLeft <= 30
        );


      })
    ?? [];








  // =====================
  // ATTENDANCE
  // =====================


  const {
    data: attendance,
    error: attendanceError,
  } =
    await supabase
      .from("Attendance")
      .select("*")
      .eq(
        "date",
        today
      );



  if(attendanceError)
    throw attendanceError;




  const todayAttendance =
    attendance?.filter(
      item =>
        item.status === "Present"
    )
    .length ?? 0;




  const todayAbsent =
    attendance?.filter(
      item =>
        item.status === "Absent"
    )
    .length ?? 0;




  const totalAttendanceMarked =
    attendance?.length ?? 0;








  // =====================
  // ENQUIRY CRM
  // =====================


  const {
    data: enquiries,
    error: enquiryError,
  } =
    await supabase
      .from("Enquiries")
      .select(
        "Status"
      );



  if(enquiryError)
    throw enquiryError;




  const totalEnquiries =
    enquiries?.length ?? 0;



  const newEnquiries =
    enquiries?.filter(
      item =>
        item.Status === "New"
    )
    .length ?? 0;



  const trialEnquiries =
    enquiries?.filter(
      item =>
        item.Status === "Trial"
    )
    .length ?? 0;



  const joinedEnquiries =
    enquiries?.filter(
      item =>
        item.Status === "Joined"
    )
    .length ?? 0;



  const followUpEnquiries =
    enquiries?.filter(
      item =>
        item.Status === "Follow Ups"
    )
    .length ?? 0;









  // =====================
  // BIRTHDAYS
  // =====================


  const upcomingBirthdays =
    students
      ?.map(student=>{


        if(!student.date_of_birth)
          return null;



        const dob =
          new Date(
            student.date_of_birth
          );


        const todayDate =
          new Date();



        let birthday =
          new Date(
            todayDate.getFullYear(),
            dob.getMonth(),
            dob.getDate()
          );



        if(birthday < todayDate){

          birthday.setFullYear(
            todayDate.getFullYear()+1
          );

        }



        const daysLeft =
          Math.ceil(

            (
              birthday.getTime()
              -
              todayDate.getTime()

            )
            /
            (1000*60*60*24)

          );



        return {

          id: student.id,

          Name: student.Name,

          date_of_birth:
            student.date_of_birth,

          daysLeft,

        };


      })

      .filter(Boolean)

      .filter(
        (student:any)=>
          student.daysLeft <= 30
      )

      .sort(
        (a:any,b:any)=>
          a.daysLeft-b.daysLeft
      )

      .filter(
        (student:any,index:number,array:any[])=>

          index ===
          array.findIndex(
            item =>
              item.Name === student.Name
          )

      )

      .slice(0,5)

    ?? [];







  return {


    totalStudents,

    activeStudents,

    pendingFees,


    todayCollection,

    monthlyRevenue,


    recentPayments,

    recentStudents,


    expiringMemberships,



    todayAttendance,

    todayAbsent,

    totalAttendanceMarked,



    totalEnquiries,

    newEnquiries,

    trialEnquiries,

    joinedEnquiries,

    followUpEnquiries,



    upcomingBirthdays,


  };


}