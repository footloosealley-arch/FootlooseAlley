-- Footloose Alley Studio Manager v3.9.0 class schedule seed.
-- Safe to rerun: the natural schedule identity is checked before each insert.
INSERT INTO public."Classes"
  (class_name, program, day, start_time, end_time, instructor_id, status, max_capacity)
SELECT seed.class_name, seed.program, seed.day, seed.start_time, seed.end_time, NULL, 'Active', 20
FROM (VALUES
  ('Aerobics / ABS — Unisex Batch','Fitness','Monday','06:00','07:00'),
  ('Zumba / Resistance Band','Fitness','Tuesday','06:00','07:00'),
  ('Steppers / Medicine Ball','Fitness','Wednesday','06:00','07:00'),
  ('Dance Fitness / Toning','Fitness','Thursday','06:00','07:00'),
  ('Strong Nation / Yoga / Pilates','Fitness','Friday','06:00','07:00'),
  ('Aerobics / ABS','Fitness','Monday','07:15','08:15'),
  ('Dance Fitness / Resistance Band','Fitness','Tuesday','07:15','08:15'),
  ('Steppers / Medicine Ball','Fitness','Wednesday','07:15','08:15'),
  ('Zumba / Toning','Fitness','Thursday','07:15','08:15'),
  ('Strong Nation / Yoga / Pilates','Fitness','Friday','07:15','08:15'),
  ('Aerobics / ABS','Fitness','Monday','08:30','09:30'),
  ('Zumba / Resistance Band','Fitness','Tuesday','08:30','09:30'),
  ('Steppers / Medicine Ball','Fitness','Wednesday','08:30','09:30'),
  ('Dance Fitness / Toning','Fitness','Thursday','08:30','09:30'),
  ('Strong Nation / Yoga / Pilates','Fitness','Friday','08:30','09:30'),
  ('Zumba / ABS','Fitness','Monday','10:00','11:00'),
  ('Aerobics / Resistance Band','Fitness','Tuesday','10:00','11:00'),
  ('Dance Fitness / Toning','Fitness','Wednesday','10:00','11:00'),
  ('Steppers / Toning','Fitness','Thursday','10:00','11:00'),
  ('Yoga / Pilates','Fitness','Friday','10:00','11:00'),
  ('Aerobics / ABS','Fitness','Monday','17:30','18:30'),
  ('Zumba / Resistance Band','Fitness','Tuesday','17:30','18:30'),
  ('Steppers / Medicine Ball','Fitness','Wednesday','17:30','18:30'),
  ('Dance Fitness / Toning','Fitness','Thursday','17:30','18:30'),
  ('Strong Nation / Yoga / Pilates','Fitness','Friday','17:30','18:30'),
  ('Aerobics / ABS','Fitness','Monday','18:30','19:30'),
  ('Zumba / Resistance Band','Fitness','Tuesday','18:30','19:30'),
  ('Steppers / Medicine Ball','Fitness','Wednesday','18:30','19:30'),
  ('Dance Fitness / Toning','Fitness','Thursday','18:30','19:30'),
  ('Strong Nation / Yoga / Pilates','Fitness','Friday','18:30','19:30'),
  ('Aerobics / ABS','Fitness','Monday','19:30','20:30'),
  ('Zumba / Resistance Band','Fitness','Tuesday','19:30','20:30'),
  ('Steppers / Medicine Ball','Fitness','Wednesday','19:30','20:30'),
  ('Dance Fitness / Toning','Fitness','Thursday','19:30','20:30'),
  ('Strong Nation / Yoga / Pilates','Fitness','Friday','19:30','20:30'),
  ('Weekend Fitness Batch','Fitness','Saturday','08:00','09:00'),
  ('Weekend Fitness Batch','Fitness','Saturday','18:00','19:00'),
  ('Weekend Fitness Batch','Fitness','Sunday','09:00','10:00'),
  ('Kids'' Weekday Dance','Dance','Monday','16:30','17:30'),
  ('Kids'' Weekday Dance','Dance','Wednesday','16:30','17:30'),
  ('Kids'' Weekday Dance','Dance','Tuesday','16:30','17:30'),
  ('Kids'' Weekday Dance','Dance','Friday','16:30','17:30'),
  ('Kids'' Weekend Dance','Dance','Saturday','16:00','17:00'),
  ('Kids'' Weekend Dance','Dance','Sunday','10:00','11:00'),
  ('Adults'' Weekend Dance','Dance','Saturday','17:00','18:00'),
  ('Adults'' Weekend Dance','Dance','Sunday','11:00','12:00'),
  ('Adults'' Weekend Salsa','Salsa','Saturday','19:00','20:00'),
  ('Adults'' Weekend Salsa','Salsa','Sunday','12:00','13:00')
) AS seed(class_name, program, day, start_time, end_time)
WHERE NOT EXISTS (
  SELECT 1 FROM public."Classes" existing
  WHERE existing.class_name = seed.class_name
    AND existing.day = seed.day
    AND existing.start_time = seed.start_time
    AND existing.end_time = seed.end_time
);
