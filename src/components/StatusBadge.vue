<template>
  <span 
    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
    :class="statusClasses"
  >
    <span v-if="showDot" class="w-1.5 h-1.5 rounded-full mr-1.5" :class="dotClass"></span>
    {{ status }}
  </span>
</template>

<script>
export default {
  name: "StatusBadge",
  props: {
    status: { type: String, required: true },
    size: { type: String, default: 'default' },
    showDot: { type: Boolean, default: true }
  },
  computed: {
    statusClasses() {
      const classes = {
        'Applied': 'bg-slate-100 text-slate-700',
        'Screening': 'bg-amber-100 text-amber-800',
        'Interview': 'bg-purple-100 text-purple-800',
        'Selected': 'bg-emerald-100 text-emerald-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Hold': 'bg-orange-100 text-orange-800',
        'Offer': 'bg-blue-100 text-blue-800',
        'Hired': 'bg-green-100 text-green-800',
        'Open': 'bg-emerald-100 text-emerald-800',
        'In Review': 'bg-amber-100 text-amber-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Closed': 'bg-slate-100 text-slate-600',
      }
      return classes[this.status] || 'bg-gray-100 text-gray-700'
    },
    dotClass() {
      const dots = {
        'Applied': 'bg-slate-500',
        'Screening': 'bg-amber-500',
        'Interview': 'bg-purple-500',
        'Selected': 'bg-emerald-500',
        'Rejected': 'bg-red-500',
        'Hold': 'bg-orange-500',
        'Offer': 'bg-blue-500',
        'Hired': 'bg-green-500',
        'Open': 'bg-emerald-500',
        'In Review': 'bg-amber-500',
        'In Progress': 'bg-blue-500',
        'Closed': 'bg-slate-400',
      }
      return dots[this.status] || 'bg-gray-500'
    }
  }
}
</script>
