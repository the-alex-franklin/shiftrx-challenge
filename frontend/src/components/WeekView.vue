<script setup lang="ts">
import { computed } from 'vue';
import { addDays, format, isToday } from 'date-fns';
import ShiftCard from './ShiftCard.vue';

const props = defineProps<{ weekStart: Date }>();

// AI generated seed/placeholder data
const SEED_SHIFTS = [
  { id: '1', providerName: 'Dr. Okafor', role: 'Physician', startTime: '07:00', endTime: '15:00', status: 'scheduled', dayOffset: 0 },
  { id: '2', providerName: 'N. Reyes', role: 'Nurse', startTime: '07:00', endTime: '19:00', status: 'scheduled', dayOffset: 0 },
  { id: '3', providerName: 'T. Lindqvist', role: 'Tech', startTime: '15:00', endTime: '23:00', status: 'scheduled', dayOffset: 0 },
  { id: '4', providerName: 'Dr. Okafor', role: 'Physician', startTime: '07:00', endTime: '15:00', status: 'scheduled', dayOffset: 1 },
  { id: '5', providerName: 'M. Chen', role: 'Nurse', startTime: '11:00', endTime: '23:00', status: 'cancelled', dayOffset: 1 },
  { id: '6', providerName: 'Dr. Patel', role: 'Physician', startTime: '15:00', endTime: '23:00', status: 'scheduled', dayOffset: 2 },
  { id: '7', providerName: 'N. Reyes', role: 'Nurse', startTime: '07:00', endTime: '19:00', status: 'scheduled', dayOffset: 2 },
  { id: '8', providerName: 'T. Lindqvist', role: 'Tech', startTime: '07:00', endTime: '15:00', status: 'scheduled', dayOffset: 3 },
  { id: '9', providerName: 'Dr. Russo', role: 'Physician', startTime: '07:00', endTime: '19:00', status: 'uncovered', dayOffset: 3 },
  { id: '10', providerName: 'M. Chen', role: 'Nurse', startTime: '07:00', endTime: '15:00', status: 'scheduled', dayOffset: 4 },
  { id: '11', providerName: 'Dr. Patel', role: 'Physician', startTime: '15:00', endTime: '23:00', status: 'scheduled', dayOffset: 4 },
];

const days = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(props.weekStart, i);
    return {
      iso: format(date, 'yyyy-MM-dd'),
      name: format(date, 'EEE'),
      date: format(date, 'MMM d'),
      isToday: isToday(date),
      shifts: SEED_SHIFTS.filter(s => s.dayOffset === i),
    }
  });
});
</script>

<template>
  <section class="flex flex-1 overflow-x-auto border-r border-slate-700">
    <div
      v-for="day in days"
      :key="day.iso"
      class="flex flex-col flex-1 min-w-32 border-r border-slate-700 last:border-r-0"
    >
      <div
        class="flex flex-col gap-0.5 px-3 py-2 border-b border-slate-700 flex-shrink-0"
        :class="day.isToday ? 'bg-slate-600' : 'bg-slate-800'"
      >
        <span class="text-xs font-semibold uppercase tracking-widest" :class="day.isToday ? 'text-white' : 'text-slate-400'">{{ day.name }}</span>
        <span class="text-xs font-mono" :class="day.isToday ? 'text-slate-200' : 'text-slate-500'">{{ day.date }}</span>
      </div>

      <div class="flex flex-col gap-2 p-2 overflow-y-auto flex-1 bg-slate-900">
        <ShiftCard
          v-for="shift in day.shifts"
          :key="shift.id"
          :shift="shift"
        />
        <div v-if="day.shifts.length === 0" class="text-slate-600 text-xs font-mono text-center mt-4">—</div>
      </div>
    </div>
  </section>
</template>