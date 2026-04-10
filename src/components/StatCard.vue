<template>
  <div 
    class="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
    :class="{ 'border-l-4': highlight }"
    :style="highlight ? `border-left-color: ${accentColor}` : ''"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500 mb-1">{{ label }}</p>
        <p class="text-3xl font-bold" :class="valueColor">{{ value }}</p>
        <p v-if="subtitle" class="text-xs text-slate-400 mt-1">{{ subtitle }}</p>
      </div>
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        :class="iconBgClass"
      >
        <svg v-if="icon === 'users'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else-if="icon === 'check'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="icon === 'offer'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <svg v-else-if="icon === 'reject'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="icon === 'chart'" class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <svg v-else class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatCard",
  props: {
    label: { type: String, required: true },
    value: { type: [Number, String], required: true },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: 'chart' },
    variant: { type: String, default: 'default' },
    highlight: { type: Boolean, default: false },
    accentColor: { type: String, default: '#2563EB' }
  },
  computed: {
    valueColor() {
      const colors = {
        default: 'text-slate-800',
        primary: 'text-primary-800',
        success: 'text-emerald-600',
        warning: 'text-amber-600',
        danger: 'text-red-600',
        info: 'text-blue-600',
      }
      return colors[this.variant] || colors.default
    },
    iconBgClass() {
      const classes = {
        default: 'bg-slate-100',
        primary: 'bg-primary-100',
        success: 'bg-emerald-100',
        warning: 'bg-amber-100',
        danger: 'bg-red-100',
        info: 'bg-blue-100',
      }
      return classes[this.variant] || classes.default
    },
    iconClass() {
      const classes = {
        default: 'text-slate-600',
        primary: 'text-primary-700',
        success: 'text-emerald-600',
        warning: 'text-amber-600',
        danger: 'text-red-600',
        info: 'text-blue-600',
      }
      return classes[this.variant] || classes.default
    }
  }
}
</script>
