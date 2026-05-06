<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { addDays, format, isToday } from 'date-fns';
import ShiftCard from './ShiftCard.vue';

const props = defineProps<{ weekStart: Date }>();

type Provider = {
  id: string;
  name: string;
  role: string;
}

type Shift = {
  id: string;
  startTime: string;
  endTime: string;
  role: string;
  status: 'scheduled' | 'cancelled' | 'uncovered' | 'filled';
  provider: Provider;
}

const shifts = ref<Shift[]>([]);

watchEffect(async () => {
  const start = props.weekStart.toISOString();
  const end = addDays(props.weekStart, 7).toISOString();
  const res = await fetch(`/api/shifts?start=${start}&end=${end}`);
  shifts.value = await res.json();
});

const days = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(props.weekStart, i);
    const iso = format(date, 'yyyy-MM-dd');
    return {
      iso,
      name: format(date, 'EEE'),
      date: format(date, 'MMM d'),
      isToday: isToday(date),
      shifts: shifts.value
        .filter(s => format(new Date(s.startTime), 'yyyy-MM-dd') === iso)
        .map(s => ({
          id: s.id,
          providerName: s.provider?.name ?? "Unassigned",
          role: s.role,
          startTime: format(new Date(s.startTime), 'HH:mm'),
          endTime: format(new Date(s.endTime), 'HH:mm'),
          status: s.status,
        })),
    };
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
