import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const allowedOrigins = ["footloose-alley.vercel.app", "localhost", "127.0.0.1"];
const allowed = (origin: string | null) => { if (!origin) return false; try { const host = new URL(origin).hostname; return allowedOrigins.includes(host) || (host.startsWith("footloose-alley-") && host.endsWith(".vercel.app")); } catch { return false; } };
function reply(status: number, body: Record<string, unknown>, origin: string | null) { return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin ?? "https://footloose-alley.vercel.app", "Access-Control-Allow-Headers": "content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Cache-Control": "no-store", Vary: "Origin" } }); }
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const id = (value: unknown) => { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; };
const days: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
function datesFor(day: string) { const target = days[day]; if (target === undefined) return []; const result: string[] = []; const cursor = new Date(); cursor.setHours(12, 0, 0, 0); const add = (target - cursor.getDay() + 7) % 7; cursor.setDate(cursor.getDate() + add); for (let index=0; index<5; index++) { const date = new Date(cursor); date.setDate(cursor.getDate() + index * 7); result.push(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`); } return result; }

Deno.serve(async (request) => {
  const origin=request.headers.get("origin");
  if(request.method==="OPTIONS") return allowed(origin) ? reply(200,{ok:true},origin) : reply(403,{error:"Origin is not allowed."},origin);
  if(request.method!=="POST") return reply(405,{error:"Method not allowed."},origin);
  if(!allowed(origin)) return reply(403,{error:"Origin is not allowed."},origin);
  const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key) return reply(503,{error:"Booking service is unavailable."},origin);
  try {
    const body=await request.json() as Record<string,unknown>; const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}); const action=text(body.action,20);
    if(action==="manage"||action==="cancel") {
      const token=text(body.token,50); if(!/^[0-9a-f-]{36}$/i.test(token)) return reply(400,{error:"Invalid booking link."},origin);
      const {data:booking,error}=await supabase.from("Class_Bookings").select("id,class_id,class_date,participant_name,status,created_at,Classes(class_name,program,day,start_time,end_time)").eq("access_token",token).maybeSingle();
      if(error) throw error; if(!booking) return reply(404,{error:"Booking not found."},origin);
      if(action==="cancel") { const {error:cancelError}=await supabase.rpc("cancel_public_class_booking",{p_access_token:token}); if(cancelError) throw cancelError; return reply(200,{ok:true,cancelled:true},origin); }
      return reply(200,{ok:true,booking},origin);
    }
    const classId=id(body.classId); if(!classId) return reply(400,{error:"Invalid class."},origin);
    const {data:classItem,error:classError}=await supabase.from("Classes").select("id,class_name,program,day,start_time,end_time,max_capacity,status,public_booking_enabled").eq("id",classId).eq("status","Active").eq("public_booking_enabled",true).maybeSingle();
    if(classError) throw classError; if(!classItem) return reply(404,{error:"This class is not accepting online bookings."},origin);
    if(action==="class") {
      const availableDates=datesFor(classItem.day); const {data:rows,error}=await supabase.from("Class_Bookings").select("class_date,status").eq("class_id",classId).in("class_date",availableDates).neq("status","Cancelled"); if(error) throw error;
      return reply(200,{ok:true,classItem:{id:classItem.id,className:classItem.class_name,program:classItem.program,day:classItem.day,startTime:classItem.start_time,endTime:classItem.end_time,capacity:classItem.max_capacity,dates:availableDates.map(date=>{const booked=(rows??[]).filter(row=>row.class_date===date&&row.status==="Booked").length;const waiting=(rows??[]).filter(row=>row.class_date===date&&row.status==="Waitlisted").length;return{date,booked,waiting,spotsLeft:Math.max(0,classItem.max_capacity-booked)};})}},origin);
    }
    if(action!=="book") return reply(400,{error:"Unsupported action."},origin); if(text(body.website,200)) return reply(400,{error:"Unable to submit booking."},origin);
    const name=text(body.name,120), phone=text(body.phone,30).replace(/\D/g,""), email=text(body.email,200).toLowerCase()||null, classDate=text(body.classDate,10);
    if(name.length<2) return reply(400,{error:"Enter your full name."},origin); if(phone.length<7||phone.length>15) return reply(400,{error:"Enter a valid phone number."},origin); if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400,{error:"Enter a valid email address."},origin);
    const {data:booking,error:bookingError}=await supabase.rpc("create_public_class_booking",{p_class_id:classId,p_class_date:classDate,p_name:name,p_phone:phone,p_email:email});
    if(bookingError){if(bookingError.code==="23505") return reply(409,{error:"This mobile number is already booked for that class."},origin); throw bookingError;}
    return reply(201,{ok:true,booking:{id:booking.id,status:booking.status,classDate:booking.class_date,token:booking.access_token}},origin);
  } catch(error){console.error("public-class-booking failed",error); return reply(500,{error:error instanceof Error&&error.message.includes("Bookings are")?error.message:"Unable to process the booking. Please try again."},origin);}
});
