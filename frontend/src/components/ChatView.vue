<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const messages = ref<Message[]>([]);

const input = ref('');
const isLoading = ref(false);
const messagesEl = ref<HTMLElement>();
const inputEl = ref<HTMLTextAreaElement>();

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function scrollToBottom() {
  await nextTick();
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
}

function autoResize() {
  if (!inputEl.value) return;
  inputEl.value.style.height = 'auto';
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 120) + 'px';
}

onMounted(async () => {
  try {
    const res = await fetch('/api/chat');
    const history = await res.json();
    const displayable = history.filter(
      (m: { role: string; content: string | null; tool_calls?: unknown }) =>
        (m.role === 'user' || m.role === 'assistant') && m.content && !m.tool_calls
    );
    if (displayable.length === 0) {
      messages.value.push({ id: '0', role: 'assistant', content: 'How can I help you?', time: getTime() });
    } else {
      messages.value = displayable.map((m: { role: 'user' | 'assistant'; content: string }) => ({
        id: crypto.randomUUID(),
        role: m.role,
        content: m.content,
        time: getTime(),
      }));
    }
  } catch {
    messages.value.push({ id: '0', role: 'assistant', content: 'How can I help you?', time: getTime() });
  }
  await scrollToBottom();
});

async function send() {
  const text = input.value.trim();
  if (!text || isLoading.value) return;

  messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text, time: getTime() });
  input.value = '';
  if (inputEl.value) inputEl.value.style.height = 'auto';
  isLoading.value = true;
  await scrollToBottom();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    });
    const data = await res.json();
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: data.message, time: getTime() });
  } catch {
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: 'Something went wrong. Try again.', time: getTime() });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
    inputEl.value?.focus();
  }
}
</script>

<template>
  <aside class="flex flex-col w-96 border-l border-slate-700 bg-slate-900 flex-shrink-0">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800 flex-shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :class="isLoading ? 'bg-slate-500' : 'bg-green-400'"></div>
        <span class="text-sm font-semibold text-white tracking-wide">Holly</span>
      </div>
      <span class="text-xs text-slate-500 font-mono">AI Scheduling Agent</span>
    </div>

    <div ref="messagesEl" class="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col gap-1"
        :class="msg.role === 'user' ? 'items-end' : 'items-start'"
      >
        <div
          class="max-w-[85%] text-sm leading-relaxed px-3 py-2 rounded-sm whitespace-pre-wrap"
          :class="msg.role === 'user'
            ? 'bg-slate-700 text-slate-100'
            : 'bg-slate-800 text-slate-200 border border-slate-700'"
        >
          {{ msg.content }}
        </div>
        <span class="text-xs text-slate-600 font-mono px-1">{{ msg.time }}</span>
      </div>

      <div v-if="isLoading" class="flex items-start">
        <div class="bg-slate-800 border border-slate-700 rounded-sm px-3 py-2 flex gap-1 items-center">
          <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-700 flex items-end bg-slate-800 flex-shrink-0">
      <textarea
        ref="inputEl"
        v-model="input"
        rows="1"
        placeholder="Message Holly..."
        class="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600 font-mono px-4 py-3 resize-none outline-none leading-relaxed"
        :disabled="isLoading"
        @keydown.enter.exact.prevent="send"
        @input="autoResize"
      ></textarea>
      <button
        class="px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors flex-shrink-0"
        :class="input.trim() && !isLoading
          ? 'text-slate-300 hover:text-white cursor-pointer'
          : 'text-slate-600 cursor-not-allowed'"
        :disabled="!input.trim() || isLoading"
        @click="send"
      >
        send
      </button>
    </div>
  </aside>
</template>