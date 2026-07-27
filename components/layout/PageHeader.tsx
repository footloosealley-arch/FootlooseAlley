import { ReactNode } from "react";

<<<<<<< HEAD
interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}
=======
type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a

export default function PageHeader({
  title,
  description,
  action,
<<<<<<< HEAD
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
=======
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

>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}