export type Schedule = {
  id: number;
  created_at?: string;

  class_name: string;
  instructor: string;
  program: string;

  day: string;

  start_time: string;
  end_time: string;

  capacity: number;

  status: string;
};