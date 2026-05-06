<script setup lang="ts">
defineProps<{
  shift: {
    id: string
    providerName: string
    role: string
    startTime: string
    endTime: string
    status: 'scheduled' | 'cancelled' | 'uncovered' | 'filled'
  }
}>();

const statusStyles: Record<string, string> = {
  scheduled: 'border-slate-600 bg-slate-800',
  cancelled: 'border-slate-700 bg-slate-800 opacity-50',
  uncovered: 'border-red-800 bg-red-950',
  filled: 'border-green-800 bg-green-950',
};

const statusBadgeStyles: Record<string, string> = {
  scheduled: 'text-green-400',
  cancelled: 'text-slate-500 line-through',
  uncovered: 'text-red-400',
  filled: 'text-green-400',
};
</script>

<template>
  <div
    class="flex flex-col gap-1 p-2 border rounded-sm cursor-default transition-colors"
    :class="statusStyles[shift.status]"
  >
    <span class="text-xs font-mono text-slate-400">{{ shift.startTime }}–{{ shift.endTime }}</span>
    <span class="text-sm font-medium text-slate-100 leading-tight">{{ shift.providerName }}</span>
    <div class="flex items-center justify-between mt-1 overflow-hidden">
      <span class="text-xs text-slate-500 uppercase tracking-wide">{{ shift.role }}</span>
      <span class="text-xs font-mono" :class="statusBadgeStyles[shift.status]">{{ shift.status }}</span>
    </div>
  </div>
</template>
