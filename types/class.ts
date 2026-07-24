export interface StudioClass {
  id: number;

  created_at: string;

  class_name: string;

  instructor: string | null;

  program: string | null;

  day: string | null;

  start_time: string | null;

  end_time: string | null;

  capacity: number;

  status: string | null;
}