<template>
  <span 
    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
    :class="statusClasses"
  >
    <span v-if="showDot" class="w-1.5 h-1.5 rounded-full mr-1.5" :class="dotClass"></span>
    {{ displayStatus }}
  </span>
</template>

<script>
export default {
  name: "StatusBadge",
  props: {
    status: { type: [String, Number], required: true },
    size: { type: String, default: 'default' },
    showDot: { type: Boolean, default: true }
  },
  computed: {
    displayStatus() {
      const stageNames = {
        1: 'Applied', 2: 'Screening', 3: 'Technical Interview',
        4: 'Technical Selected', 5: 'Technical Rejected', 6: 'Technical Hold',
        7: 'HR Selected', 8: 'HR Rejected', 9: 'HR Hold',
        10: 'Director Review', 11: 'Director Selected', 12: 'Director Rejected',
        13: 'Offer Released', 14: 'Offer Accepted', 15: 'Offer Revoked',
        'Applied': 'Applied', 'Screening': 'Screening', 'Technical Interview': 'Technical Interview',
        'Technical Selected': 'Technical Selected', 'Technical Rejected': 'Technical Rejected', 'Technical Hold': 'Technical Hold',
        'HR Selected': 'HR Selected', 'HR Rejected': 'HR Rejected', 'HR Hold': 'HR Hold',
        'Director Review': 'Director Review', 'Director Selected': 'Director Selected', 'Director Rejected': 'Director Rejected',
        'Offer Released': 'Offer Released', 'Offer Accepted': 'Offer Accepted', 'Offer Revoked': 'Offer Revoked'
      }
      return stageNames[this.status] || this.status
    },
    statusClasses() {
      const classes = {
        'Applied': 'bg-slate-100 text-slate-700',
        'Screening': 'bg-amber-100 text-amber-800',
        'Technical Interview': 'bg-purple-100 text-purple-800',
        'Technical Selected': 'bg-emerald-100 text-emerald-800',
        'Technical Rejected': 'bg-red-100 text-red-800',
        'Technical Hold': 'bg-orange-100 text-orange-800',
        'HR Selected': 'bg-blue-100 text-blue-800',
        'HR Rejected': 'bg-red-100 text-red-800',
        'HR Hold': 'bg-orange-100 text-orange-800',
        'Director Review': 'bg-indigo-100 text-indigo-800',
        'Director Selected': 'bg-emerald-100 text-emerald-800',
        'Director Rejected': 'bg-red-100 text-red-800',
        'Offer Released': 'bg-cyan-100 text-cyan-800',
        'Offer Accepted': 'bg-green-100 text-green-800',
        'Offer Revoked': 'bg-gray-100 text-gray-800',
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
      return classes[this.displayStatus] || 'bg-gray-100 text-gray-700'
    },
    dotClass() {
      const dots = {
        'Applied': 'bg-slate-500',
        'Screening': 'bg-amber-500',
        'Technical Interview': 'bg-purple-500',
        'Technical Selected': 'bg-emerald-500',
        'Technical Rejected': 'bg-red-500',
        'Technical Hold': 'bg-orange-500',
        'HR Selected': 'bg-blue-500',
        'HR Rejected': 'bg-red-500',
        'HR Hold': 'bg-orange-500',
        'Director Review': 'bg-indigo-500',
        'Director Selected': 'bg-emerald-500',
        'Director Rejected': 'bg-red-500',
        'Offer Released': 'bg-cyan-500',
        'Offer Accepted': 'bg-green-500',
        'Offer Revoked': 'bg-gray-500',
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
      return dots[this.displayStatus] || 'bg-gray-500'
    }
  }
}
</script>
