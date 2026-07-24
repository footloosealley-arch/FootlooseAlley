import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};


export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {


  return (

    <div className="
    mb-8
    flex
    flex-col
    gap-4
    md:flex-row
    md:items-center
    md:justify-between
    ">


      <div>

        <h1 className="
        text-3xl
        font-bold
        tracking-tight
        text-slate-800
        ">

          {title}

        </h1>


        {
          description && (

            <p className="
            mt-2
            text-slate-500
            ">

              {description}

            </p>

          )
        }


      </div>





      {
        action && (

          <div>

            {action}

          </div>

        )
      }





    </div>

  );

}