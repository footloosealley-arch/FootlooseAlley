import { supabase } from "@/lib/supabase";
import { Enquiry } from "@/types/enquiry";



export async function getEnquiries(): Promise<Enquiry[]> {

  const { data, error } = await supabase

    .from("Enquiries")

    .select("*")

    .order(
      "created_at",
      {
        ascending: false,
      }
    );


  if (error) throw error;


  return (data as Enquiry[]) ?? [];

}





export async function addEnquiry(
  enquiry: Omit<Enquiry, "id" | "created_at">
) {

  const { error } = await supabase

    .from("Enquiries")

    .insert([
      enquiry
    ]);


  if (error) throw error;

}





export async function updateEnquiry(
  id:number,
  enquiry:Partial<Enquiry>
) {


  const { error } = await supabase

    .from("Enquiries")

    .update(enquiry)

    .eq(
      "id",
      id
    );


  if(error) throw error;


}





export async function deleteEnquiry(
  id:number
) {


  const { error } = await supabase

    .from("Enquiries")

    .delete()

    .eq(
      "id",
      id
    );


  if(error) throw error;


}






export async function markEnquiryJoined(
  id:number
) {


  const { error } = await supabase

    .from("Enquiries")

    .update({
      Status:"Joined",
    })

    .eq(
      "id",
      id
    );


  if(error) throw error;


}







// Convert Enquiry into Student

export async function convertEnquiryToStudent(
  enquiry:Enquiry
) {


  // 1. Create Student

  const { error:studentError } = await supabase

    .from("Students")

    .insert([

      {

        Name:
          enquiry.Name,


        Phone:
          enquiry.Phone,


        Email:
          enquiry.Email ?? "",


        Program:
          enquiry.Program ?? "",


        Status:
          "Active",


        join_date:
          new Date()
            .toISOString()
            .split("T")[0],

      }

    ]);



  if(studentError){

    throw studentError;

  }







  // 2. Update enquiry status

  const { error:updateError } = await supabase

    .from("Enquiries")

    .update({

      Status:"Joined"

    })

    .eq(

      "id",

      enquiry.id

    );





  if(updateError){

    throw updateError;

  }


}