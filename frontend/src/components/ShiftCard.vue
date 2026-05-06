<script setup lang="ts">
defineProps<{
  shift: {
    id: string
    providerName: string
    role: string
    startTime: string
    endTime: string
    status: 'scheduled' | 'cancelled'
  }
}>();

const statusStyles: Record<string, string> = {
  scheduled: 'border-slate-600 bg-slate-800',
  cancelled: 'border-red-800 bg-red-950',
};

const statusBadgeStyles: Record<string, string> = {
  scheduled: 'text-green-400',
  cancelled: 'text-red-400',
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
