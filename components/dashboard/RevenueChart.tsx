"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


type RevenueData = {
  month: string;
  revenue: number;
};


type Props = {
  data: RevenueData[];
};



function formatCurrency(value: number) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);

}




export default function RevenueChart({
  data,
}: Props) {


  return (

    <Card className="shadow-lg">


      <CardHeader>

        <CardTitle>
          Monthly Revenue
        </CardTitle>

      </CardHeader>




      <CardContent>


        <div className="h-[320px]">


          {data.length === 0 ? (

            <div className="
            flex
            h-full
            items-center
            justify-center
            text-slate-500
            ">

              No revenue data available

            </div>


          ) : (


          <ResponsiveContainer
            width="100%"
            height="100%"
          >


            <LineChart
              data={data}
            >


              <CartesianGrid
                strokeDasharray="3 3"
              />



              <XAxis
                dataKey="month"
              />



              <YAxis
                tickFormatter={(value)=>
                  `₹${value}`
                }
              />



              <Tooltip

                formatter={(value)=>
                  formatCurrency(
                    Number(value)
                  )
                }

              />



              <Line

                type="monotone"

                dataKey="revenue"

                strokeWidth={3}

                dot

              />


            </LineChart>


          </ResponsiveContainer>


          )}


        </div>


      </CardContent>


    </Card>

  );

}