"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLASS_DAYS } from "@/services/classes.service";

interface Props {
  search: string;
  day: string;
  program: string;
  status: string;
  programs: string[];
  onSearch: (value: string) => void;
  onDay: (value: string) => void;
  onProgram: (value: string) => void;
  onStatus: (value: string) => void;
}

export default function ClassFilters(props: Props) {
  return (
    <div className="grid gap-3 border-b p-3 sm:p-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_repeat(3,12rem)]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-11 pl-9" type="search" aria-label="Search classes" placeholder="Search classes, programs or instructors" value={props.search} onChange={(event) => props.onSearch(event.target.value)} />
      </label>
      <Select value={props.day} onValueChange={(value) => props.onDay(value ?? "All")}>
        <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="All">All days</SelectItem>{CLASS_DAYS.map((day) => <SelectItem value={day} key={day}>{day}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={props.program} onValueChange={(value) => props.onProgram(value ?? "All")}>
        <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="All">All programs</SelectItem>{props.programs.map((program) => <SelectItem value={program} key={program}>{program}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={props.status} onValueChange={(value) => props.onStatus(value ?? "All")}>
        <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="All">All statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
      </Select>
    </div>
  );
}
