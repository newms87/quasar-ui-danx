import { fDate } from "@ui/helpers";

export const columns = [
  {
    name: "name",
    label: "Name",
    field: "name",
    sortable: true,
    align: "left",
  },
  {
    name: "start_date",
    label: "Start Date",
    field: "start_date",
    sortable: true,
    align: "left",
    format: fDate,
  },
  {
    name: "end_date",
    label: "End Date",
    field: "end_date",
    sortable: true,
    align: "left",
    format: fDate,
  },
  {
    name: "status",
    label: "Campaign Status",
    field: "status",
    align: "left",
    sortable: true,
  }
];
