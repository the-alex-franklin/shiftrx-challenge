<script setup lang="ts">
import { ref, computed } from 'vue'
import { startOfWeek, addWeeks, format } from 'date-fns'
import WeekView from './components/WeekView.vue'
import ChatView from './components/ChatView.vue'

const baseDate = ref(new Date());
const weekStart = computed(() => startOfWeek(baseDate.value, { weekStartsOn: 1 }));
const weekLabel = computed(() => `Week of ${format(weekStart.value, 'MMM d, yyyy')}`);

const prevWeek = () => { baseDate.value = addWeeks(baseDate.value, -1) };
const nextWeek = () => { baseDate.value = addWeeks(baseDate.value, 1) };

const chatWidth = ref(384);
const isResizing = ref(false);

const startResize = (e: MouseEvent) => {
  isResizing.value = true;

  const onMove = (e: MouseEvent) => {
    const containerWidth = window.innerWidth;
    const newChatWidth = containerWidth - e.clientX;
    chatWidth.value = Math.min(Math.max(newChatWidth, 280), 700);
  }

  const onUp = () => {
    isResizing.value = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
</script>

<template>
  <div
    class="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden"
    :class="isResizing ? 'select-none cursor-col-resize' : ''"
  >
    <header class="flex items-center justify-between px-6 h-13 border-b border-slate-700 flex-shrink-0">
      <div class="flex items-center gap-4">
        <span class="text-lg font-semibold tracking-wide text-white">ShiftRx</span>
        <span class="text-xs text-slate-500 font-mono uppercase tracking-wider">{{ weekLabel }}</span>
      </div>
      <div class="flex gap-2">
        <button class="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 border border-slate-700 hover:border-slate-500 transition-colors" @click="prevWeek">← prev</button>
        <button class="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 border border-slate-700 hover:border-slate-500 transition-colors" @click="nextWeek">next →</button>
      </div>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <WeekView :week-start="weekStart" />

      <div
        class="w-1 flex-shrink-0 bg-slate-700 hover:bg-slate-500 cursor-col-resize transition-colors"
        :class="isResizing ? 'bg-slate-500' : ''"
        @mousedown="startResize"
      ></div>

      <ChatView :style="{ width: chatWidth + 'px' }" />
    </main>
  </div>
</template>