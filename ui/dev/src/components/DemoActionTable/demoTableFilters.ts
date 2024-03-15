import { computed } from "vue";
import { filterFieldOptions } from "./demoTableActions";

export const filterGroups = computed(() => [
  {
    name: "Dates",
    flat: true,
    fields: [
      {
        type: "date-range",
        name: "filterDateRange",
        label: "Run Date(s)",
        inline: true,
        calcValue: f => f.filterDateRange,
        filterBy: v => ({
          filterDateRange: v || undefined
        })
      },
    ]
  },
  {
    name: "Details",
    fields: [
      {
        type: "multi-select",
        name: "id",
        label: "Name",
        placeholder: "All Items",
        options: filterFieldOptions.value["names"],
      },
      {
        type: "multi-select",
        name: "status",
        label: "Status",
        placeholder: "All Statuses",
        options: filterFieldOptions.value["statuses"],
      },
    ]
  },
]);
